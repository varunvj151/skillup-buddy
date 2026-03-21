import requests
import json

BASE_URL = "http://localhost:8000"

test_data = {
    "interview_type": "technical",
    "questions": [
        "What is encapsulation?",
        "What is time complexity?",
        "What is a queue?",
        "What is recursion?",
        "Explain REST architecture"
    ],
    "transcripts": [
        "Hello, can you tell me? Can you tell me? Can you tell me? Can you tell me? And clap your legs.",
        "Time for the complexity Time for the complexity Time for the complexity Time for the complexity I think I will show you",
        "congressional belleza es no te haya",
        "Recrosion is nothing but a function calling itself.",
        "வாழுள் சீம کو தரைவக்கிறாத் தொடத்துவங்கள். மிகவும் வாழுள"
    ]
}

def test_evaluation():
    print("Sending test data to /api/evaluate-interview...")
    try:
        response = requests.post(f"{BASE_URL}/api/evaluate-interview", json=test_data)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("\nOverall Score:", result.get("overallScore"))
            print("Summary:", result.get("summary"))
            print("\nQuestion breakdown:")
            for i, q in enumerate(result.get("questions", [])):
                print(f"Q{i+1}: {q['score']}/100 - Status: {q['status']}")
                print(f"   Feedback: {q['feedback']}")
        else:
            print("Error details:", response.text)
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_evaluation()
