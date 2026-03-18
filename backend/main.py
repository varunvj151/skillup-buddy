import os
import re
import json
import math
import tempfile
import traceback
from collections import Counter
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="SkillUp Buddy – GD Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Load Whisper model once at startup
# ---------------------------------------------------------------------------
print("Loading Whisper model (base)…")
whisper_model = whisper.load_model("base")
print("Whisper model loaded ✓")

# ---------------------------------------------------------------------------
# Configure Gemini
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.0-flash")
    print("Gemini API configured ✓")
else:
    gemini_model = None
    print("⚠  GEMINI_API_KEY not set – /api/evaluate will return mock data")

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class EvaluateRequest(BaseModel):
    topic: str
    transcript: str

class EvaluateInterviewRequest(BaseModel):
    interview_type: str
    questions: list[str]
    transcripts: list[str]


# ===================================================================
#  TRANSCRIPT VALIDATION HELPERS
# ===================================================================

def _word_count(text: str) -> int:
    """Return the number of words in *text*."""
    return len(text.split())


def _find_repeated_phrases(text: str, min_phrase_len: int = 3, max_repetitions: int = 3) -> list[str]:
    """Return phrases (of *min_phrase_len* words) that appear more than
    *max_repetitions* times in *text*.
    """
    words = text.lower().split()
    phrase_counts: Counter = Counter()

    for length in range(min_phrase_len, min(min_phrase_len + 4, len(words) + 1)):
        for i in range(len(words) - length + 1):
            phrase = " ".join(words[i : i + length])
            phrase_counts[phrase] += 1

    return [
        phrase
        for phrase, count in phrase_counts.items()
        if count > max_repetitions
    ]


def _compute_topic_relevance(topic: str, transcript: str) -> int:
    """Compute a topic-relevance score from 0–10 based on keyword overlap.

    Strategy:
    - Extract meaningful words (>=3 chars) from the topic.
    - Generate a broader keyword set with common synonyms / related terms.
    - Count how many topic keywords appear in the transcript.
    - Map the hit-ratio to a 0–10 score.
    """
    # Stopwords we want to ignore in the topic
    STOPWORDS = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "need", "dare", "ought",
        "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
        "as", "into", "through", "during", "before", "after", "above", "below",
        "between", "out", "off", "over", "under", "again", "further", "then",
        "once", "here", "there", "when", "where", "why", "how", "all", "each",
        "every", "both", "few", "more", "most", "other", "some", "such", "no",
        "nor", "not", "only", "own", "same", "so", "than", "too", "very",
        "just", "because", "but", "and", "or", "if", "while", "about", "up",
        "its", "it", "this", "that", "these", "those", "what", "which", "who",
        "whom", "his", "her", "their", "our", "my", "your",
    }

    # ── Related-word expansions for common GD topics ──
    TOPIC_EXPANSIONS: dict[str, list[str]] = {
        "ai": ["artificial intelligence", "machine learning", "automation", "robots", "technology", "algorithm", "deep learning"],
        "job": ["employment", "work", "career", "profession", "hiring", "unemployment", "labor", "worker"],
        "social media": ["facebook", "instagram", "twitter", "tiktok", "online", "internet", "platform", "network", "digital"],
        "education": ["college", "university", "school", "degree", "learning", "student", "academic", "knowledge"],
        "climate": ["environment", "global warming", "pollution", "carbon", "emission", "sustainability", "green", "renewable"],
        "work from home": ["remote", "wfh", "telecommute", "hybrid", "office", "commute", "virtual"],
        "health": ["medical", "hospital", "disease", "fitness", "mental health", "wellness", "healthcare"],
        "technology": ["tech", "digital", "software", "hardware", "innovation", "computer", "internet"],
        "success": ["achievement", "career", "goal", "growth", "progress", "ambition"],
        "youth": ["young", "generation", "millennial", "teenager", "student", "adolescent"],
        "responsibility": ["duty", "accountability", "obligation", "role"],
        "replace": ["replacement", "substitute", "automate", "displace", "eliminate"],
        "boon": ["benefit", "advantage", "positive", "helpful", "useful"],
        "bane": ["harm", "disadvantage", "negative", "harmful", "dangerous", "toxic"],
        "higher": ["college", "university", "postgraduate", "degree", "masters", "phd"],
    }

    # Extract topic keywords
    topic_lower = topic.lower()
    topic_words = set(
        w for w in re.findall(r"[a-z]+", topic_lower)
        if len(w) >= 3 and w not in STOPWORDS
    )

    # Expand with related terms
    expanded_keywords = set(topic_words)
    for trigger, expansions in TOPIC_EXPANSIONS.items():
        if trigger in topic_lower:
            for exp in expansions:
                expanded_keywords.update(
                    w for w in exp.split() if len(w) >= 3 and w not in STOPWORDS
                )

    if not expanded_keywords:
        # Can't evaluate relevance — assume neutral
        return 5

    # Count keyword hits in the transcript
    transcript_lower = transcript.lower()
    transcript_words = set(re.findall(r"[a-z]+", transcript_lower))

    hits = expanded_keywords & transcript_words
    ratio = len(hits) / len(expanded_keywords)

    # Also check for multi-word phrase matches from expansions
    phrase_bonus = 0
    for trigger, expansions in TOPIC_EXPANSIONS.items():
        if trigger in topic_lower:
            for phrase in expansions:
                if " " in phrase and phrase in transcript_lower:
                    phrase_bonus += 1

    raw_score = ratio * 8 + min(phrase_bonus, 2)
    return max(0, min(10, round(raw_score)))


