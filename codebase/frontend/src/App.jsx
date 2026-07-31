import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CoursePage from './pages/CoursePage';
import WarmUpPage from './pages/WarmUpPage';
import QuizSurveyPage from './pages/QuizSurveyPage';
import QuizActivePage from './pages/QuizActivePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route mặc định sang Trang chủ khóa học */}
        <Route path="/" element={<CoursePage />} />
        
        {/* Route cho game chuẩn bị bài học Warmup */}
        <Route path="/warmup" element={<WarmUpPage />} />
        
        {/* Các Route cho phần Trắc nghiệm cuối bài */}
        <Route path="/quiz/survey" element={<QuizSurveyPage />} />
        <Route path="/quiz/active" element={<QuizActivePage />} />

        {/* Fallback tự động redirect về trang chủ khóa học */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
