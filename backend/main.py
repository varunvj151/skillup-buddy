import os
import re
import json
import math
import tempfile
import traceback
import subprocess
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
print("Loading Whisper model (small)…")
whisper_model = whisper.load_model("small")
print("Whisper model loaded ✓")


# ---------------------------------------------------------------------------
# Configure Gemini
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use JSON mode for more reliable parsing
    gemini_model = genai.GenerativeModel(
        "gemini-2.0-flash",
        generation_config={"response_mime_type": "application/json"}
    )
    print("Gemini API configured (JSON Mode) ✓")

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

    # ── Check 2: Junk/nonsense transcript ──
    if _is_mostly_junk(transcript):
        flags.append("transcription_error")
        reasons.append(
            "The transcription appears to contain nonsense or irrelevant content. "
            "This may be due to poor audio quality or background noise. Please try again."
        )

    # ── Check 3: Repeated phrases ──
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
    if "transcription_error" in flags:
        base = 10  # Very low for junk transcripts
    base = max(10, min(30, base))  # clamp 10–30

    cat_score = max(1, base // 10)  # 1–3

    return {
        "scores": {
            "content": {
                "score": 1 if "transcription_error" in flags or "off_topic" in flags else cat_score,
                "explanation": (
                    "The transcription contains nonsense or irrelevant content."
                    if "transcription_error" in flags
                    else "The speech did not address the given topic."
                    if "off_topic" in flags
                    else "Very limited content was provided."
                ),
            },
            "clarity": {
                "score": 1 if "transcription_error" in flags else cat_score,
                "explanation": (
                    "Unable to assess clarity due to transcription errors."
                    if "transcription_error" in flags
                    else "Insufficient content to assess clarity of thought."
                ),
            },
            "communication": {
                "score": 1 if "transcription_error" in flags else (max(1, cat_score - 1) if "low_communication_quality" in flags else cat_score),
                "explanation": (
                    "Transcription errors prevent proper evaluation of communication skills."
                    if "transcription_error" in flags
                    else "Excessive repetition of phrases indicates poor communication."
                    if "low_communication_quality" in flags
                    else "Not enough speech to evaluate communication skills."
                ),
            },
            "confidence": {
                "score": 1 if "transcription_error" in flags else cat_score,
                "explanation": (
                    "Cannot assess confidence due to transcription issues."
                    if "transcription_error" in flags
                    else "Cannot assess confidence from such a brief or irrelevant response."
                ),
            },
            "structure": {
                "score": 1 if "transcription_error" in flags else max(1, cat_score - 1),
                "explanation": (
                    "Unable to evaluate structure due to transcription errors."
                    if "transcription_error" in flags
                    else "No clear introduction, body, or conclusion was present."
                ),
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
    """Accept an audio file, convert to wav via ffmpeg, run Whisper, return transcript."""
    if not audio.filename:
        return {"text": "(No speech detected in the audio.)", "status": "failed"}

    suffix = Path(audio.filename).suffix or ".webm"
    tmp_webm = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    try:
        contents = await audio.read()
        print(f"[Backend] Received audio file: size={len(contents)}")
        
        if len(contents) < 10000:
            print("[Backend] Audio file too small, discarding.")
            tmp_webm.close()
            tmp_wav.close()
            return {"text": "(No speech detected in the audio.)", "status": "failed"}

        with open(tmp_webm.name, "wb") as f:
            f.write(contents)
            
        tmp_webm.close()
        tmp_wav.close() # Close so ffmpeg can overwrite

        # Convert to WAV and trim silence
        print(f"[Backend] Converting {tmp_webm.name} to {tmp_wav.name} and trimming silence...")
        cmd = [
            "ffmpeg", "-y", "-i", tmp_webm.name, 
            "-af", "silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-50dB",
            "-ar", "16000", "-ac", "1", tmp_wav.name
        ]
        process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        if process.returncode != 0:
            print("[Backend] FFmpeg conversion failed!")
            print(process.stderr.decode("utf-8", errors="ignore"))
            return {"text": "(No speech detected in the audio.)", "status": "failed"}
            
        print("[Backend] FFmpeg conversion success.")

        # Transcribe with Whisper (Forcing English for better accuracy)
        print(f"[Backend] Running Whisper (base) on {tmp_wav.name}...")
        import time
        start_t = time.time()
        # Force English and transcribe task
        result = whisper_model.transcribe(tmp_wav.name, language="en", task="transcribe")
        end_t = time.time()
        print(f"[Backend] Whisper finished in {end_t - start_t:.2f} seconds.")

        transcript = result.get("text", "").strip()

        print(f"[Backend] Transcription result length: {len(transcript)}")
        
        if not transcript:
            return {"text": "(No speech detected in the audio.)", "status": "failed"}

        return {"text": transcript, "status": "success"}

    except Exception as exc:
        traceback.print_exc()
        return {"text": "(No speech detected in the audio.)", "status": "failed"}
    finally:
        # Cleanup temp files
        for fpath in [tmp_webm.name, tmp_wav.name]:
            try:
                if os.path.exists(fpath):
                    os.unlink(fpath)
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

    # Use replace instead of format to avoid KeyError if transcript contains curlies
    prompt = EVALUATION_PROMPT.replace("{topic}", req.topic).replace("{transcript}", req.transcript)

    try:
        response = gemini_model.generate_content(prompt)
        
        # Check if response has valid parts (not blocked)
        if not response.candidates or not response.candidates[0].content.parts:
             print("⚠ Gemini response blocked or empty.")
             return _mock_evaluation()
             
        raw_text = response.text.strip()

        # Robust JSON extraction
        json_match = re.search(r"(\{.*\})", raw_text, re.DOTALL)
        if json_match:
            raw_text = json_match.group(1)
        else:
            # Strip markdown fences if present (fallback)
            if raw_text.startswith("```"):
                raw_text = raw_text.split("\n", 1)[1] if "\n" in raw_text else raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3].strip()
            if raw_text.startswith("json"):
                raw_text = raw_text[4:].strip()

        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            print(f"FAILED to parse AI JSON. Raw text: {raw_text[:200]}...")
            return _mock_evaluation()

        # ── Step 3: Post-AI score adjustment ──
        data = _adjust_scores_for_relevance(data, req.topic, req.transcript)

        return data

    except json.JSONDecodeError as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {exc}")
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {exc}")


INTERVIEW_EVALUATION_PROMPT = """
You are a BRUTALLY HONEST Technical Interview Evaluator. Your goal is to distinguish between a candidate who knows the subject and one who is giving nonsense, irrelevant, or very poor answers.

IMPORTANT RULES:
1. **ZREO TOLERANCE FOR NONSENSE**: If the answer is gibberish, nonsense words (e.g., "clap your legs", "costumes", non-English text), or completely irrelevant to the technical question, YOU MUST mark:
   - score: 0
   - communication: 0
   - technical: 0
   - status: "TRANSCRIPTION_ERROR"
   - feedback: "The provided answer is nonsense or completely irrelevant to the question."

2. **STRICT SCORING**:
   - A superficial one-sentence answer that is technically correct but lacks depth should NOT score more than 30/100.
   - For an answer to score above 80, it must be technically precise, use correct terminology, and show depth.
   - Communication should be penalized for fillers, repetition, and poor grammar.

3. **TECHNICAL ACCURACY**: 
   - If the answer is technically wrong, even if it sounds confident, the 'technical' score must be 1-2 and 'score' must be below 20.

4. **JSON ONLY**: Return ONLY valid JSON. No markdown, no explanations.

Scoring Scale (score):
- 0: Nonsense / Empty
- 1-30: Poor / Very Superficial
- 31-60: Average / Needs more depth
- 61-85: Good / Technical knowledge present
- 86-100: Excellent (Rare)

Overall Score Calculation:
- The overallScore should be a weighted average of the individual question scores.
- If more than 3 answers are nonsensical, overallScore should be below 20.

Return EXACTLY this JSON schema:
{{
  "overallScore": 0,
  "questions": [
    {{
      "question": "string",
      "score": 0,
      "communication": 0,
      "technical": 0,
      "feedback": "string",
      "status": "OK"
    }}
  ],
  "summary": "string"
}}

Input:
{qa_pairs}
"""

def _is_mostly_junk(text: str) -> bool:
    """Heuristic to detect nonsense or non-English text."""
    t = text.strip()
    if not t: return True
    if t in ["(Skipped)", "(No speech detected)", "(Transcription failed)", "(No speech detected in the audio.)"]: return True
    
    # Check for very short transcripts
    words = t.split()
    if len(words) < 5: return True
    
    # Check for non-Latin characters (simplified)
    # If more than 30% of characters are non-ASCII/non-Latin, it's likely noise or another lang
    non_latin = len([c for c in t if ord(c) > 127 and not c.isspace()])
    if len(t) > 0 and (non_latin / len(t)) > 0.3:
        return True
    
    # Check for nonsense repetitive phrases
    if len(words) > 10:
        counts = Counter(words)
        most_common_ratio = counts.most_common(1)[0][1] / len(words)
        if most_common_ratio > 0.5: # One word makes up > 50% of the answer
            return True
    
    # Check for gibberish patterns (words that don't look like English)
    english_words = set([
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
        "whom", "his", "her", "their", "our", "my", "your", "i", "you", "he",
        "she", "we", "they", "me", "him", "her", "us", "them", "good", "bad",
        "yes", "no", "ok", "okay", "hello", "hi", "thank", "thanks", "please",
        "sorry", "excuse", "pardon", "yes", "no", "maybe", "perhaps", "sure",
        "certainly", "definitely", "absolutely", "totally", "really", "very",
        "so", "too", "also", "and", "but", "or", "if", "then", "because",
        "although", "however", "therefore", "consequently", "thus", "hence",
        "so", "accordingly", "moreover", "furthermore", "besides", "likewise",
        "similarly", "conversely", "instead", "rather", "on", "the", "other",
        "hand", "nevertheless", "nonetheless", "notwithstanding", "still",
        "yet", "though", "although", "even", "though", "whereas", "while",
        "whilst", "meanwhile", "afterwards", "later", "soon", "immediately",
        "now", "then", "before", "previously", "ago", "since", "for", "during",
        "while", "when", "as", "soon", "as", "no", "sooner", "than", "hardly",
        "scarcely", "barely", "just", "only", "merely", "simply", "just",
        "exactly", "precisely", "specifically", "particularly", "especially",
        "notably", "chiefly", "mainly", "primarily", "principally", "largely",
        "generally", "usually", "typically", "normally", "commonly", "frequently",
        "often", "sometimes", "occasionally", "seldom", "rarely", "never",
        "always", "ever", "never", "ever", "at", "all", "in", "the", "least",
        "by", "no", "means", "on", "no", "account", "under", "no", "circumstances",
        "in", "no", "way", "not", "at", "all", "not", "in", "the", "least",
        "not", "by", "any", "means", "not", "on", "any", "account", "not",
        "under", "any", "circumstances", "not", "in", "any", "way", "not",
        "a", "bit", "not", "a", "whit", "not", "a", "jot", "not", "a", "scrap",
        "not", "a", "particle", "not", "a", "grain", "not", "a", "morsel",
        "not", "a", "fragment", "not", "a", "shred", "not", "a", "trace",
        "not", "a", "hint", "not", "a", "suggestion", "not", "a", "shadow",
        "not", "a", "ghost", "not", "a", "whisper", "not", "a", "breath",
        "not", "a", "sigh", "not", "a", "murmur", "not", "a", "sound", "not",
        "a", "word", "not", "a", "syllable", "not", "a", "letter", "not",
        "a", "iota", "not", "a", "jot", "not", "a", "tittle", "not", "a",
        "dot", "not", "a", "comma", "not", "a", "semicolon", "not", "a",
        "colon", "not", "a", "dash", "not", "a", "hyphen", "not", "a", "mark",
        "not", "a", "sign", "not", "a", "symbol", "not", "a", "character",
        "not", "a", "figure", "not", "a", "number", "not", "a", "digit",
        "not", "a", "numeral", "not", "a", "cipher", "not", "a", "zero",
        "not", "a", "one", "not", "a", "two", "not", "a", "three", "not",
        "a", "four", "not", "a", "five", "not", "a", "six", "not", "a",
        "seven", "not", "a", "eight", "not", "a", "nine", "not", "a", "ten"
    ])
    
    # Count how many words are in our English word list
    recognized_words = sum(1 for word in words if word.lower().strip('.,!?') in english_words)
    if len(words) > 0 and (recognized_words / len(words)) < 0.3:  # Less than 30% recognized words
        return True
            
    return False

@app.post("/api/evaluate-interview")
async def evaluate_interview(req: EvaluateInterviewRequest):
    """Evaluate an interview session using Gemini AI with strong fallback handling and pre-validation."""
    if len(req.questions) != len(req.transcripts):
        raise HTTPException(status_code=400, detail="Questions and transcripts count mismatch.")

    qa_pairs_text = ""
    junk_count = 0
    validated_transcripts = []

    for i, (q, a) in enumerate(zip(req.questions, req.transcripts)):
        answer = (a or "").strip()
        
        # Pre-validate for nonsense
        if _is_mostly_junk(answer):
            junk_count += 1
            validated_transcripts.append("(Invalid/Nonsense Answer Detected)")
        else:
            if len(answer.split()) > 200:
                answer = " ".join(answer.split()[:200]) + " ...[TRUNCATED]"
            validated_transcripts.append(answer)

        qa_pairs_text += f"\nQuestion {i+1}: {q}\nAnswer {i+1}: {validated_transcripts[-1]}\n"

    # If ALL answers are junk, return immediately with 0
    if junk_count == len(req.questions):
        print("⚠ All interview transcripts failed validation (all junk). Returning 0.")
        return {
            "overallScore": 0,
            "questions": [
                {
                    "question": q,
                    "answer": a,
                    "score": 0, "communication": 0, "technical": 0,
                    "feedback": "No valid technical answer detected. Please speak clearly in English.",
                    "status": "TRANSCRIPTION_ERROR"
                }
                for q, a in zip(req.questions, req.transcripts)
            ],
            "summary": "The candidate provided no valid technical content during the session."
        }

    if not gemini_model:
        return _mock_interview_evaluation(req.questions, req.transcripts)

    # Use replace instead of format for safety
    prompt = INTERVIEW_EVALUATION_PROMPT.replace("{qa_pairs}", qa_pairs_text)

    try:
        print("DEBUG: Sending request to Gemini...")
        import time
        start_eval = time.time()
        response = gemini_model.generate_content(prompt)
        end_eval = time.time()
        print(f"DEBUG: Gemini responded in {end_eval - start_eval:.2f} seconds")

        if not response.candidates or not response.candidates[0].content.parts:
             print("⚠ Gemini response blocked or empty.")
             return _mock_interview_evaluation(req.questions, req.transcripts)

        raw_text = response.text.strip()
        
        # Robust JSON extraction
        json_match = re.search(r"(\{.*\})", raw_text, re.DOTALL)
        if json_match:
            raw_text = json_match.group(1)
        else:
            if raw_text.startswith("```"):
                raw_text = raw_text.split("\n", 1)[1] if "\n" in raw_text else raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3].strip()
            if raw_text.startswith("json"):
                raw_text = raw_text[4:].strip()

        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            print(f"FAILED to parse Interview AI JSON. Raw text: {raw_text[:200]}...")
            return _mock_interview_evaluation(req.questions, req.transcripts)

        if "overallScore" not in data or "questions" not in data or "summary" not in data:
            raise ValueError("Gemini JSON missing required keys")

        if not isinstance(data["questions"], list):
            raise ValueError("'questions' must be a list")

        normalized_questions = []
        for i, q in enumerate(req.questions):
            if i < len(data["questions"]) and isinstance(data["questions"][i], dict):
                item = data["questions"][i]
                normalized_questions.append({
                    "question": item.get("question", q),
                    "answer": req.transcripts[i],
                    "score": int(item.get("score", 0)),
                    "communication": int(item.get("communication", 0)),
                    "technical": int(item.get("technical", 0)),
                    "feedback": item.get("feedback", "No feedback generated."),
                    "status": item.get("status", "TRANSCRIPTION_ERROR"),
                })
            else:
                normalized_questions.append({
                    "question": q,
                    "answer": req.transcripts[i],
                    "score": 0,
                    "communication": 0,
                    "technical": 0,
                    "feedback": "Evaluation output was incomplete for this answer.",
                    "status": "TRANSCRIPTION_ERROR",
                })

        return {
            "overallScore": int(data.get("overallScore", 0)),
            "questions": normalized_questions,
            "summary": data.get("summary", "Evaluation completed with partial fallback handling.")
        }

    except Exception as exc:
        traceback.print_exc()
        print(f"ERROR: Interview evaluation failed, returning mock data. Detail: {exc}")
        return _mock_interview_evaluation(req.questions, req.transcripts)



def _mock_interview_evaluation(questions: list[str], transcripts: list[str]):
    """Stricter mock evaluation for fallback scenarios."""
    def get_mock_scores(ans: str):
        a = ans.strip().lower()
        if not a or a in ["(skipped)", "(no speech detected)", "(transcription failed)", "none"]:
            return 0, 0, 0, "No valid answer provided.", "TRANSCRIPTION_ERROR"
        
        # Very short or suspicious answers (likely filler)
        if len(a.split()) < 10:
            return 15, 3, 2, "Answer is too brief to demonstrate technical competence.", "PARTIAL"
        
        # Generic moderate score fallback
        return 40, 5, 3, "A basic attempt was made, but the explanation lacks technical precision, correct terminology, and depth. Stricter evaluation is required.", "OK"


    evaluated_questions = []
    for q, a in zip(questions, transcripts):
        score, comm, tech, feedback, status = get_mock_scores(a)
        evaluated_questions.append({
            "question": q,
            "answer": a,
            "score": score,
            "communication": comm,
            "technical": tech,
            "feedback": feedback,
            "status": status
        })

    return {
        "overallScore": sum(q["score"] for q in evaluated_questions) // len(questions) if questions else 0,
        "questions": evaluated_questions,
        "summary": "The interview was evaluated with a stricter fallback mechanism because the primary AI service was unavailable or return an error."
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