def _validate_transcript(topic: str, transcript: str) -> dict | None:
    """Run pre-evaluation validation checks on the transcript.

    Returns *None* if the transcript passes all checks.
    Otherwise returns a full evaluation dict with low scores and
    specific feedback about what went wrong.
    """
    flags: list[str] = []
    reasons: list[str] = []
    wc = _word_count(transcript)

    # ── Check 1: Insufficient length ──
    if wc < 40:
        flags.append("insufficient_response")
        reasons.append(
            f"Your response was only {wc} words. A meaningful GD contribution "
            "requires at least 40 words with substantive arguments."
        )

    # ── Check 2: Repeated phrases ──
    repeated = _find_repeated_phrases(transcript)
    if repeated:
        flags.append("low_communication_quality")
        sample = repeated[:3]
        reasons.append(
            f"Repeated phrases detected ({len(repeated)} total): "
            + ", ".join(f'"{p}"' for p in sample)
            + ". Excessive repetition indicates poor communication quality."
        )

    # ── Check 3: Off-topic ──
    relevance = _compute_topic_relevance(topic, transcript)
    if relevance < 3:
        flags.append("off_topic")
        reasons.append(
            f"The speech does not meaningfully address the topic \"{topic}\". "
            f"Topic relevance score: {relevance}/10."
        )

    if not flags:
        return None

    # ── Build low-score result ──
    # Base score depends on severity
    base = 30
    if "insufficient_response" in flags:
        base = min(base, 15 + wc)  # shorter = lower
    if "off_topic" in flags:
        base = min(base, 20)
    if "low_communication_quality" in flags:
        base = min(base, 25)
    base = max(10, min(30, base))  # clamp 10–30

    cat_score = max(1, base // 10)  # 1–3

    return {
        "scores": {
            "content": {
                "score": cat_score if "off_topic" not in flags else 1,
                "explanation": (
                    "The speech did not address the given topic."
                    if "off_topic" in flags
                    else "Very limited content was provided."
                ),
            },
            "clarity": {
                "score": cat_score,
                "explanation": "Insufficient content to assess clarity of thought.",
            },
            "communication": {
                "score": max(1, cat_score - 1) if "low_communication_quality" in flags else cat_score,
                "explanation": (
                    "Excessive repetition of phrases indicates poor communication."
                    if "low_communication_quality" in flags
                    else "Not enough speech to evaluate communication skills."
                ),
            },
            "confidence": {
                "score": cat_score,
                "explanation": "Cannot assess confidence from such a brief or irrelevant response.",
            },
            "structure": {
                "score": max(1, cat_score - 1),
                "explanation": "No clear introduction, body, or conclusion was present.",
            },
        },
        "overall_score": base,
        "strengths": [
            "Attempted to participate in the discussion."
        ],
        "improvements": reasons,
        "tips": [
            "Speak for at least 1–2 minutes with clear arguments for and against the topic.",
            "Structure your response: start with an introduction, present 2–3 key points, and end with a conclusion.",
            "Use specific examples, data, or real-world references to support your arguments.",
        ],
        "validation_flags": flags,
    }


# ===================================================================
#  POST-AI SCORE ADJUSTMENT
# ===================================================================

def _adjust_scores_for_relevance(evaluation: dict, topic: str, transcript: str) -> dict:
    """Apply server-side caps when topic relevance is low, even if the AI
    returned generous scores.
    """
    relevance = _compute_topic_relevance(topic, transcript)

    if relevance >= 3:
        return evaluation

    # Cap overall score
    evaluation["overall_score"] = min(evaluation.get("overall_score", 0), 30)

    # Cap each category
    scores = evaluation.get("scores", {})
    for key in scores:
        entry = scores[key]
        if isinstance(entry, dict) and "score" in entry:
            entry["score"] = min(entry["score"], 3)
        elif isinstance(entry, (int, float)):
            scores[key] = min(entry, 3)

    # Inject relevance warning into improvements
    improvements = evaluation.get("improvements", [])
    relevance_note = (
        f"Your speech did not address the topic \"{topic}\". "
        f"Topic relevance: {relevance}/10. Focus on discussing the given topic."
    )
    if relevance_note not in improvements:
        improvements.insert(0, relevance_note)
    evaluation["improvements"] = improvements

    if "validation_flags" not in evaluation:
        evaluation["validation_flags"] = []
    if "off_topic" not in evaluation["validation_flags"]:
        evaluation["validation_flags"].append("off_topic")

    return evaluation


# ---------------------------------------------------------------------------
# POST /api/transcribe
# ---------------------------------------------------------------------------
@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Accept an audio file, run Whisper, return transcript."""
    if not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    # Save uploaded file to a temp location
    suffix = Path(audio.filename).suffix or ".webm"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        contents = await audio.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")
        tmp.write(contents)
        tmp.close()

        # Transcribe with Whisper
        result = whisper_model.transcribe(tmp.name)
        transcript = result.get("text", "").strip()

        if not transcript:
            return {"transcript": "(No speech detected in the audio.)"}

        return {"transcript": transcript}

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}")
    finally:
        # Cleanup temp file
        try:
            os.unlink(tmp.name)
        except OSError:
            pass

# ---------------------------------------------------------------------------
# POST /api/evaluate
# ---------------------------------------------------------------------------
EVALUATION_PROMPT = """You are a STRICT and REALISTIC campus placement interviewer evaluating a candidate's Group Discussion (GD) performance. You must be brutally honest — do NOT inflate scores or give generic positive feedback.

**Topic:** {topic}

**Candidate's speech transcript:**
\"\"\"{transcript}\"\"\"

═══════════════════════════════════════════════════  
MANDATORY EVALUATION RULES (violating any of these is UNACCEPTABLE):
═══════════════════════════════════════════════════  

1. **Topic Relevance Check (CRITICAL)**
   - Read the transcript carefully. Does it ACTUALLY discuss "{topic}"?
   - If the transcript does NOT discuss the topic, Content Knowledge MUST be 1–2/10 and Overall Score MUST be below 25.
   - Greetings such as "hello", "hi", "good morning", "thank you" are NOT GD content. Ignore them entirely when scoring.

2. **Length & Substance Check**
   - If the transcript has fewer than 3–4 substantive sentences, ALL scores must be 1–4/10.
   - A one-liner or a few words cannot score above 20/100 overall.

3. **Repetition Penalty**
   - If the candidate repeats the same phrase or sentence multiple times, penalize Communication Skills heavily (1–3/10).
   - Mention the specific repeated phrases in your feedback.

4. **Argument Quality**
   - If there are NO arguments, examples, data points, or supporting evidence → Content Knowledge: 1–3/10, Argument Structure: 1–3/10.
   - If arguments exist but are shallow or unsupported → Content: 3–5/10.

5. **Structure Check**
   - A proper GD response has: introduction → key points → conclusion.
   - If ANY of these is missing, Argument Structure MUST be below 5/10.
   - If ALL are missing, Argument Structure MUST be 1–2/10.

6. **Scoring Calibration**
   - A 7–8/10 means EXCELLENT performance in that category. Reserve it for genuinely impressive responses.
   - A 9–10/10 is EXCEPTIONAL and nearly unheard of. Almost never give this.
   - An average college student speaking briefly should score 3–5 per category, NOT 6–8.
   - The overall score is NOT a simple average — weight Content Knowledge and Structure more heavily.

7. **Feedback Must Reference the Actual Transcript**
   - In strengths, mention SPECIFIC things the candidate said well (quote or paraphrase).
   - In improvements, mention SPECIFIC weaknesses from the transcript.
   - If the speech is too short, SAY SO explicitly.
   - If arguments are missing, SAY SO explicitly.
   - If the speech is off-topic, SAY SO explicitly.
   - Do NOT give generic feedback like "Good job!" or "Keep practicing!"

═══════════════════════════════════════════════════  

Evaluate across these 5 criteria (score 0–10 each, with honest 1–2 sentence explanation):

1. **Content Knowledge** – relevance to the topic, depth of points, use of facts/examples
2. **Clarity of Thought** – logical flow, coherent arguments, no contradictions
3. **Communication Skills** – vocabulary, grammar, fluency, absence of fillers/repetition
4. **Confidence** – assertiveness, firm tone, conviction in arguments
5. **Argument Structure** – clear introduction, well-organized body, strong conclusion

Also provide:
- **Strengths**: 2–3 bullet points (ONLY genuine strengths from the transcript; if none exist, say "No notable strengths identified")
- **Areas for Improvement**: 2–3 bullet points with SPECIFIC, actionable feedback referencing the transcript
- **Tips**: 2–3 practical tips for future GDs
- **Overall Score**: 0–100 (must realistically reflect the quality — be harsh, not generous)

Respond ONLY with a valid JSON object in exactly this format (no extra text, no markdown fences):
{{
  "scores": {{
    "content": {{"score": <int>, "explanation": "<string>"}},
    "clarity": {{"score": <int>, "explanation": "<string>"}},
    "communication": {{"score": <int>, "explanation": "<string>"}},
    "confidence": {{"score": <int>, "explanation": "<string>"}},
    "structure": {{"score": <int>, "explanation": "<string>"}}
  }},
  "overall_score": <int>,
  "strengths": ["<string>", ...],
  "improvements": ["<string>", ...],
  "tips": ["<string>", ...]
}}"""


@app.post("/api/evaluate")
async def evaluate_gd(req: EvaluateRequest):
    """Evaluate a GD transcript using Gemini AI with strict validation."""
    if not req.transcript or not req.topic:
        raise HTTPException(status_code=400, detail="Both topic and transcript are required.")

    # ── Step 1: Pre-validation ──
    validation_result = _validate_transcript(req.topic, req.transcript)
    if validation_result is not None:
        print(f"⚠ Transcript failed validation: {validation_result.get('validation_flags')}")
        return validation_result

    # ── Step 2: AI evaluation (only if validation passed) ──
    if not gemini_model:
        return _mock_evaluation()

    prompt = EVALUATION_PROMPT.format(topic=req.topic, transcript=req.transcript)

    try:
        response = gemini_model.generate_content(prompt)
        raw_text = response.text.strip()

        # Strip markdown fences if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1] if "\n" in raw_text else raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3].strip()
        if raw_text.startswith("json"):
            raw_text = raw_text[4:].strip()

        data = json.loads(raw_text)

        # ── Step 3: Post-AI score adjustment ──
        data = _adjust_scores_for_relevance(data, req.topic, req.transcript)

        return data

    except json.JSONDecodeError as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {exc}")
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {exc}")


INTERVIEW_EVALUATION_PROMPT = """You are a STRICT and REALISTIC campus placement interviewer evaluating a candidate's {interview_type} Interview performance. You must be brutally honest.

Here are the questions asked and the candidate's transcribed answers, along with any system validation notes:
{qa_pairs}

═══════════════════════════════════════════════════
MANDATORY EVALUATION RULES (violating any of these is UNACCEPTABLE):
1. Length Check: If an answer is flagged as 'very short answer' (<10 words), the Answer Quality and Communication scores for that question MUST be low (1-3/10).
2. Repetition: If the candidate repeats phrases, heavily penalize the Communication score.
3. Relevance: If the answer does not address the specific question topic, penalize Answer Quality heavily (1-2/10).
4. Do NOT inflate scores. An average response should be 4-6/10. 9-10/10 is for exceptional answers only.
5. Provide specific feedback for each question referencing the candidate's exact words.
═══════════════════════════════════════════════════

Evaluate across these 6 criteria (score 0-10 each) for the OVERALL interview:
1. Communication
2. Confidence
3. Answer Quality
4. Clarity
5. Professionalism
6. Response Structure

Respond ONLY with a valid JSON strictly following this schema (no extra text, no markdown fences):
{{
  "overall_score": <int 0-100>,
  "communication": <int>,
  "confidence": <int>,
  "answer_quality": <int>,
  "clarity": <int>,
  "professionalism": <int>,
  "response_structure": <int>,
  "strengths": ["<string>", "<string>", "<string>"],
  "improvements": ["<string>", "<string>", "<string>"],
  "suggestions": ["<string>", "<string>", "<string>"],
  "per_question_feedback": [
    {{
      "question": "<string>",
      "answer": "<string>",
      "score": <int 0-10>,
      "feedback": "<string>"
    }}
  ]
}}"""

@app.post("/api/evaluate-interview")
async def evaluate_interview(req: EvaluateInterviewRequest):
    """Evaluate an interview session using Gemini AI."""
    if len(req.questions) != len(req.transcripts):
        raise HTTPException(status_code=400, detail="Questions and transcripts count mismatch.")

    # ── Pre-validation step ──
    qa_pairs_text = ""
    for i, (q, a) in enumerate(zip(req.questions, req.transcripts)):
        notes = []
        word_count = _word_count(a)
        
        if word_count < 10:
            notes.append("System Validation Note: 'very short answer' (<10 words).")
        if _find_repeated_phrases(a):
            notes.append("System Validation Note: repeated phrases detected.")
        if _compute_topic_relevance(q, a) < 3 and word_count >= 10:
            notes.append("System Validation Note: likely does not address the question topic.")
            
        qa_pairs_text += f"\nQ{i+1}: {q}\nA{i+1}: {a}\n"
        if notes:
            qa_pairs_text += " ".join(notes) + "\n"

    if not gemini_model:
        return _mock_interview_evaluation(req.questions, req.transcripts)

    prompt = INTERVIEW_EVALUATION_PROMPT.format(
        interview_type=req.interview_type,
        qa_pairs=qa_pairs_text
    )

    try:
        response = gemini_model.generate_content(prompt)
        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1] if "\n" in raw_text else raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3].strip()
        if raw_text.startswith("json"):
            raw_text = raw_text[4:].strip()

        data = json.loads(raw_text)
        return data

    except json.JSONDecodeError as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {exc}")
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {exc}")

def _mock_interview_evaluation(questions: list[str], transcripts: list[str]):
    return {
        "overall_score": 65,
        "communication": 6,
        "confidence": 7,
        "answer_quality": 6,
        "clarity": 7,
        "professionalism": 8,
        "response_structure": 7,
        "strengths": ["Spoke clearly", "Maintained good tone", "Attempted all questions"],
        "improvements": ["Elaborate more on technical points", "Provide more concrete examples", "Avoid filler words"],
        "suggestions": ["Practice mock interviews", "Use STAR method for HR questions", "Review basic concepts"],
        "per_question_feedback": [
            {
                "question": q,
                "answer": a,
                "score": 6,
                "feedback": "Reasonable attempt but could be more detailed."
            } for q, a in zip(questions, transcripts)
        ]
    }


def _mock_evaluation():
    """Fallback mock data when Gemini key is not configured."""
    return {
        "scores": {
            "content": {"score": 5, "explanation": "Some relevant points but lacking depth."},
            "clarity": {"score": 4, "explanation": "Ideas are somewhat clear but could be better connected."},
            "communication": {"score": 5, "explanation": "Adequate vocabulary but noticeable fillers."},
            "confidence": {"score": 4, "explanation": "Decent confidence, some hesitations noted."},
            "structure": {"score": 3, "explanation": "Basic structure attempted but lacks a clear conclusion."},
        },
        "overall_score": 42,
        "strengths": [
            "Attempted to address the topic",
            "Used some relevant vocabulary",
        ],
        "improvements": [
            "Add concrete examples and data to support arguments",
            "Structure the response with a clear introduction and conclusion",
            "Reduce filler words and pauses",
        ],
        "tips": [
            "Structure answers as introduction, key points, and conclusion",
            "Practice speaking at a steady pace for 2+ minutes",
            "Use real-world examples to strengthen arguments",
        ],
    }
