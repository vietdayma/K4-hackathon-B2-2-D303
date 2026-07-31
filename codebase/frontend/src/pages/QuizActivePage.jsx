import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WarmUpPage.css';
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

  const lottieAnim = useRef(null);

  const loadBeaAnimation = (path, loop) => {
    if (lottieAnim.current) {
      lottieAnim.current.destroy();
      lottieAnim.current = null;
    }
    if (window.lottie) {
      const element = document.getElementById('beaLottie');
      if (element) {
        lottieAnim.current = window.lottie.loadAnimation({
          container: element,
          renderer: 'svg',
          loop: loop,
          autoplay: true,
          path: path,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet'
          }
        });
      }
    }
  };

  // Khởi tạo Lottie Bea
  useEffect(() => {
    const initLottie = () => {
      if (window.lottie && !lottieAnim.current) {
        const element = document.getElementById('beaLottie');
        if (element) {
          lottieAnim.current = window.lottie.loadAnimation({
            container: element,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/assets/duolingo-lottie/bea-idle.json',
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid meet'
            }
          });
        }
      }
    };
    const timer = setTimeout(initLottie, 50);
    return () => {
      clearTimeout(timer);
      if (lottieAnim.current) {
        lottieAnim.current.destroy();
        lottieAnim.current = null;
      }
    };
  }, [currentIdx]);

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
        loadBeaAnimation('/assets/duolingo-lottie/bea-correct.json', false);
        setTimeout(() => {
          loadBeaAnimation('/assets/duolingo-lottie/bea-idle.json', true);
        }, 2000);
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
    <div className="warmup-page-wrapper">
      <div className="app-shell">

        {/* Header Topbar */}
        <header className="topbar topbar--attempt" id="warmupTopbar">
          <div className="brand" aria-label="AI Tutor Quiz">
            <span className="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
            <span>AI Quiz</span>
          </div>

          <div className="progress-wrap" id="progressWrap">
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" id="progressFill" style={{ transform: `scaleX(${(currentIdx + (isAnswered ? 1 : 0)) / quizzes.length})` }}></div>
            </div>
            <span className="progress-label" id="progressLabel">{currentIdx + 1} / {quizzes.length}</span>
          </div>

          <div className="header-actions">
            <button
              className="soundless-badge soundless-badge--exit"
              id="exitButton"
              type="button"
              onClick={() => navigate('/quiz/survey')}
            >
              <span aria-hidden="true">×</span> Thoát
            </button>
            <div className="soundless-badge" style={{ borderColor: '#fcd34d', color: '#b45309', background: '#fef3c7', fontWeight: 900 }}>
              Elo: <span>{eloScore}</span>
            </div>
          </div>
        </header>

        {/* Main Stage */}
        <main className="screen" id="screen">
          <section className="stage stage--dialogue">

            {/* Left Mascot Character (AI Tutor Bea) */}
            <div
              className={`character-slot character-slot--left is-visible ${isAnswered || showHintContent ? 'is-speaking' : 'is-listening'}`}
              id="leftCharacter"
            >
              <div className="speaker-chip">AI Tutor đang nói</div>
              <div className="character-art character-art--bea">
                <div className="lottie-crop">
                  <div className="lottie-source" id="beaLottie"></div>
                </div>
              </div>
            </div>

            {/* Middle Lesson Canvas */}
            <div className="scene-content" id="sceneContent" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - var(--topbar-height) - var(--actionbar-height) - 40px)', paddingBottom: '60px', scrollbarWidth: 'none' }}>
              <div className="question-panel">
                <p className="question-kicker">Câu {currentIdx + 1} / {quizzes.length}</p>
                <h1 style={{ fontSize: 'clamp(20px, 2.2vw, 30px)', fontWeight: '950', lineHeight: '1.25' }}>{currentQuiz.question}</h1>
              </div>

              {/* Answer options */}
              <div className="answer-list" style={{ marginTop: '20px' }}>
                {currentQuiz.options.map((optionText, idx) => {
                  const letter = optionLetters[idx];

                  let cleanText = optionText;
                  if (optionText.startsWith(`${letter}. `)) {
                    cleanText = optionText.substring(3);
                  } else if (optionText.startsWith(`${letter}.`)) {
                    cleanText = optionText.substring(2);
                  }

                  const isSelected = currentAnswer && currentAnswer.selectedAnswer === letter;
                  const hasResult = isAnswered && explainData;

                  let btnClass = "answer";
                  if (isSelected) btnClass += " is-selected";
                  if (hasResult) {
                    if (letter === explainData.correct_answer) {
                      btnClass += " correct-answer";
                    } else if (isSelected && !currentAnswer.isCorrect && currentAnswer.selectedAnswer !== 'SKIP') {
                      btnClass += " wrong-answer";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      className={btnClass}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectAnswer(letter)}
                      style={isAnswered ? { cursor: 'default' } : {}}
                    >
                      <span className="answer-number">{idx + 1}</span>
                      <span className="answer-copy">{cleanText}</span>
                      {hasResult && letter === explainData.correct_answer && (
                        <span className="selected-note" style={{ color: 'var(--leaf-strong)', bottom: '15px' }}>ĐÚNG</span>
                      )}
                      {hasResult && isSelected && !currentAnswer.isCorrect && currentAnswer.selectedAnswer !== 'SKIP' && (
                        <span className="selected-note" style={{ color: 'var(--danger)', bottom: '15px' }}>SAI</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Skip Button */}
              {!isAnswered && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="soundless-badge"
                    style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                    onClick={() => handleSelectAnswer('SKIP')}
                  >
                    Chưa biết? Bỏ qua câu này để xem đáp án
                  </button>
                </div>
              )}

              {/* HINT Dialogue Card */}
              {showHintContent && (
                <div style={{ marginTop: '24px' }}>
                  <div className="dialogue-card" data-side="left">
                    <span className="speaker-name">AI Tutor (Gợi ý)</span>
                    {!currentHintLevelUsed ? (
                      <div>
                        <p style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800' }}>Chọn cấp độ gợi ý (Khấu trừ Elo tương ứng):</p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button type="button" className="soundless-badge" style={{ cursor: 'pointer' }} onClick={() => handleGetHint(1)} disabled={loadingHintLevel !== null}>Cấp 1: Chủ đề (-20 Elo)</button>
                          <button type="button" className="soundless-badge" style={{ cursor: 'pointer' }} onClick={() => handleGetHint(2)} disabled={loadingHintLevel !== null}>Cấp 2: Định nghĩa (-30 Elo)</button>
                          <button type="button" className="soundless-badge" style={{ cursor: 'pointer' }} onClick={() => handleGetHint(3)} disabled={loadingHintLevel !== null}>Cấp 3: Gợi ý sát (-50 Elo)</button>
                        </div>
                      </div>
                    ) : (
                      <div className="dialogue-text" style={{ fontSize: '17px', fontWeight: '750', lineHeight: '1.4' }}>
                        {loadingHintLevel ? "Đang tải gợi ý từ AI..." : activeHintText}

                        {/* Citations in Hint */}
                        {activeHintCitations.length > 0 && (
                          <div className="citations-list" style={{ marginTop: '12px', borderTop: '1px dashed var(--line-strong)', paddingTop: '10px' }}>
                            {activeHintCitations.map((c, cIdx) => (
                              <div key={cIdx} className="citation-item" style={{ padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid var(--line-strong)' }}>
                                <div className="citation-meta" style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                  <span className="citation-tag" style={{ background: 'var(--line-strong)', padding: '1px 6px', fontSize: '11px', borderRadius: '4px' }}>{c.chunk_id}</span>
                                  {c.slide_file && (
                                    <a href={`/data/vlearn-pack/slides/${c.slide_file}${c.slide_page ? `#page=${c.slide_page}` : ''}`} target="_blank" rel="noreferrer" className="citation-link" style={{ fontSize: '12px', color: 'var(--sky-deep)' }}>
                                      📄 Slide (Trang {c.slide_page || 1})
                                    </a>
                                  )}
                                </div>
                                <blockquote className="citation-quote" style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, paddingLeft: '6px', borderLeft: '2px solid var(--line-strong)', fontStyle: 'italic' }}>"{c.quote}"</blockquote>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: '12px' }}>
                          <button type="button" className="soundless-badge" style={{ minHeight: '32px', padding: '0 10px', fontSize: '12px', cursor: 'pointer' }} onClick={() => setCurrentHintLevelUsed(0)}>
                            Chọn mức gợi ý khác
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* EXPLAIN / FEEDBACK Dialogue Card */}
              {isAnswered && (
                <div style={{ marginTop: '24px' }}>
                  <div className="dialogue-card" data-side="left">
                    <span className="speaker-name">AI Tutor (Giải thích)</span>
                    <p className="ai-tutor-message" style={{
                      margin: '0 0 10px 0',
                      fontWeight: '900',
                      fontSize: '16px',
                      color: (currentAnswer && currentAnswer.isCorrect) ? "var(--leaf-strong)" : "var(--danger)"
                    }}>
                      {loadingExplain && "Đang phân tích đáp án..."}
                      {!loadingExplain && currentAnswer && currentAnswer.isCorrect && `✓ Trả lời chính xác! Bạn được cộng ${currentAnswer.score} Elo.`}
                      {!loadingExplain && currentAnswer && !currentAnswer.isCorrect && (
                        currentAnswer.selectedAnswer === 'SKIP'
                          ? "⚠ Bạn đã bỏ qua câu hỏi. Hãy xem giải thích bên dưới để ôn tập nhé!"
                          : "✗ Chưa chính xác. Đừng nản lòng, hãy xem phần giải thích từ bài giảng nhé!"
                      )}
                    </p>

                    {!loadingExplain && explainData && (
                      <div className="dialogue-text" style={{ fontSize: '16px', fontWeight: '750', lineHeight: '1.4', color: 'var(--ink)' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Đáp án đúng: {explainData.correct_answer}</strong>
                        </div>
                        <p style={{ margin: 0 }}>{explainData.explanation}</p>

                        {/* Citations in Explain */}
                        {explainData.citations && explainData.citations.length > 0 && (
                          <div className="explain-section citations-section" style={{ marginTop: '16px', borderTop: '1px dashed var(--line-strong)', paddingTop: '12px' }}>
                            <p className="explain-title info" style={{ color: 'var(--sky-deep)', fontSize: '13px', fontWeight: '900', margin: '0 0 8px 0' }}>📌 NGUỒN TÀI LIỆU TRÍCH DẪN (RAG)</p>
                            <div className="citations-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {explainData.citations.map((c, cIdx) => (
                                <div key={cIdx} className="citation-item" style={{ padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid var(--line-strong)' }}>
                                  <div className="citation-meta" style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                    <span className="citation-tag" style={{ background: 'var(--line-strong)', padding: '1px 6px', fontSize: '11px', borderRadius: '4px' }}>{c.chunk_id}</span>
                                    {c.slide_file && (
                                      <a href={`/data/vlearn-pack/slides/${c.slide_file}${c.slide_page ? `#page=${c.slide_page}` : ''}`} target="_blank" rel="noreferrer" className="citation-link" style={{ fontSize: '12px', color: 'var(--sky-deep)' }}>
                                        📄 Slide (Trang {c.slide_page || 1})
                                      </a>
                                    )}
                                    {c.source_file && (
                                      <a href={`/data/vlearn-pack/transcript/${c.source_file}`} target="_blank" rel="noreferrer" className="citation-link" style={{ fontSize: '12px', color: 'var(--sky-deep)' }}>
                                        📝 Transcript
                                      </a>
                                    )}
                                  </div>
                                  <blockquote className="citation-quote" style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, paddingLeft: '6px', borderLeft: '2px solid var(--line-strong)', fontStyle: 'italic' }}>"{c.quote}"</blockquote>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Mascot Character (Learner Bear) */}
            <div
              className={`character-slot character-slot--right is-visible ${isAnswered ? 'is-listening' : ''}`}
              id="rightCharacter"
            >
              <div className="speaker-chip">Học viên</div>
              <div className="character-art character-art--falstaff">
                <img className="static-mascot" src="/assets/duolingo-lottie/falstaff-avatar.svg" alt="" />
              </div>
            </div>

          </section>
        </main>

        {/* Footer Actionbar */}
        <footer className="actionbar">
          <div className="action-hint" id="actionHint">
            <span className="keycap">1-4</span>
            <span>để chọn nhanh</span>
            <span className="keycap">Enter</span>
            <span>để tiếp tục</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="soundless-badge"
              type="button"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setShowHintContent(prev => !prev);
                if (!showHintContent) {
                  setCurrentHintLevelUsed(0);
                  setActiveHintText('');
                  setActiveHintCitations([]);
                }
              }}
            >
              💡 Gợi ý (HINT)
            </button>
            <button
              className="soundless-badge"
              type="button"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowChatDrawer(true)}
            >
              💬 Hỏi AI Tutor
            </button>
            {isAnswered && (
              <button
                className="primary-button"
                id="primaryAction"
                type="button"
                onClick={handleNext}
              >
                {currentIdx === quizzes.length - 1 ? "Xem kết quả" : "Tiếp tục"}
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </footer>

      </div>

      {/* Socratic Chat Drawer */}
      <div className={`chat-drawer ${showChatDrawer ? 'open' : ''}`} id="chatDrawer" style={{ zIndex: 1000 }}>
        <div className="chat-drawer-header">
          <div className="chat-drawer-title">
            <span className="chat-status-indicator"></span>
            <b style={{ fontFamily: '"Arial Rounded MT Bold", "Nunito", sans-serif' }}>AI Tutor Socratic</b>
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
            <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`} style={{ borderRadius: '14px', fontFamily: '"Nunito", sans-serif' }}>
              <div className="chat-text" style={{ fontWeight: '700' }}>{msg.content}</div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="citations-list" style={{ marginTop: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                  {msg.citations.map((c, cIdx) => (
                    <div key={cIdx} className="citation-item" style={{ padding: '6px 10px', marginBottom: '4px', fontSize: '11px', background: '#f8fafc' }}>
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

      {/* Scoreboard Modal (Duolingo Style Finale) */}
      {showScoreboard && (
        <div className="modal-overlay" id="scoreboardModal">
          <div className="scoreboard-content" style={{ maxWidth: '520px', width: '92%', borderRadius: '24px', border: '2px solid var(--line-strong)', boxShadow: '0 8px 0 var(--line-strong)' }}>
            <div className="scoreboard-icon" style={{ fontSize: '64px' }}>🏆</div>
            <h2 className="scoreboard-title" style={{ fontFamily: '"Arial Rounded MT Bold", sans-serif', fontSize: '28px', fontWeight: '950' }}>Kết Quả Luyện Tập</h2>
            <div className="scoreboard-stats" style={{ display: 'flex', gap: '16px', margin: '20px 0' }}>
              <div className="stat-card" style={{ border: '2px solid var(--line-strong)' }}>
                <span className="stat-value" style={{ fontFamily: '"Arial Rounded MT Bold", sans-serif' }}>
                  {answersState.filter(ans => ans && ans.isCorrect).length} / {quizzes.length}
                </span>
                <span className="stat-label">Câu trả lời đúng</span>
              </div>
              <div className="stat-card highlight" style={{ background: '#fef3c7', border: '2px solid #fde68a' }}>
                <span className="stat-value" style={{ color: '#b45309', fontFamily: '"Arial Rounded MT Bold", sans-serif' }}>{eloScore}</span>
                <span className="stat-label" style={{ color: '#d97706' }}>Elo đạt được</span>
              </div>
            </div>
            <div className="scoreboard-evaluation" id="evaluationText" style={{ fontSize: '15px', fontWeight: '750', background: 'var(--sky-soft)', border: '2px solid var(--line-strong)', color: 'var(--ink)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
              {getEvaluationText()}
            </div>
            <div className="scoreboard-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                className="primary-button"
                style={{ width: '100%', minHeight: '48px' }}
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
                className="soundless-badge"
                style={{ width: '100%', minHeight: '48px', justifyContent: 'center', cursor: 'pointer' }}
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