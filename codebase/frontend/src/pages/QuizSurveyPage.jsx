import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quiz.css';

const defaultSuggestedTopics = [
  "Kiến trúc GNN",
  "Đồ thị tri thức",
  "Tối ưu hóa Prompt",
  "Pipeline Airflow"
];

export default function QuizSurveyPage() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(0);
  const [vagueKnowledge, setVagueKnowledge] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState(defaultSuggestedTopics);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const ratingTexts = [
    "Chưa hiểu lắm - Cần ôn lại",
    "Hiểu sương sương - Cần thực hành",
    "Khá ổn - Cần luyện tập thêm",
    "Rất tốt - Sẵn sàng áp dụng",
    "Xuất sắc - Hoàn toàn tự tin!"
  ];

  const handleChipClick = (topic) => {
    setVagueKnowledge(prev => {
      const trimmed = prev.trim();
      return trimmed.length > 0 ? `${trimmed}, ${topic}` : topic;
    });
    console.log(`[Survey] Chọn chip gợi ý: ${topic}`);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (level === 0) {
      setErrorMsg("Vui lòng chọn mức độ hiểu bài của bạn (số sao) trước khi tiếp tục.");
      console.warn("[Survey] Lỗi: Chưa chọn số sao.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    console.log(`[Survey API Request] Gửi yêu cầu: level=${level}, vague_knowledge='${vagueKnowledge}'`);

    try {
      const url = new URL('http://localhost:8000/api/quiz');
      url.searchParams.append('level', level);
      if (vagueKnowledge.trim()) {
        url.searchParams.append('vague_knowledge', vagueKnowledge.trim());
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("[Survey API Response] Nhận phản hồi:", data);

      if (data.status === "success") {
        // Lưu dữ liệu để sử dụng trong trang tiếp theo
        localStorage.setItem('quizzes', JSON.stringify(data.questions));
        localStorage.setItem('selectedLevel', level);
        localStorage.setItem('vagueKnowledge', vagueKnowledge);

        console.log("[Survey] Thành công, chuyển sang trang trắc nghiệm.");
        navigate('/quiz/active');
      } else if (data.status === "clarification_needed") {
        setErrorMsg(data.message || "Kiến thức mơ hồ bạn nhập chưa khớp với nội dung bài học. Vui lòng làm rõ hơn.");
        console.warn("[Survey] Cần làm rõ:", data.message);
        
        if (data.suggested_topics && data.suggested_topics.length > 0) {
          setSuggestedTopics(data.suggested_topics);
        }
      }
    } catch (err) {
      console.error("[Survey API Error] Không thể kết nối backend:", err);
      setErrorMsg("Không thể kết nối đến máy chủ Backend. Vui lòng đảm bảo backend đang chạy trên cổng 8000.");
    } finally {
      setLoading(false);
    }
  };

  // Hỗ trợ phím tắt Enter để nộp bài
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !loading) {
        // Chỉ trigger nếu không phải đang focus trong textarea
        if (document.activeElement.tagName !== 'TEXTAREA') {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [level, vagueKnowledge, loading]);

  return (
    <div className="quiz-page-wrapper">
      <div className="bg-blob-1"></div>
      <div className="bg-blob-2"></div>

      <div className="modal-container">
        {/* Header */}
        <div className="top-bar">
          <button 
            className="btn-icon close-btn" 
            type="button" 
            aria-label="Về trang khóa học" 
            onClick={() => navigate('/')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="badge-step">Khảo sát</div>
          <div style={{ width: '44px' }}></div>
        </div>

        <h2 className="title">Mức độ hiểu bài của bạn trong buổi học như thế nào?</h2>
        <p className="subtitle">Đánh giá của bạn giúp hệ thống điều chỉnh test phù hợp hơn.</p>

        {/* Đánh giá sao */}
        <div className="rating-section">
          <p className="rating-question">Chạm vào sao để đánh giá</p>
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((starIdx) => {
              const active = starIdx <= (hoveredStar || level);
              return (
                <svg 
                  key={starIdx}
                  className={`star-rating ${starIdx <= level ? 'pop' : ''}`}
                  viewBox="0 0 24 24" 
                  fill={active ? "var(--star-yellow)" : "none"} 
                  stroke={active ? "var(--star-yellow)" : "var(--star-empty)"} 
                  strokeWidth="1.5" 
                  strokeLinejoin="round"
                  onMouseEnter={() => setHoveredStar(starIdx)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setLevel(starIdx)}
                  style={{ cursor: 'pointer', width: '48px', height: '48px', transition: 'transform 0.15s ease' }}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              );
            })}
          </div>
          
          <div className="rating-label-container">
            {level > 0 && <p className="rating-label">{ratingTexts[level - 1]}</p>}
          </div>
        </div>

        {/* Báo lỗi khảo sát */}
        {errorMsg && (
          <div className="survey-error">
            {errorMsg}
          </div>
        )}

        {/* Textarea nhận xét */}
        <textarea 
          className="feedback-input" 
          placeholder="Bạn chưa nắm vững nội dung nào?"
          value={vagueKnowledge}
          onChange={(e) => setVagueKnowledge(e.target.value)}
        ></textarea>
        
        {/* Chips gợi ý chủ đề */}
        <div className="suggestions-container">
          {suggestedTopics.map((topic, idx) => (
            <button 
              key={idx}
              className="suggestion-chip"
              type="button"
              onClick={() => handleChipClick(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Thanh điều hướng dưới cùng */}
        <div className="bottom-bar">
          <div className="hint-text">
            <span className="hint-key">Enter</span> để tiếp tục
          </div>
          <button 
            className={`submit-btn ${loading ? 'loading' : ''}`} 
            type="button"
            disabled={loading}
            onClick={() => handleSubmit()}
          >
            {loading ? "Đang tải..." : "Tiếp tục →"}
          </button>
        </div>
        
      </div>
    </div>
  );
}
