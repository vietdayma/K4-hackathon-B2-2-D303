import sys
import io

# Đảm bảo stdout/stderr sử dụng UTF-8 để không bị crash khi print tiếng Việt trên Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.infrastructure.transcript_loader import TranscriptLoader
from app.infrastructure.slide_loader import SlideLoader
from app.infrastructure.quiz_loader import QuizLoader
from app.interfaces.external.gemini_client import GeminiClient
from app.usecases.rag_agent import RagAgentUseCase
from app.interfaces.api.router import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Quản lý vòng đời ứng dụng FastAPI: khởi tạo các loaders,
    GeminiClient và UseCase khi startup và dọn dẹp tài nguyên khi shutdown.
    """
    print("\n[STARTUP] Initializing RAG components...")
    
    # Khởi tạo các Infrastructure Loaders
    transcript_loader = TranscriptLoader(settings.TRANSCRIPT_DIR)
    slide_loader = SlideLoader(settings.SLIDES_DIR)
    quiz_loader = QuizLoader(settings.QUIZ_FILE)
    
    # Khởi tạo External Clients
    gemini_client = GeminiClient()
    
    # Khởi tạo Application UseCase
    rag_usecase = RagAgentUseCase(
        transcript_loader=transcript_loader,
        slide_loader=slide_loader,
        quiz_loader=quiz_loader,
        gemini_client=gemini_client
    )
    
    # Đăng ký UseCase vào app.state để các routers sử dụng
    app.state.rag_usecase = rag_usecase
    print("[STARTUP] RAG components initialized successfully.\n")
    yield
    print("[SHUTDOWN] Application shutdown complete.")

app = FastAPI(
    title="RAG AI Agent Backend",
    description="FastAPI Backend cho AI Tutor RAG thực hiện lọc quiz và giải thích kiến thức dựa trên transcript & slide bài giảng.",
    version="1.0.0",
    lifespan=lifespan
)

# Cấu hình CORS cho phép frontend kết nối
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký API router
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "FastAPI RAG AI Agent Backend is running.",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    print(f"[MAIN] Starting server on {settings.HOST}:{settings.PORT}...")
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
