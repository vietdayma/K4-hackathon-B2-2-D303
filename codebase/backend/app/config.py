import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-flash"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    TRANSCRIPT_DIR: str = "../../data/vlearn-pack/transcript"
    SLIDES_DIR: str = "../../data/vlearn-pack/slides"
    QUIZ_FILE: str = "../../data/vlearn-pack/quizz/quizzend.json"

    # Đọc cấu hình từ file .env nằm cùng cấp hoặc cấp trên của codebase/backend
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Console log để kiểm tra việc đọc cấu hình thành công
print(f"[CONFIG] Loaded settings: Model={settings.GEMINI_MODEL}, Host={settings.HOST}, Port={settings.PORT}")
