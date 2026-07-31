import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quiz.css';

const ELO_DEDUCTIONS = { 0: 0, 1: 20, 2: 30, 3: 50 };

export default function QuizActivePage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // 1. Khởi tạo sẵn 100 điểm Elo ngay từ đầu
  const [eloScore, setEloScore] = useState(100);

  const [isAnswered, setIsAnswered] = useState(false);
  const [answersState, setAnswersState] = useState([]);

  // Hint State
  const [showHintContent, setShowHintContent] = useState(false);
  const [currentHintLevelUsed, setCurrentHintLevelUsed] = useState(0);
  const [activeHintText, setActiveHintText] = useState('');
  const [activeHintCitations, setActiveHintCitations] = useState([]);
  const [loadingHintLevel, setLoadingHintLevel] = useState(null);

  // Explain State
  const [explainData, setExplainData] = useState(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  // Chat State
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Scoreboard State
  const [showScoreboard, setShowScoreboard] = useState(false);

  const chatDrawerBodyRef = useRef(null);

  // Tải quizzes từ localStorage khi component mount
  useEffect(() => {
    const raw = localStorage.getItem('quizzes');
    if (!raw) {
      console.warn("[QuizActive] Không tìm thấy quizzes trong localStorage. Quay lại khảo sát.");
      navigate('/quiz/survey');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setQuizzes(parsed);
      setAnswersState(Array(parsed.length).fill(null));
      console.log(`[QuizActive] Tải thành công ${parsed.length} câu hỏi.`, parsed);
    } catch (err) {
      console.error("[QuizActive] Lỗi parse dữ liệu localStorage:", err);
      navigate('/quiz/survey');
    }
  }, [navigate]);

  // Cuộn chat xuống cuối khi lịch sử chat hoặc trạng thái gõ thay đổi
  useEffect(() => {
    if (chatDrawerBodyRef.current) {
      chatDrawerBodyRef.current.scrollTop = chatDrawerBodyRef.current.scrollHeight;
    }
  }, [chatHistory, isChatTyping, showChatDrawer]);

  // Đăng ký sự kiện phím tắt (1, 2, 3, 4, Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.id === 'chatInput') return;

      if (!isAnswered && quizzes.length > 0) {
        if (e.key === '1') handleSelectAnswer('A');
        if (e.key === '2') handleSelectAnswer('B');
        if (e.key === '3') handleSelectAnswer('C');
        if (e.key === '4') handleSelectAnswer('D');
      } else if (isAnswered) {
        if (e.key === 'Enter') {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, quizzes, currentIdx, currentHintLevelUsed, eloScore, answersState]);

  if (quizzes.length === 0) {
    return (
      <div className="quiz-page-wrapper">
        <h2 style={{ textAlign: 'center', marginTop: '50px', color: '#334155' }}>
          Đang tải câu hỏi...
        </h2>
      </div>
    );
  }

  const currentQuiz = quizzes[currentIdx];

  // Hàm chọn đáp án
  const handleSelectAnswer = async (selectedId) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setLoadingExplain(true);
    console.log(`[QuizActive] Học viên chọn: ${selectedId} cho câu: ${currentQuiz.id}`);

    try {
      const res = await fetch('http://localhost:8000/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: currentQuiz.question,
          options: currentQuiz.options,
          user_answer: selectedId
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP Explain Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("[QuizActive API Explain] Phản hồi giải thích:", data);

      const correctLetter = data.correct_answer;
      const isCorrect = (selectedId === correctLetter);

      // Cộng thêm 10 Elo nếu trả lời đúng
      let scoreEarned = 0;
      if (isCorrect) {
        scoreEarned = 10;
        setEloScore(prev => prev + scoreEarned);
      }

      const currentAnswerData = {
        selectedAnswer: selectedId,
        isCorrect: isCorrect,
        score: scoreEarned,
        correctAnswer: correctLetter
      };

      setAnswersState(prev => {
        const copy = [...prev];
        copy[currentIdx] = currentAnswerData;
        return copy;
      });

      setExplainData(data);
    } catch (err) {
      console.error("[QuizActive Explain Error] Lỗi giải thích:", err);
      setExplainData({
        correct_answer: currentQuiz.answer || "A",
        explanation: "Lỗi hệ thống: Không thể kết nối đến máy chủ giải thích của AI Tutor.",
        citations: []
      });
    } finally {
      setLoadingExplain(false);
    }
  };

  // 2. Hàm lấy gợi ý Hint từ API (Chuẩn body request & trừ thẳng điểm Elo)
  const handleGetHint = async (level) => {
    setLoadingHintLevel(level);
    console.log(`[QuizActive API Hint Request] Gọi Hint mức ${level} cho câu: ${currentQuiz.id}`);

    try {
      const res = await fetch('http://localhost:8000/api/quiz/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: currentQuiz.question,
          options: currentQuiz.options,
          hint_level: level
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP Hint Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("[QuizActive API Hint Response] Nhận gợi ý:", data);

      // Trừ điểm Elo cố định: Mức 1 (-20), Mức 2 (-30), Mức 3 (-50)
      const pointsToDeduct = ELO_DEDUCTIONS[level] || 0;
      setEloScore(prev => Math.max(0, prev - pointsToDeduct));

      setCurrentHintLevelUsed(level);
      setActiveHintText(data.hint_text);
      setActiveHintCitations(data.citations || []);
      setShowHintContent(true);
    } catch (err) {
      console.error("[QuizActive Hint Error] Lỗi gợi ý:", err);
      setActiveHintText("Có lỗi xảy ra khi tải gợi ý từ AI Tutor. Vui lòng thử lại.");
    } finally {
      setLoadingHintLevel(null);
    }
  };

  // Hàm gửi tin nhắn chat Socratic
  const handleSendChatMessage = async () => {
    const text = chatInputText.trim();
    if (!text) return;

    const updatedHistory = [...chatHistory, { role: "user", content: text }];
    setChatHistory(updatedHistory);
    setChatInputText('');
    setIsChatTyping(true);

    try {
      const res = await fetch('http://localhost:8000/api/quiz/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: currentQuiz.question,
          options: currentQuiz.options,
          user_message: text,
          history: chatHistory
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP Chat Error: ${res.status}`);
      }

      const data = await res.json();
      setChatHistory(prev => [
        ...prev,
        {
          role: "model",
          content: data.reply,
          citations: data.citations || []
        }
      ]);
    } catch (err) {
      console.error("[QuizActive Chat Error] Lỗi trao đổi chat:", err);
      setChatHistory(prev => [
        ...prev,
        {
          role: "model",
          content: "Lỗi kết nối máy chủ AI Tutor. Bạn vui lòng thử lại nhé!"
        }
      ]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Nút Tiếp tục chuyển câu
  const handleNext = () => {
    if (currentIdx < quizzes.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setIsAnswered(false);
      setCurrentHintLevelUsed(0);
      setActiveHintText('');
      setActiveHintCitations([]);
      setExplainData(null);
      setChatHistory([]);
      setShowHintContent(false);
    } else {
      setShowScoreboard(true);
    }
  };

  const getEvaluationText = () => {
    if (eloScore >= 80) {
      return "Tutor: “Xuất sắc! Bạn có tư duy rất nhạy bén, nắm vững kiến thức từ tài liệu bài giảng và vận dụng xuất sắc. Bạn hoàn toàn tự tin áp dụng kiến thức này vào thực chiến!”";
    } else if (eloScore >= 50) {
      return "Tutor: “Tốt lắm! Bạn đã hiểu và áp dụng được hầu hết các khái niệm chính. Hãy đọc kỹ thêm các tài liệu slide và transcript được trích dẫn để khắc phục những điểm còn thiếu sót nhé!”";
    } else {
      return "Tutor: “Bạn cần dành thêm thời gian ôn tập lại. Hãy bấm vào các link tài liệu trích dẫn chi tiết trong các câu trả lời sai để đọc lại kỹ nội dung giảng viên truyền tải nhé. Cố gắng lên!”";
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];
  const currentAnswer = answersState[currentIdx];

  return (
    <div className="quiz-page-wrapper">
      <div className="bg-blob-1"></div>
      <div className="bg-blob-2"></div>

      <div className="quiz-modal quiz-container" id="quizApp">
        {/* Progress Bar */}
        <div className="progress-bar-container" id="progressBar">
          {quizzes.map((_, idx) => {
            let className = "progress-segment";
            if (idx === currentIdx) {
              className += " active";
            } else if (idx < currentIdx) {
              const prev = answersState[idx];
              className += (prev && prev.isCorrect) ? " correct" : " wrong";
            }
            return <div key={idx} className={className}></div>;
          })}
        </div>

        {/* Header */}
        <div className="quiz-header">
          <div className="header-left">
            <button
              className="btn-icon"
              type="button"
              aria-label="Quay lại phần tự đánh giá"
              onClick={() => navigate('/quiz/survey')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="badge-step">Câu {currentIdx + 1} / {quizzes.length}</div>
          </div>
          <div className="header-right">
            <div className="badge-elo">Elo: <span>{eloScore}</span></div>
          </div>
        </div>

        {/* Body */}
        <div className="quiz-body" id="quizBody">
          <h2 className="question-text">{currentQuiz.question}</h2>

          {/* HINT Dropdown */}
          <div className="hint-wrapper">
            <button
              type="button"
              className="hint-btn"
              id="hintToggleBtn"
              onClick={() => setShowHintContent(prev => !prev)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 12 3a4.65 4.65 0 0 0-4.5 4.5c0 .85.28 1.5.83 2.15.76.76 1.23 1.52 1.41 2.5"></path>
              </svg>
              HINT
            </button>

            {showHintContent && (
              <div className="hint-content" style={{ display: 'block' }}>
                <div className="hint-inner">
                  <p className="hint-title-select">Chọn cấp độ gợi ý (Khấu trừ Elo tương ứng):</p>
                  <div className="hint-levels-container">
                    {[1, 2, 3].map((levelNum) => (
                      <button
                        key={levelNum}
                        type="button"
                        className="hint-level-btn"
                        disabled={loadingHintLevel !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetHint(levelNum);
                        }}
                      >
                        {levelNum === 1 && `Cấp 1: Chủ đề (-20 Elo)`}
                        {levelNum === 2 && `Cấp 2: Định nghĩa (-30 Elo)`}
                        {levelNum === 3 && `Cấp 3: Gợi ý sát (-50 Elo)`}
                        {loadingHintLevel === levelNum && " (Đang tải...)"}
                      </button>
                    ))}
                  </div>

                  {activeHintText && (
                    <div className="hint-result-text" style={{ display: 'block', marginTop: '10px' }}>
                      <div><strong>Gợi ý từ Tutor (Đã trừ {ELO_DEDUCTIONS[currentHintLevelUsed] * 100}% Elo):</strong></div>
                      <div style={{ marginTop: '6px' }}>{activeHintText}</div>

                      {/* Citations trong Hint */}
                      {activeHintCitations.length > 0 && (
                        <div className="citations-list" style={{ marginTop: '8px' }}>
                          {activeHintCitations.map((c, cIdx) => (
                            <div key={cIdx} className="citation-item">
                              <div className="citation-meta">
                                <span className="citation-tag">{c.chunk_id}</span>
                                {c.slide_file && (
                                  <a href={`/data/vlearn-pack/slides/${c.slide_file}${c.slide_page ? `#page=${c.slide_page}` : ''}`} target="_blank" rel="noreferrer" className="citation-link">
                                    📄 Slide: {c.slide_file} (Trang {c.slide_page || 1})
                                  </a>
                                )}
                              </div>
                              <blockquote className="citation-quote">"{c.quote}"</blockquote>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="options-list">
            {currentQuiz.options.map((optionText, idx) => {
              const letter = optionLetters[idx];

              let cleanText = optionText;
              if (optionText.startsWith(`${letter}. `)) {
                cleanText = optionText.substring(3);
              } else if (optionText.startsWith(`${letter}.`)) {
                cleanText = optionText.substring(2);
              }

              let classNames = "option-item";
              if (isAnswered && explainData) {
                if (letter === explainData.correct_answer) {
                  classNames += " correct";
                }
                if (currentAnswer && currentAnswer.selectedAnswer === letter && !currentAnswer.isCorrect && currentAnswer.selectedAnswer !== 'SKIP') {
                  classNames += " wrong";
                }
              }

              return (
                <div
                  key={idx}
                  className={classNames}
                  data-id={letter}
                  onClick={() => handleSelectAnswer(letter)}
                  style={{ cursor: isAnswered ? 'default' : 'pointer' }}
                >
                  <div className="option-letter">{letter}</div>
                  <div className="option-text">{cleanText}</div>
                  <div className="option-icon icon-correct">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div className="option-icon icon-wrong">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nút Skip */}
          {!isAnswered && (
            <div className="skip-btn-container" id="skipContainer">
              <button
                type="button"
                className="skip-btn"
                onClick={() => handleSelectAnswer('SKIP')}
              >
                Chưa biết? Bỏ qua câu này để xem đáp án
              </button>
            </div>
          )}

          {/* Vùng Feedback giải thích từ AI */}
          {isAnswered && (
            <div className="feedback-container" style={{ display: 'block' }}>
              <p className="ai-tutor-message" id="aiMessage" style={{
                color: (currentAnswer && currentAnswer.isCorrect) ? "var(--friendly-green-dark)" : "var(--primary-color-dark)"
              }}>
                {loadingExplain && "Đang phân tích đáp án..."}
                {!loadingExplain && currentAnswer && currentAnswer.isCorrect && `Tutor: “Tuyệt vời! Bạn đã trả lời chính xác và được cộng ${currentAnswer.score} Elo!”`}
                {!loadingExplain && currentAnswer && !currentAnswer.isCorrect && (
                  currentAnswer.selectedAnswer === 'SKIP'
                    ? "Tutor: “Bạn đã bỏ qua câu hỏi. Hãy xem giải thích bên dưới để ôn tập nhé!”"
                    : "Tutor: “Đáp án chưa chính xác. Đừng nản lòng, hãy xem phần giải thích từ bài giảng nhé!”"
                )}
              </p>

              {!loadingExplain && explainData && (
                <div className={`explanation-box ${(!currentAnswer || !currentAnswer.isCorrect) ? 'wrong-mode' : ''}`} id="explanationBox">
                  <div className="explain-section">
                    <p className="explain-title green">✓ GIẢI THÍCH CHI TIẾT (Đáp án đúng: {explainData.correct_answer})</p>
                    <p className="explain-content">{explainData.explanation}</p>
                  </div>

                  {/* Trích dẫn Citations */}
                  {explainData.citations && explainData.citations.length > 0 && (
                    <div className="explain-section citations-section">
                      <p className="explain-title info" style={{ color: 'var(--primary-color-dark)' }}>📌 NGUỒN TÀI LIỆU TRÍCH DẪN (RAG)</p>
                      <div className="citations-list">
                        {explainData.citations.map((c, cIdx) => (
                          <div key={cIdx} className="citation-item">
                            <div className="citation-meta">
                              <span className="citation-tag">{c.chunk_id}</span>
                              {c.slide_file && (
                                <a href={`/data/vlearn-pack/slides/${c.slide_file}${c.slide_page ? `#page=${c.slide_page}` : ''}`} target="_blank" rel="noreferrer" className="citation-link">
                                  📄 Slide: {c.slide_file} (Trang {c.slide_page || 1})
                                </a>
                              )}
                              {c.source_file && (
                                <a href={`/data/vlearn-pack/transcript/${c.source_file}`} target="_blank" rel="noreferrer" className="citation-link">
                                  📝 Transcript: {c.source_file}
                                </a>
                              )}
                            </div>
                            <blockquote className="citation-quote">"{c.quote}"</blockquote>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bottom-bar">
          <div className="hint-text">
            <div className="hint-group">
              <span className="hint-key">1</span>
              <span className="hint-key">2</span>
              <span className="hint-key">3</span>
              <span className="hint-key">4</span>
              để chọn
            </div>
            <div className="hint-group">
              <span className="hint-key">Enter</span>
              để tiếp tục
            </div>
          </div>
          <div className="footer-buttons">
            <button
              type="button"
              className="btn-outline"
              id="askAiTutorBtn"
              onClick={() => setShowChatDrawer(true)}
            >
              Hỏi AI Tutor
            </button>
            {isAnswered && (
              <button
                type="button"
                className="btn-action"
                id="nextBtn"
                style={{ display: 'block' }}
                onClick={() => handleNext()}
              >
                Tiếp tục &rarr;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Drawer (Socratic AI Tutor) */}
      <div className={`chat-drawer ${showChatDrawer ? 'open' : ''}`} id="chatDrawer">
        <div className="chat-drawer-header">
          <div className="chat-drawer-title">
            <span className="chat-status-indicator"></span>
            <b>AI Tutor Socratic</b>
          </div>
          <button
            type="button"
            className="chat-drawer-close"
            id="chatDrawerCloseBtn"
            aria-label="Đóng Chat"
            onClick={() => setShowChatDrawer(false)}
          >
            &times;
          </button>
        </div>
        <div className="chat-drawer-body" id="chatDrawerBody" ref={chatDrawerBodyRef}>
          <div className="chat-message system">
            Chào bạn! Mình là AI Tutor. Hãy đặt các câu hỏi về bài tập hiện tại, mình sẽ gợi mở, dẫn dắt để giúp bạn tự tìm câu trả lời mà không tiết lộ đáp án trực tiếp.
          </div>
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="chat-text">{msg.content}</div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="citations-list" style={{ marginTop: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                  {msg.citations.map((c, cIdx) => (
                    <div key={cIdx} className="citation-item" style={{ padding: '6px 10px', marginBottom: '4px', fontSize: '11px' }}>
                      <div className="citation-meta" style={{ gap: '4px', marginBottom: '2px' }}>
                        <span className="citation-tag" style={{ padding: '1px 4px', fontSize: '9px' }}>{c.chunk_id}</span>
                        {c.slide_file && (
                          <a href={`/data/vlearn-pack/slides/${c.slide_file}${c.slide_page ? `#page=${c.slide_page}` : ''}`} target="_blank" rel="noreferrer" className="citation-link" style={{ fontSize: '10px' }}>
                            📄 Slide (Trang {c.slide_page || 1})
                          </a>
                        )}
                      </div>
                      <blockquote className="citation-quote" style={{ fontSize: '10px', lineHeight: '1.3' }}>"{c.quote}"</blockquote>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isChatTyping && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>
        <div className="chat-drawer-footer">
          <input
            type="text"
            className="chat-input"
            id="chatInput"
            placeholder="Hỏi AI Tutor điều gì đó..."
            value={chatInputText}
            onChange={(e) => setChatInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendChatMessage();
            }}
          />
          <button
            type="button"
            className="chat-send-btn"
            id="chatSendBtn"
            onClick={handleSendChatMessage}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* Modal Kết Quả Lớn (Scoreboard) */}
      {showScoreboard && (
        <div className="modal-overlay" id="scoreboardModal">
          <div className="scoreboard-content">
            <div className="scoreboard-icon">🏆</div>
            <h2 className="scoreboard-title">Kết Quả Luyện Tập</h2>
            <div className="scoreboard-stats">
              <div className="stat-card">
                <span className="stat-value">
                  {answersState.filter(ans => ans && ans.isCorrect).length} / {quizzes.length}
                </span>
                <span className="stat-label">Câu trả lời đúng</span>
              </div>
              <div className="stat-card highlight">
                <span className="stat-value">{eloScore}</span>
                <span className="stat-label">Elo còn lại</span>
              </div>
            </div>
            <div className="scoreboard-evaluation" id="evaluationText">
              {getEvaluationText()}
            </div>
            <div className="scoreboard-buttons">
              <button
                type="button"
                className="btn-action"
                onClick={() => {
                  setCurrentIdx(0);
                  setEloScore(100);
                  setIsAnswered(false);
                  setAnswersState(Array(quizzes.length).fill(null));
                  setCurrentHintLevelUsed(0);
                  setActiveHintText('');
                  setActiveHintCitations([]);
                  setExplainData(null);
                  setChatHistory([]);
                  setShowHintContent(false);
                  setShowScoreboard(false);
                }}
              >
                Làm lại bài
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => navigate('/')}
              >
                Quay lại Khóa học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}