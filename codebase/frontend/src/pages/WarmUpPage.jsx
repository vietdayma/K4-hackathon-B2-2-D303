import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './WarmUpPage.css';

const scenes = [
  {
    id: "two-seconds",
    characterMode: "minh",
    dialogue: [
      {
        speaker: "Minh",
        side: "left",
        text: "Mình vừa gõ một câu hỏi vào ChatGPT. Hai giây sau, một câu trả lời trôi chảy đã xuất hiện."
      }
    ],
    question: "Bạn nghĩ trong 2 giây đó, AI vừa làm gì?",
    answers: [
      "Tra trong kho dữ liệu khổng lồ để tìm câu có sẵn giống hệt",
      "Đoán lần lượt từng mảnh chữ tiếp theo, dựa theo xác suất",
      "Chạy qua hàng triệu luật if–else được lập trình sẵn"
    ],
    results: [18, 67, 15]
  },
  {
    id: "history",
    characterMode: "nam",
    dialogue: [
      {
        speaker: "Nam",
        side: "right",
        text: "AI nghe mới toanh nhỉ? Cứ như nó sinh ra cùng lúc với ChatGPT. Nhưng cái tên “Artificial Intelligence” đã có từ rất lâu rồi."
      }
    ],
    question: "Bạn đoán cái tên “Artificial Intelligence” chính thức ra đời từ năm nào?",
    answers: ["1956", "1985", "2012"],
    results: [49, 21, 30]
  },
  {
    id: "understand",
    characterMode: "both",
    dialogue: [
      {
        speaker: "Minh",
        side: "left",
        text: "Nó chỉ đoán chữ tiếp theo thôi. Chắc chắn chẳng hiểu gì cả!"
      },
      {
        speaker: "Nam",
        side: "right",
        text: "Nhưng nếu không hiểu gì... sao nó trả lời hợp lý dữ vậy?"
      }
    ],
    question: "Bạn nghiêng về phe ai?",
    answers: [
      "Phe Minh — AI chỉ đang học vẹt cực giỏi",
      "Phe Nam — bên trong AI có một dạng hiểu biết nào đó"
    ],
    results: [46, 54]
  },
  {
    id: "cost",
    characterMode: "minh",
    dialogue: [
      {
        speaker: "Minh",
        side: "left",
        text: "Mình chỉ gõ một câu ngắn, AI lại viết ra cả đoạn dài. Lạ là phần AI viết ra thường bị tính tiền đắt hơn phần mình gõ vào."
      }
    ],
    question: "Theo bạn, vì sao “chữ AI viết ra” lại đắt hơn “chữ bạn gõ vào”?",
    answers: [
      "AI phải xử lý lại toàn bộ ngữ cảnh mỗi khi viết thêm một mảnh chữ",
      "Đầu ra dài hơn và cần nhiều bước tính toán nối tiếp",
      "Chủ yếu vì các hãng chọn cách định giá như vậy"
    ],
    results: [41, 45, 14]
  },
  {
    id: "agent",
    characterMode: "both",
    dialogue: [
      {
        speaker: "Nam",
        side: "right",
        text: "Một AI chỉ ngồi trả lời câu hỏi của bạn."
      },
      {
        speaker: "Minh",
        side: "left",
        text: "AI kia lại tự tìm thông tin, đặt lịch, rồi gửi email luôn!"
      }
    ],
    question: "Bạn nghĩ điểm khác biệt cốt lõi giữa chatbot và agent nằm ở đâu?",
    answers: [
      "Agent có thể dùng công cụ bên ngoài",
      "Agent tự lập kế hoạch và hành động qua nhiều bước",
      "Agent nhớ mục tiêu lâu hơn một lượt trò chuyện"
    ],
    results: [24, 61, 15]
  }
];

