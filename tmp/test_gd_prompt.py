import json
import re

# Mocking the replacement logic found in backend/main.py
EVALUATION_PROMPT = """You are a STRICT and REALISTIC campus placement interviewer evaluating a candidate's Group Discussion (GD) performance...

Respond ONLY with a valid JSON object in exactly this format (no extra text, no markdown fences):
{
  "scores": {
    "content": {"score": <int>, "explanation": "<string>"},
    "clarity": {"score": <int>, "explanation": "<string>"},
    "communication": {"score": <int>, "explanation": "<string>"},
    "confidence": {"score": <int>, "explanation": "<string>"},
    "structure": {"score": <int>, "explanation": "<string>"}
  },
  "overall_score": <int>,
  "strengths": ["<string>", ...],
  "improvements": ["<string>", ...],
  "tips": ["<string>", ...]
}"""

def test_prompt_formatting():
    topic = "AI Impact on Jobs"
    transcript = "I think AI will change everything. It will automate many tasks but also create new ones."
    
    prompt = EVALUATION_PROMPT.replace("{topic}", topic).replace("{transcript}", transcript)
    
    print("Formatted Prompt snippet:")
    print(prompt[-300:])
    
    # Check for double braces that might have been missed
    if "{{" in prompt:
        print("FAIL: Double braces found in prompt!")
    else:
        print("SUCCESS: No double braces found.")

if __name__ == "__main__":
    test_prompt_formatting()
