import os
import json
from typing import List, Dict, Optional

class QuizLoader:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.quiz_bank: List[Dict] = []
        self.metadata: Dict = {}
        self.load_quiz()

    def load_quiz(self) -> None:
        """
        Đọc và phân tích file quizzend.json
        """
        if not os.path.exists(self.file_path):
            print(f"[QUIZ_LOADER] WARNING: Quiz file {self.file_path} does not exist.")
            return

        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            self.metadata = data.get("metadata", {})
            self.quiz_bank = data.get("quiz_bank", [])
            print(f"[QUIZ_LOADER] Successfully loaded {len(self.quiz_bank)} questions from {self.file_path}.")
        except Exception as e:
            print(f"[QUIZ_LOADER] Error loading quiz file {self.file_path}: {e}")

    def get_all_questions(self) -> List[Dict]:
        """
        Lấy toàn bộ ngân hàng câu hỏi
        """
        return self.quiz_bank

    def get_questions_by_level(self, level: int) -> List[Dict]:
        """
        Lọc câu hỏi theo mức độ nhận biết (1-5)
        """
        return [q for q in self.quiz_bank if q.get("level") == level]

    def get_questions_below_level(self, level: int) -> List[Dict]:
        """
        Lấy câu hỏi ở các mức độ nhận biết thấp hơn level đã cho
        """
        return [q for q in self.quiz_bank if q.get("level", 0) < level]

    def get_available_topics(self) -> List[str]:
        """
        Lấy danh sách chủ đề duy nhất trong ngân hàng câu hỏi
        """
        topics = {q.get("topic", "") for q in self.quiz_bank if q.get("topic")}
        return sorted(topics)

    def get_question_by_id(self, question_id: str) -> Optional[Dict]:
        """
        Lấy câu hỏi theo ID
        """
        for q in self.quiz_bank:
            if q.get("id") == question_id:
                return q
        return None
