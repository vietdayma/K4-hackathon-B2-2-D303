import os
import re
import glob
from typing import Dict, List, Optional

class TranscriptLoader:
    def __init__(self, directory_path: str):
        self.directory_path = directory_path
        self.chunks: Dict[str, dict] = {}
        self.load_all()

    def load_all(self) -> None:
        """
        Quét và tải toàn bộ các file transcript, phân tách thành các đoạn [Txx-NNN]
        """
        self.chunks = {}
        if not os.path.exists(self.directory_path):
            print(f"[TRANSCRIPT_LOADER] WARNING: Directory {self.directory_path} does not exist.")
            return

        file_pattern = os.path.join(self.directory_path, "transcript-*-clean.md")
        files = glob.glob(file_pattern)
        
        # Nếu không tìm thấy file nào, thử tìm trong thư mục cha hoặc tương đối khác
        if not files:
            print(f"[TRANSCRIPT_LOADER] No files matching transcript-*-clean.md found in {self.directory_path}.")
            return

        for file_path in files:
            file_name = os.path.basename(file_path)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Tìm tiêu đề buổi học (dòng chứa dấu # ở đầu)
                topic_match = re.search(r'^#\s+(.*)', content, re.MULTILINE)
                topic = topic_match.group(1).strip() if topic_match else file_name
                
                # Tìm tất cả vị trí [Txx-NNN]
                # Pattern này linh hoạt nhận dạng [Txx-NNN] hoặc [Txx-NNN]
                matches = list(re.finditer(r'\[(T\d{2}-\d{3})\]', content))
                
                for i, match in enumerate(matches):
                    chunk_id = match.group(1)
                    start_pos = match.end()
                    end_pos = matches[i+1].start() if i + 1 < len(matches) else len(content)
                    
                    chunk_text = content[start_pos:end_pos].strip()
                    
                    # Dọn dẹp markdown thừa ở đầu như dấu ** của **[Txx-NNN]**
                    if chunk_text.startswith("**") or chunk_text.startswith(":**") or chunk_text.startswith("]**"):
                        chunk_text = re.sub(r'^(?::\s*|\]\s*)?\*\*\s*', '', chunk_text)
                    
                    # Nếu còn dấu ** ở cuối
                    if chunk_text.endswith("**"):
                        chunk_text = chunk_text[:-2].strip()
                        
                    self.chunks[chunk_id] = {
                        "chunk_id": chunk_id,
                        "text": chunk_text,
                        "source_file": file_name,
                        "topic": topic
                    }
            except Exception as e:
                print(f"[TRANSCRIPT_LOADER] Error reading {file_name}: {e}")

        print(f"[TRANSCRIPT_LOADER] Loaded {len(self.chunks)} chunks from {len(files)} transcript files.")

    def get_chunk(self, chunk_id: str) -> Optional[dict]:
        """
        Lấy thông tin chi tiết của một chunk theo mã đoạn
        """
        return self.chunks.get(chunk_id)

    def search_chunks(self, query: str, limit: int = 15) -> List[dict]:
        """
        Tìm kiếm từ khóa đơn giản trong các chunks transcript
        """
        if not query:
            return list(self.chunks.values())[:limit]
            
        query_words = query.lower().split()
        results = []
        for chunk in self.chunks.values():
            text_lower = chunk["text"].lower()
            topic_lower = chunk["topic"].lower()
            
            # Tính điểm khớp từ khóa đơn giản
            score = 0
            for word in query_words:
                if word in text_lower:
                    score += 2
                if word in topic_lower:
                    score += 1
                    
            if score > 0:
                results.append((score, chunk))
                
        # Sắp xếp theo điểm số giảm dần
        results.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in results[:limit]]
