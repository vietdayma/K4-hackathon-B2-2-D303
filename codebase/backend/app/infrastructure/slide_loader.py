import os
import glob
from typing import List, Dict
from pypdf import PdfReader

class SlideLoader:
    def __init__(self, directory_path: str):
        self.directory_path = directory_path
        self.slides: List[Dict] = []
        self.load_all()

    def load_all(self) -> None:
        """
        Quét và tải nội dung từ tất cả các file slide PDF trong thư mục
        """
        self.slides = []
        if not os.path.exists(self.directory_path):
            print(f"[SLIDE_LOADER] WARNING: Directory {self.directory_path} does not exist.")
            return

        pdf_files = glob.glob(os.path.join(self.directory_path, "*.pdf"))
        if not pdf_files:
            print(f"[SLIDE_LOADER] No PDF slide files found in {self.directory_path}.")
            return

        for file_path in pdf_files:
            file_name = os.path.basename(file_path)
            try:
                reader = PdfReader(file_path)
                num_pages = len(reader.pages)
                print(f"[SLIDE_LOADER] Reading {file_name} with {num_pages} pages...")
                
                for idx, page in enumerate(reader.pages):
                    page_text = page.extract_text() or ""
                    # Làm sạch text đơn giản
                    clean_text = " ".join(page_text.split())
                    
                    self.slides.append({
                        "file_name": file_name,
                        "page_number": idx + 1,  # 1-indexed
                        "text": clean_text
                    })
            except Exception as e:
                print(f"[SLIDE_LOADER] Error reading slide {file_name}: {e}")

        print(f"[SLIDE_LOADER] Loaded {len(self.slides)} slide pages from {len(pdf_files)} PDF files.")

    def get_all_slides(self) -> List[Dict]:
        return self.slides

    def search_slides(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Tìm kiếm từ khóa đơn giản trong các trang slide
        """
        if not query:
            return self.slides[:limit]

        query_words = query.lower().split()
        results = []
        for slide in self.slides:
            text_lower = slide["text"].lower()
            score = 0
            for word in query_words:
                if word in text_lower:
                    score += 1
            if score > 0:
                results.append((score, slide))

        results.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in results[:limit]]