const keyMomentsData = [
  ["Token & xác suất", "Mô hình tạo câu trả lời bằng cách dự đoán từng token tiếp theo theo xác suất."],
  ["Một lịch sử dài hơn ChatGPT", "Tên gọi Artificial Intelligence đã xuất hiện từ năm 1956, rất lâu trước làn sóng AI tạo sinh."],
  ["Hiểu hay học vẹt?", "Khả năng trả lời hợp lý mở ra tranh luận: mô hình đang hiểu, hay chỉ bắt chước cực kỳ giỏi?"],
  ["Thí nghiệm Othello-GPT", "Một cách quan sát xem mô hình có tự hình thành biểu diễn bên trong về thế giới hay không."],
  ["Chi phí đầu ra", "AI phải tính toán nối tiếp khi sinh từng token, khiến phần viết ra thường tốn kém hơn phần nhập vào."],
  ["Chatbot và agent", "Agent không chỉ trả lời mà còn lập kế hoạch, dùng công cụ và hành động qua nhiều bước."]
];

const initialComments = [
  {
    id: "starter-ha",
    author: "Hà",
    initials: "H",
    time: "8 phút trước",
    text: "Nếu AI chỉ đoán chữ tiếp theo, tại sao nó vẫn giải thích một ý khó nghe rất hợp lý?",
    reactions: 12,
    liked: false,
    replies: [
      {
        id: "reply-linh",
        author: "Linh",
        initials: "L",
        time: "5 phút trước",
        text: "Mình cũng tò mò: trả lời hợp lý có đủ để gọi là hiểu không?"
      }
    ]
  },
  {
    id: "starter-quan",
    author: "Quân",
    initials: "Q",
    time: "14 phút trước",
    text: "Mình muốn biết vì sao câu trả lời dài thường tốn nhiều hơn câu mình vừa gõ.",
    reactions: 8,
    liked: false,
    replies: []
  },
  {
    id: "starter-mai",
    author: "Mai",
    initials: "M",
    time: "21 phút trước",
    text: "Chatbot và agent khác nhau ở “biết làm” hay ở “được quyền làm” nhỉ?",
    reactions: 15,
    liked: false,
    replies: []
  }
];

