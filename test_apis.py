import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

print("=" * 50)
print("GROQ API Test")
print("=" * 50)
api_key = os.getenv("GROQ_API_KEY")
print(f"Key: {api_key[:10]}...{api_key[-4:]}")

url = "https://api.groq.com/openai/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
data = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "system", "content": "You are a code reviewer. Respond in JSON with keys: quality_score, issues, optimizations, refactored_code, simple_explanation"},
        {"role": "user", "content": "Review this Python code: def add(a, b): return a+b"}
    ],
    "response_format": {"type": "json_object"}
}

r = requests.post(url, headers=headers, json=data, timeout=30)
print(f"Status: {r.status_code}")
if r.status_code == 200:
    content = r.json()['choices'][0]['message']['content']
    parsed = json.loads(content)
    print(json.dumps(parsed, indent=2))
    print("\n>>> GROQ: SUCCESS")
else:
    print(f"Error: {r.text}")

print("\n" + "=" * 50)
print("Hugging Face API Test")
print("=" * 50)
hf_key = os.getenv("HF_API_KEY")
print(f"Key: {hf_key[:10]}...{hf_key[-4:]}")

API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
headers2 = {"Authorization": f"Bearer {hf_key}"}
payload = {"inputs": "Review this Python code briefly: def add(a, b): return a+b"}

r2 = requests.post(API_URL, headers=headers2, json=payload, timeout=30)
print(f"Status: {r2.status_code}")
if r2.status_code == 200:
    print(json.dumps(r2.json(), indent=2)[:1000])
    print("\n>>> HF: SUCCESS")
else:
    print(f"Error: {r2.text}")
