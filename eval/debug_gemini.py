from google import genai
from google.genai import types as genai_types
import os, json, sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env từ đúng thư mục backend (bất kể chạy từ đâu)
env_path = Path(__file__).parent.parent / "codebase" / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
print(f"Key found: {bool(key)}, Key prefix: {key[:10] if key else 'NONE'}, Model: {model}")

client = genai.Client(api_key=key)
config = genai_types.GenerateContentConfig(
    response_mime_type="application/json",
    temperature=0.1,
    system_instruction="Bạn là AI Tutor Socratic. Luôn trả về JSON hợp lệ."
)

prompt = """Câu hỏi: "Scaled Dot-Product Attention dùng 3 ma trận nào?"
Lựa chọn:
A. Query, Key và Value.
B. Input, Hidden và Output.

Tạo gợi ý Cấp độ 1. Trả về JSON:
{"hint_level": 1, "hint_text": "...", "citations": []}
"""

try:
    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config
    )
    print(f"Status OK. Response length: {len(resp.text)}")
    print(f"Raw: {resp.text[:500]}")
    parsed = json.loads(resp.text)
    print(f"Parsed hint_text: {parsed.get('hint_text', 'N/A')[:150]}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