export default function WarmUpPage() {
  const [view, setView] = useState('cover'); // cover, dialogue, question, results, discussion, moments, finale
  const [sceneIndex, setSceneIndex] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  // Comments state
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('warmup_comments');
    return saved ? JSON.parse(saved) : initialComments;
  });

  const [commentInput, setCommentInput] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);

  const lottieAnim = useRef(null);

  // Khởi tạo Lottie
  useEffect(() => {
    const initLottie = () => {
      if (window.lottie && !lottieAnim.current && (view === 'cover' || view === 'dialogue' || view === 'question' || view === 'results')) {
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
  }, [view]);

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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleNextAction();
      }
      if (view === 'question' && selectedIndex === null) {
        if (e.key === '1') selectAnswer(0);
        if (e.key === '2') selectAnswer(1);
        if (e.key === '3') {
          const currentScene = scenes[sceneIndex];
          if (currentScene.answers.length >= 3) {
            selectAnswer(2);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, sceneIndex, dialogueIndex, selectedIndex, commentInput, replyingToId]);

  const selectAnswer = (idx) => {
    setSelectedIndex(idx);
    setView('results');
    
    // Play correct mascot reaction animation
    loadBeaAnimation('/assets/duolingo-lottie/bea-correct.json', false);
    setTimeout(() => {
      // Restore idle animation
      loadBeaAnimation('/assets/duolingo-lottie/bea-idle.json', true);
    }, 2000);
  };

  const handleNextAction = () => {
    if (view === 'cover') {
      setView('dialogue');
      setSceneIndex(0);
      setDialogueIndex(0);
      setSelectedIndex(null);
    } else if (view === 'dialogue') {
      const currentScene = scenes[sceneIndex];
      if (dialogueIndex < currentScene.dialogue.length - 1) {
        setDialogueIndex(prev => prev + 1);
      } else {
        setView('question');
      }
    } else if (view === 'question') {
      // Must select first
      if (selectedIndex === null) return;
    } else if (view === 'results') {
      setSelectedIndex(null);
      if (sceneIndex < scenes.length - 1) {
        setSceneIndex(prev => prev + 1);
        setDialogueIndex(0);
        setView('dialogue');
      } else {
        setView('finale');
      }
    } else if (view === 'finale') {
      setView('cover');
    } else if (view === 'discussion') {
      setView('dialogue');
      setSceneIndex(0);
      setDialogueIndex(0);
      setSelectedIndex(null);
    } else if (view === 'moments') {
      setView('cover');
    }
  };

  // Post comment
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const text = commentInput.trim();
    if (!text) return;

    if (replyingToId) {
      // reply mode
      const updated = comments.map(c => {
        if (c.id === replyingToId) {
          return {
            ...c,
            replies: [
              ...c.replies,
              {
                id: `reply-${Date.now()}`,
                author: "Bạn",
                initials: "B",
                time: "vừa xong",
                text: text.slice(0, 180)
              }
            ]
          };
        }
        return c;
      });
      setComments(updated);
      localStorage.setItem('warmup_comments', JSON.stringify(updated));
      setReplyingToId(null);
    } else {
      // new comment mode
      const newComment = {
        id: `local-${Date.now()}`,
        author: "Bạn",
        initials: "B",
        time: "vừa xong",
        text: text.slice(0, 240),
        reactions: 0,
        liked: false,
        replies: []
      };
      const updated = [newComment, ...comments];
      setComments(updated);
      localStorage.setItem('warmup_comments', JSON.stringify(updated));
    }
    setCommentInput('');
  };

  const handleLikeComment = (commentId) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          reactions: c.liked ? Math.max(0, c.reactions - 1) : c.reactions + 1,
          liked: !c.liked
        };
      }
      return c;
    });
    setComments(updated);
    localStorage.setItem('warmup_comments', JSON.stringify(updated));
  };

  const toggleReplyComposer = (id) => {
    setReplyingToId(replyingToId === id ? null : id);
    setCommentInput('');
  };

  // Header helpers
  const attemptActive = view === 'dialogue' || view === 'question' || view === 'results';
  const getProgressVal = () => {
    if (view === 'finale') return 1;
    if (!attemptActive) return 0;
    return sceneIndex / scenes.length;
  };

  const getProgressLabelText = () => {
    if (view === 'cover') return "Sẵn sàng";
    if (view === 'discussion') return "Thảo luận";
    if (view === 'moments') return "Key moments";
    if (view === 'finale') return "Hoàn tất";
    return `${sceneIndex + 1} / ${scenes.length}`;
  };

  const currentScene = scenes[sceneIndex];
  const activeDialogue = currentScene ? currentScene.dialogue[dialogueIndex] : null;

  // Mascot display state
  const isLeftVisible = view === 'cover' || (currentScene && (currentScene.characterMode === 'minh' || currentScene.characterMode === 'both'));
  const isRightVisible = view === 'cover' || (currentScene && (currentScene.characterMode === 'nam' || currentScene.characterMode === 'both'));
  const activeSide = (view === 'dialogue' && activeDialogue) ? activeDialogue.side : null;

  // Primary action button configurations
  const getButtonConfig = () => {
    if (view === 'cover') {
      return { label: "Bắt đầu", disabled: false, keycap: "Space", hint: "để vào làm bài" };
    }
    if (view === 'dialogue') {
      return { label: "Tiếp tục", disabled: false, keycap: "Space", hint: "để tiếp lời" };
    }
    if (view === 'question') {
      return { label: "Tiếp tục", disabled: selectedIndex === null, keycap: "1–3", hint: "để chọn nhanh" };
    }
    if (view === 'results') {
      return { 
        label: sceneIndex === scenes.length - 1 ? "Xem lời kết" : "Câu tiếp theo", 
        disabled: false, 
        keycap: "Enter", 
        hint: "để tiếp tục" 
      };
    }
    if (view === 'discussion') {
      return { label: "Làm warm-up", disabled: false, keycap: "Space", hint: "để vào làm bài" };
    }
    if (view === 'moments' || view === 'finale') {
      return { label: "Về sảnh chờ", disabled: false, keycap: "Space", hint: "để xem lựa chọn khác" };
    }
    return { label: "Tiếp tục", disabled: false, keycap: "Space", hint: "để tiếp lời" };
  };

  const buttonConfig = getButtonConfig();

  // Helper render chat log inside scene Content
  const renderChatLog = (scene, visibleCount) => {
    const lines = scene.dialogue.slice(0, visibleCount);
    return (
      <section className="chat-log chat-log--compact" aria-label="Các câu đã nói">
        <div className="chat-log-messages">
          {lines.map((message, idx) => (
            <article key={idx} className={`chat-message chat-message--${message.side}`}>
              <span className="chat-speaker">{message.speaker}</span>
              <p>{message.text}</p>
            </article>
          ))}
        </div>
      </section>
    );
  };

  const replyingComment = replyingToId ? comments.find(c => c.id === replyingToId) : null;

  return (
    <div className="warmup-page-wrapper">
      <div className="app-shell">
        
        {/* Header Topbar */}
        <header className={`topbar ${!attemptActive ? 'topbar--overview' : 'topbar--attempt'}`} id="warmupTopbar" aria-label={attemptActive ? "Tiến độ warm-up" : "Điều hướng warm-up"}>
          <div className="brand" aria-label="AI Warm-up">
            <span className="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
            <span>AI Warm-up</span>
          </div>

          <div className="progress-wrap" id="progressWrap" hidden={!attemptActive}>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" id="progressFill" style={{ transform: `scaleX(${getProgressVal()})` }}></div>
            </div>
            <span className="progress-label" id="progressLabel">{getProgressLabelText()}</span>
          </div>

          <div className="header-actions">
            <Link className="soundless-badge soundless-badge--course" id="courseBackLink" to="/" hidden={attemptActive}>
              <span aria-hidden="true">←</span> Về khóa học
            </Link>
            <button 
              className="soundless-badge soundless-badge--exit" 
              id="exitButton" 
              type="button" 
              hidden={!attemptActive}
              onClick={() => setView('cover')}
            >
              <span aria-hidden="true">×</span> Thoát
            </button>
            <button className="soundless-badge" id="fullscreenButton" type="button" aria-label="Bật chế độ trình chiếu toàn màn">
              <span aria-hidden="true">⛶</span> Toàn màn
            </button>
            <button 
              className="soundless-badge" 
              id="replayButton" 
              type="button" 
              aria-label="Phát lại đoạn thoại" 
              disabled={!attemptActive}
              onClick={() => setDialogueIndex(0)}
            >
              <span aria-hidden="true">↻</span> Phát lại
            </button>
          </div>
        </header>

        {/* Main Lesson Screen */}
        <main className="screen" id="screen">
          <section className={`stage ${view === 'discussion' ? 'stage--community' : (view === 'moments' || view === 'finale') ? 'stage--keymoments' : view === 'dialogue' ? 'stage--dialogue' : ''}`} aria-label="Warm-up AI">
            
            {/* Left slot character */}
            <div 
              className={`character-slot character-slot--left ${isLeftVisible ? 'is-visible' : ''} ${activeSide === 'left' ? 'is-speaking' : ''} ${(activeSide !== null && activeSide !== 'left') ? 'is-listening' : ''}`} 
              id="leftCharacter" 
              aria-hidden={!isLeftVisible}
            >
              <div className="speaker-chip" id="leftSpeakerChip">Minh đang nói</div>
              <div className="character-art character-art--bea">
                <div className="lottie-crop">
                  <div className="lottie-source" id="beaLottie"></div>
                </div>
              </div>
            </div>

            {/* Middle Lesson Canvas */}
            <div className="scene-content" id="sceneContent">
              
              {/* Cover view */}
              {view === 'cover' && (
                <section className="lobby" aria-labelledby="lobbyTitle">
                  <div className="lobby-intro">
                    <p className="cover-prompt">Sảnh chờ · trước buổi học ngày mai</p>
                    <h1 id="lobbyTitle">AI đang làm gì trong 2 giây?</h1>
                    <p>Năm tình huống ngắn, không có đúng sai — chỉ để xem cả lớp đang nghĩ gì trước khi vào bài.</p>
                  </div>
                  <div className="lobby-actions">
                    <button className="lobby-card lobby-card--start" type="button" onClick={() => { setView('dialogue'); setSceneIndex(0); setDialogueIndex(0); setSelectedIndex(null); }}>
                      <span className="lobby-card-icon" aria-hidden="true">▶</span>
                      <span className="lobby-card-kicker">Khoảng 4 phút · 5 tình huống</span>
                      <strong>Làm warm-up</strong>
                      <span>Chọn ý kiến của bạn và xem góc nhìn mô phỏng của lớp.</span>
                      <span className="lobby-card-link">Vào làm bài <b aria-hidden="true">→</b></span>
                    </button>
                    <button className="lobby-card lobby-card--discussion" type="button" onClick={() => setView('discussion')}>
                      <span className="lobby-card-icon" aria-hidden="true">◌</span>
                      <span className="lobby-card-kicker">Đọc trước khi vào lớp</span>
                      <strong>Xem thảo luận</strong>
                      <span>Những băn khoăn đang mở quanh bài học ngày mai.</span>
                      <span className="lobby-card-link">Mở thảo luận <b aria-hidden="true">→</b></span>
                    </button>
                    <button className="lobby-card lobby-card--moments" type="button" onClick={() => setView('moments')}>
                      <span className="lobby-card-icon" aria-hidden="true">◆</span>
                      <span className="lobby-card-kicker">Tóm tắt riêng cho Bài 1</span>
                      <strong>Key moments</strong>
                      <span>Xem lại các câu hỏi và khái niệm quan trọng được gợi mở trong warm-up.</span>
                      <span className="lobby-card-link">Mở bản đồ <b aria-hidden="true">→</b></span>
                    </button>
                  </div>
                </section>
              )}

              {/* Dialogue balloon view */}
              {view === 'dialogue' && activeDialogue && (
                <div className="scene-stack scene-stack--dialogue">
                  <p className="scene-index">Tình huống {sceneIndex + 1} / {scenes.length}</p>
                  {dialogueIndex > 0 && renderChatLog(currentScene, dialogueIndex)}
                  <article className={`dialogue-balloon dialogue-balloon--${activeDialogue.side}`}>
                    <span className="dialogue-balloon-speaker">{activeDialogue.speaker}</span>
                    <p>{activeDialogue.text}</p>
                  </article>
                  <p className="dialogue-prompt">{activeDialogue.speaker} đang dẫn chuyện…</p>
                </div>
              )}

              {/* Question panel / Results view */}
              {(view === 'question' || view === 'results') && currentScene && (
                <div className="scene-stack scene-stack--question">
                  {renderChatLog(currentScene, currentScene.dialogue.length)}
                  <div className="question-panel">
                    <p className="question-kicker">
                      {view === 'results' ? "Góc nhìn của lớp mình" : `Tình huống ${sceneIndex + 1} / ${scenes.length}`}
                    </p>
                    <h1 id="sceneQuestion">{currentScene.question}</h1>
                    {view === 'results' && (
                      <p className="results-note">
                        <span>Không có đúng hay sai.</span>
                        <strong>100 lượt chọn giả lập</strong>
                      </p>
                    )}
                    <div className="answer-list" role={view === 'results' ? 'list' : 'group'} aria-label="Các lựa chọn">
                      {currentScene.answers.map((ans, idx) => {
                        const isSelected = selectedIndex === idx;
                        const hasResult = view === 'results';
                        const percent = currentScene.results[idx];

                        return (
                          <button
                            key={idx}
                            className={`answer ${isSelected ? 'is-selected' : ''}`}
                            type="button"
                            disabled={hasResult}
                            onClick={() => selectAnswer(idx)}
                          >
                            <span className="answer-number" aria-hidden="true">{idx + 1}</span>
                            <span className="answer-copy">{ans}</span>
                            {hasResult && <span className="answer-percent">{percent}%</span>}
                            {hasResult && (
                              <span 
                                className="result-fill" 
                                style={{ transform: `scaleX(${percent / 100})` }}
                              ></span>
                            )}
                            {hasResult && isSelected && <span className="selected-note">Ý kiến của bạn</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Discussion view */}
              {view === 'discussion' && (
                <section className="discussion" aria-labelledby="discussionTitle">
                  <div className="discussion-heading">
                    <div>
                      <p className="cover-prompt" id="discussionCount">Cộng đồng lớp học · {comments.length} bình luận</p>
                      <h1 id="discussionTitle">Thảo luận trước giờ học</h1>
                    </div>
                    <button className="text-nav" type="button" onClick={() => setView('cover')}>← Sảnh chờ</button>
                  </div>
                  
                  <div className="community-layout">
                    
                    {/* Form Composer */}
                    <div className="composer-side">
                      <form className={`comment-composer ${replyingComment ? 'comment-composer--reply' : ''}`} id="commentForm" onSubmit={handleCommentSubmit}>
                        <label id="commentComposerLabel" htmlFor="commentInput">
                          {replyingComment ? (
                            <>Đang trả lời <span className="reply-target-name">{replyingComment.author}</span></>
                          ) : (
                            "Bạn đang nghĩ gì?"
                          )}
                        </label>
                        <p id="commentComposerHelp">
                          {replyingComment ? (
                            <>Câu trả lời sẽ đăng dưới bình luận của <strong>{replyingComment.author}</strong>.</>
                          ) : (
                            "Đăng một câu hỏi hoặc góc nhìn để cả lớp cùng thảo luận."
                          )}
                        </p>
                        <textarea 
                          id="commentInput" 
                          maxLength="240" 
                          rows="8" 
                          placeholder={replyingComment ? `Viết câu trả lời cho ${replyingComment.author}…` : "Ví dụ: Nếu AI chỉ dự đoán, “hiểu” nghĩa là gì?"}
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                        ></textarea>
                        <div className="composer-actions">
                          <span id="commentCounter">{commentInput.length} / 240</span>
                          <div className="composer-buttons">
                            {replyingComment && (
                              <button type="button" className="composer-cancel-btn" id="cancelReplyBtn" onClick={() => { setReplyingToId(null); setCommentInput(''); }}>Hủy</button>
                            )}
                            <button id="commentSubmitButton" type="submit" disabled={commentInput.trim().length === 0}>
                              {replyingComment ? "Trả lời" : "Đăng bình luận"}
                            </button>
                          </div>
                        </div>
                      </form>
                      {replyingComment && (
                        <div className="composer-typing-indicator composer-typing-indicator--inline" aria-live="polite">
                          <div className="composer-typing-avatar" aria-hidden="true">B</div>
                          <div className="composer-typing-info">
                            <span className="composer-typing-label">Bạn · đang trả lời <strong>{replyingComment.author}</strong></span>
                            <span className="typing-dots" aria-hidden="true"><span></span><span></span><span></span></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Discussion Feed */}
                    <div className="community-feed" aria-label="Bình luận của cộng đồng">
                      {comments.map((comment) => (
                        <article key={comment.id} className="community-comment" data-comment-id={comment.id}>
                          <div className="comment-avatar" aria-hidden="true">{comment.initials}</div>
                          <div className="comment-body">
                            <div className="comment-meta">
                              <strong>{comment.author}</strong>
                              <span>{comment.time}</span>
                            </div>
                            <p>{comment.text}</p>
                            <div className="comment-tools">
                              <button 
                                className={`comment-reaction ${comment.liked ? 'is-liked' : ''}`} 
                                type="button"
                                onClick={() => handleLikeComment(comment.id)}
                              >
                                <span aria-hidden="true">{comment.liked ? "♥" : "♡"}</span> {comment.reactions}
                              </button>
                              <button 
                                className="comment-reply-button" 
                                type="button"
                                onClick={() => toggleReplyComposer(comment.id)}
                              >
                                Trả lời{comment.replies.length > 0 ? ` · ${comment.replies.length}` : ""}
                              </button>
                            </div>
                            {comment.replies.length > 0 && (
                              <div className="comment-replies">
                                {comment.replies.map((reply) => (
                                  <article key={reply.id} className="comment-reply">
                                    <div className="reply-avatar" aria-hidden="true">{reply.initials}</div>
                                    <div>
                                      <div className="comment-meta">
                                        <strong>{reply.author}</strong>
                                        <span>{reply.time}</span>
                                      </div>
                                      <p>{reply.text}</p>
                                    </div>
                                  </article>
                                ))}
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>

                  </div>
                </section>
              )}

              {/* Key Moments & Finale */}
              {(view === 'moments' || view === 'finale') && (
                <section className="finale" aria-labelledby="finaleTitle">
                  <div className="key-moment-heading">
                    <div>
                      <p className="cover-prompt">
                        {view === 'finale' ? "Warm-up Bài 1 hoàn tất · 5 / 5" : "Bài 1 · Bản đồ kiến thức"}
                      </p>
                      <h1 id="finaleTitle">Key moments</h1>
                    </div>
                    <div className="key-moment-stats" aria-label={`Bài 1 có ${keyMomentsData.length} key moments`}>
                      <span><strong>01</strong> bài học</span>
                      <span><strong>{keyMomentsData.length}</strong> key moments</span>
                    </div>
                  </div>
                  <div className="key-moment-scroll" aria-label="Danh sách key moments của Bài 1">
                    <div className="key-card-grid">
                      {keyMomentsData.map(([title, desc], idx) => (
                        <article key={idx} className="key-card">
                          <span className="moment-index">{String(idx + 1).padStart(2, "0")}</span>
                          <div>
                            <h2>{title}</h2>
                            <p>{desc}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                  <p className="closing-line">Bạn đang dùng AI mỗi ngày — nhưng thực sự bên trong nó đang làm gì? Câu trả lời đầy đủ đang chờ bạn trong buổi học ngày mai.</p>
                </section>
              )}

            </div>

            {/* Right slot mascot character (Falstaff bear) */}
            <div 
              className={`character-slot character-slot--right ${isRightVisible ? 'is-visible' : ''} ${activeSide === 'right' ? 'is-speaking' : ''} ${(activeSide !== null && activeSide !== 'right') ? 'is-listening' : ''}`} 
              id="rightCharacter" 
              aria-hidden={!isRightVisible}
            >
              <div className="speaker-chip" id="rightSpeakerChip">Nam đang nói</div>
              <div className="character-art character-art--falstaff">
                <img className="static-mascot" src="/assets/duolingo-lottie/falstaff-avatar.svg" alt="" />
              </div>
            </div>

          </section>
        </main>

        {/* Footer Actionbar */}
        <footer className="actionbar">
          <div className="action-hint" id="actionHint">
            <span className="keycap">{buttonConfig.keycap}</span>
            <span>{buttonConfig.hint}</span>
          </div>
          <button 
            className="primary-button" 
            id="primaryAction" 
            type="button"
            disabled={buttonConfig.disabled}
            onClick={handleNextAction}
          >
            {buttonConfig.label}
            <span aria-hidden="true">→</span>
          </button>
        </footer>

      </div>
    </div>
  );
}
