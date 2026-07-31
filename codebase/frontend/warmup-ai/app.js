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

const keyMoments = [
  ["Token & xác suất", "Mô hình tạo câu trả lời bằng cách dự đoán từng token tiếp theo theo xác suất."],
  ["Một lịch sử dài hơn ChatGPT", "Tên gọi Artificial Intelligence đã xuất hiện từ năm 1956, rất lâu trước làn sóng AI tạo sinh."],
  ["Hiểu hay học vẹt?", "Khả năng trả lời hợp lý mở ra tranh luận: mô hình đang hiểu, hay chỉ bắt chước cực kỳ giỏi?"],
  ["Thí nghiệm Othello-GPT", "Một cách quan sát xem mô hình có tự hình thành biểu diễn bên trong về thế giới hay không."],
  ["Chi phí đầu ra", "AI phải tính toán nối tiếp khi sinh từng token, khiến phần viết ra thường tốn kém hơn phần nhập vào."],
  ["Chatbot và agent", "Agent không chỉ trả lời mà còn lập kế hoạch, dùng công cụ và hành động qua nhiều bước."]
];

const starterComments = [
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

const state = {
  view: "cover",
  sceneIndex: 0,
  dialogueIndex: 0,
  selectedIndex: null,
  timer: null,
  typeTimer: null,
  isTyping: false,
  communityComments: loadCommunityComments(),
  replyingTo: null,
  exitDestination: "lobby"
};

const mascotAnimations = {};

const elements = {
  stage: document.querySelector(".stage"),
  sceneContent: document.querySelector("#sceneContent"),
  progressFill: document.querySelector("#progressFill"),
  progressLabel: document.querySelector("#progressLabel"),
  leftCharacter: document.querySelector("#leftCharacter"),
  rightCharacter: document.querySelector("#rightCharacter"),
  leftSpeakerChip: document.querySelector("#leftSpeakerChip"),
  rightSpeakerChip: document.querySelector("#rightSpeakerChip"),
  primaryAction: document.querySelector("#primaryAction"),
  actionHint: document.querySelector("#actionHint"),
  fullscreenButton: document.querySelector("#fullscreenButton"),
  replayButton: document.querySelector("#replayButton"),
  exitButton: document.querySelector("#exitButton"),
  courseBackLink: document.querySelector("#courseBackLink"),
  exitDialog: document.querySelector("#exitDialog"),
  exitDialogTitle: document.querySelector("#exitDialogTitle"),
  exitDialogMessage: document.querySelector("#exitDialogMessage"),
  cancelExitButton: document.querySelector("#cancelExitButton"),
  confirmExitButton: document.querySelector("#confirmExitButton"),
  announcer: document.querySelector("#announcer")
};

function initLottie() {
  if (!window.lottie) return;

  mascotAnimations.bea = window.lottie.loadAnimation({
    container: document.querySelector("#beaLottie"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "assets/duolingo-lottie/bea-idle.json",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet"
    }
  });
}

function loadBeaAnimation(path, loop) {
  mascotAnimations.bea?.destroy();
  mascotAnimations.bea = window.lottie.loadAnimation({
    container: document.querySelector("#beaLottie"),
    renderer: "svg",
    loop,
    autoplay: true,
    path,
    rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
  });
}

function restoreBeaIdle() {
  if (!window.lottie || state.view === "results") return;
  loadBeaAnimation("assets/duolingo-lottie/bea-idle.json", true);
}

function clearSceneTimer() {
  if (state.timer) {
    window.clearTimeout(state.timer);
    state.timer = null;
  }
}

function clearTypeTimer() {
  if (state.typeTimer) {
    window.clearInterval(state.typeTimer);
    state.typeTimer = null;
  }
  state.isTyping = false;
}

function announce(message) {
  elements.announcer.textContent = "";
  window.setTimeout(() => {
    elements.announcer.textContent = message;
  }, 20);
}

function setProgress() {
  let progress = 0;
  let label = "Sảnh chờ";

  if (state.view === "discussion") {
    label = "Thảo luận";
  } else if (state.view === "keymoments") {
    label = "Key moments";
  } else if (state.view !== "cover") {
    progress = state.view === "finale" ? 1 : state.sceneIndex / scenes.length;
    label = state.view === "finale" ? "Hoàn tất" : `${state.sceneIndex + 1} / ${scenes.length}`;
  }

  elements.progressFill.style.transform = `scaleX(${progress})`;
  elements.progressLabel.textContent = label;
}

function setCharacterVisibility(mode, activeSide = null) {
  const leftVisible = mode === "minh" || mode === "both" || mode === "cover";
  const rightVisible = mode === "nam" || mode === "both" || mode === "cover";

  const update = (element, visible, side) => {
    element.classList.toggle("is-visible", visible);
    element.classList.toggle("is-speaking", visible && activeSide === side);
    element.classList.toggle(
      "is-listening",
      visible && activeSide !== null && activeSide !== side
    );
    element.setAttribute("aria-hidden", String(!visible));
  };

  update(elements.leftCharacter, leftVisible, "left");
  update(elements.rightCharacter, rightVisible, "right");

  elements.leftSpeakerChip.textContent = "Minh đang nói";
  elements.rightSpeakerChip.textContent = "Nam đang nói";
}

function renderCover() {
  clearSceneTimer();
  clearTypeTimer();
  elements.stage.classList.remove("stage--dialogue");
  restoreBeaIdle();
  setCharacterVisibility("cover");
  elements.sceneContent.innerHTML = `
    <section class="lobby" aria-labelledby="lobbyTitle">
      <div class="lobby-intro">
        <p class="cover-prompt">Sảnh chờ · trước buổi học ngày mai</p>
        <h1 id="lobbyTitle">AI đang làm gì trong 2 giây?</h1>
        <p>Năm tình huống ngắn, không có đúng sai — chỉ để xem cả lớp đang nghĩ gì trước khi vào bài.</p>
      </div>
      <div class="lobby-actions">
        <button class="lobby-card lobby-card--start" type="button" data-lobby-action="start">
          <span class="lobby-card-icon" aria-hidden="true">▶</span>
          <span class="lobby-card-kicker">Khoảng 4 phút · 5 tình huống</span>
          <strong>Làm warm-up</strong>
          <span>Chọn ý kiến của bạn và xem góc nhìn mô phỏng của lớp.</span>
          <span class="lobby-card-link">Vào làm bài <b aria-hidden="true">→</b></span>
        </button>
        <button class="lobby-card lobby-card--discussion" type="button" data-lobby-action="discussion">
          <span class="lobby-card-icon" aria-hidden="true">◌</span>
          <span class="lobby-card-kicker">Đọc trước khi vào lớp</span>
          <strong>Xem thảo luận</strong>
          <span>Những băn khoăn đang mở quanh bài học ngày mai.</span>
          <span class="lobby-card-link">Mở thảo luận <b aria-hidden="true">→</b></span>
        </button>
        <button class="lobby-card lobby-card--moments" type="button" data-lobby-action="moments">
          <span class="lobby-card-icon" aria-hidden="true">◆</span>
          <span class="lobby-card-kicker">Tóm tắt riêng cho Bài 1</span>
          <strong>Key moments</strong>
          <span>Xem lại các câu hỏi và khái niệm quan trọng được gợi mở trong warm-up.</span>
          <span class="lobby-card-link">Mở bản đồ <b aria-hidden="true">→</b></span>
        </button>
      </div>
    </section>
  `;
  document.querySelectorAll("[data-lobby-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.lobbyAction === "start") startWarmup();
      if (button.dataset.lobbyAction === "discussion") openDiscussion();
      if (button.dataset.lobbyAction === "moments") openKeyMoments();
    });
  });
  setAction("Làm warm-up", false, "Space", "để vào làm bài");
  elements.replayButton.disabled = true;
  setProgress();
}

function renderDiscussion() {
  clearSceneTimer();
  clearTypeTimer();
  elements.stage.classList.remove("stage--dialogue");
  restoreBeaIdle();
  setCharacterVisibility("none");
  elements.sceneContent.innerHTML = `
    <section class="discussion" aria-labelledby="discussionTitle">
      <div class="discussion-heading">
        <div>
          <p class="cover-prompt">Cộng đồng lớp học · ${state.communityComments.length} bình luận</p>
          <h1 id="discussionTitle">Thảo luận trước giờ học</h1>
        </div>
        <button class="text-nav" type="button" data-discussion-action="lobby">← Sảnh chờ</button>
      </div>
      <div class="community-layout">
        <form class="comment-composer" id="commentForm">
          <label for="commentInput">Bạn đang nghĩ gì?</label>
          <p>Đăng một câu hỏi hoặc góc nhìn để cả lớp cùng thảo luận.</p>
          <textarea id="commentInput" maxlength="240" rows="5" placeholder="Ví dụ: Nếu AI chỉ dự đoán, “hiểu” nghĩa là gì?"></textarea>
          <div class="composer-actions">
            <span id="commentCounter">0 / 240</span>
            <button type="submit" disabled>Đăng bình luận</button>
          </div>
        </form>
        <div class="community-feed" aria-label="Bình luận của cộng đồng">
          ${state.communityComments.map(communityCommentMarkup).join("")}
        </div>
      </div>
    </section>
  `;
  document.querySelector("[data-discussion-action]").addEventListener("click", returnToLobby);
  const form = document.querySelector("#commentForm");
  const input = document.querySelector("#commentInput");
  const submit = form.querySelector("button[type='submit']");
  const counter = document.querySelector("#commentCounter");

  input.addEventListener("input", () => {
    const length = input.value.trim().length;
    counter.textContent = `${input.value.length} / 240`;
    submit.disabled = length === 0;
  });

  input.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    postCommunityComment(input.value);
  });
  document.querySelectorAll("[data-comment-id]").forEach((button) => {
    button.addEventListener("click", () => reactToComment(button.dataset.commentId));
  });
  document.querySelectorAll("[data-reply-to]").forEach((button) => {
    button.addEventListener("click", () => toggleReplyComposer(button.dataset.replyTo));
  });
  document.querySelectorAll("[data-reply-form]").forEach((replyForm) => {
    replyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const replyInput = replyForm.querySelector("input");
      postCommunityReply(replyForm.dataset.replyForm, replyInput.value);
    });
  });
  if (state.replyingTo) {
    document.querySelector(`[data-reply-form="${CSS.escape(state.replyingTo)}"] input`)?.focus();
  }
  setAction("Làm warm-up", false, "Space", "để vào làm bài");
  elements.replayButton.disabled = true;
  setProgress();
}

function communityCommentMarkup(comment) {
  const replies = Array.isArray(comment.replies) ? comment.replies : [];
  return `
    <article class="community-comment">
      <div class="comment-avatar" aria-hidden="true">${escapeHtml(comment.initials)}</div>
      <div class="comment-body">
        <div class="comment-meta">
          <strong>${escapeHtml(comment.author)}</strong>
          <span>${escapeHtml(comment.time)}</span>
        </div>
        <p>${escapeHtml(comment.text)}</p>
        <div class="comment-tools">
          <button class="comment-reaction ${comment.liked ? "is-liked" : ""}" type="button" data-comment-id="${escapeHtml(comment.id)}" aria-pressed="${Boolean(comment.liked)}" aria-label="${comment.liked ? "Bỏ thích" : "Thích"} bình luận của ${escapeHtml(comment.author)}">
            <span aria-hidden="true">${comment.liked ? "♥" : "♡"}</span> ${comment.reactions}
          </button>
          <button class="comment-reply-button" type="button" data-reply-to="${escapeHtml(comment.id)}">
            Trả lời${replies.length ? ` · ${replies.length}` : ""}
          </button>
        </div>
        ${
          replies.length
            ? `<div class="comment-replies">
                ${replies
                  .map(
                    (reply) => `
                      <article class="comment-reply">
                        <div class="reply-avatar" aria-hidden="true">${escapeHtml(reply.initials)}</div>
                        <div>
                          <div class="comment-meta"><strong>${escapeHtml(reply.author)}</strong><span>${escapeHtml(reply.time)}</span></div>
                          <p>${escapeHtml(reply.text)}</p>
                        </div>
                      </article>
                    `
                  )
                  .join("")}
              </div>`
            : ""
        }
        ${
          state.replyingTo === comment.id
            ? `<form class="reply-composer" data-reply-form="${escapeHtml(comment.id)}">
                <input maxlength="180" aria-label="Trả lời ${escapeHtml(comment.author)}" placeholder="Viết câu trả lời cho ${escapeHtml(comment.author)}…" />
                <button type="submit">Gửi</button>
              </form>`
            : ""
        }
      </div>
    </article>
  `;
}

function loadCommunityComments() {
  try {
    const saved = JSON.parse(window.localStorage.getItem("ai-warmup-comments") || "null");
    const comments = Array.isArray(saved) && saved.length ? saved : starterComments;
    return comments.map((comment) => ({
      ...comment,
      liked: Boolean(comment.liked),
      replies: Array.isArray(comment.replies) ? comment.replies : []
    }));
  } catch {
    return starterComments.map((comment) => ({
      ...comment,
      replies: comment.replies.map((reply) => ({ ...reply }))
    }));
  }
}

function persistCommunityComments() {
  try {
    window.localStorage.setItem("ai-warmup-comments", JSON.stringify(state.communityComments));
  } catch {
    // The discussion still works for this session when storage is unavailable.
  }
}

function postCommunityComment(rawText) {
  const text = rawText.trim();
  if (!text) return;

  state.communityComments.unshift({
    id: `local-${Date.now()}`,
    author: "Bạn",
    initials: "B",
    time: "vừa xong",
    text: text.slice(0, 240),
    reactions: 0,
    liked: false,
    replies: []
  });
  state.replyingTo = null;
  persistCommunityComments();
  renderDiscussion();
  announce("Bình luận của bạn đã được đăng.");
}

function reactToComment(id) {
  const comment = state.communityComments.find((item) => item.id === id);
  if (!comment) return;
  comment.liked = !comment.liked;
  comment.reactions = Math.max(0, comment.reactions + (comment.liked ? 1 : -1));
  persistCommunityComments();
  renderDiscussion();
  announce(`${comment.liked ? "Đã thích" : "Đã bỏ thích"} bình luận của ${comment.author}.`);
}

function toggleReplyComposer(id) {
  state.replyingTo = state.replyingTo === id ? null : id;
  renderDiscussion();
}

function postCommunityReply(commentId, rawText) {
  const text = rawText.trim();
  const comment = state.communityComments.find((item) => item.id === commentId);
  if (!comment || !text) return;
  comment.replies.push({
    id: `reply-${Date.now()}`,
    author: "Bạn",
    initials: "B",
    time: "vừa xong",
    text: text.slice(0, 180)
  });
  state.replyingTo = null;
  persistCommunityComments();
  renderDiscussion();
  announce(`Đã trả lời bình luận của ${comment.author}.`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function chatLogMarkup(scene, visibleCount, activeIndex = -1, compact = false) {
  const lines = scene.dialogue.slice(0, visibleCount);
  return `
    <section class="chat-log ${compact ? "chat-log--compact" : ""}" aria-label="Các câu đã nói">
      <div class="chat-log-messages">
        ${lines
          .map(
            (message, index) => `
              <article class="chat-message chat-message--${message.side} ${index === activeIndex ? "is-active" : ""}">
                <span class="chat-speaker">${message.speaker}</span>
                <p>${message.text}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderDialogue() {
  const scene = scenes[state.sceneIndex];
  const line = scene.dialogue[state.dialogueIndex];

  elements.stage.classList.add("stage--dialogue");
  restoreBeaIdle();
  setCharacterVisibility(line.side === "left" ? "minh" : "nam", line.side);
  elements.sceneContent.innerHTML = `
    <div class="scene-stack scene-stack--dialogue">
      <p class="scene-index">Tình huống ${state.sceneIndex + 1} / ${scenes.length}</p>
      ${
        state.dialogueIndex > 0
          ? `<div class="dialogue-history">${chatLogMarkup(scene, state.dialogueIndex, -1, true)}</div>`
          : ""
      }
      <article class="dialogue-balloon dialogue-balloon--${line.side}">
        <span class="dialogue-balloon-speaker">${line.speaker}</span>
        <p data-typing-text="${line.text.replaceAll('"', '&quot;')}"></p>
      </article>
      <p class="dialogue-prompt">${line.speaker} đang dẫn chuyện…</p>
    </div>
  `;
  setAction("Hiện hết", false, "Space", "để xem trọn câu");
  elements.replayButton.disabled = false;
  setProgress();

  clearSceneTimer();
  clearTypeTimer();
  playTypedDialogue(line.text);
}

function playTypedDialogue(text) {
  const target = document.querySelector("[data-typing-text]");
  if (!target) return;

  let index = 0;
  state.isTyping = true;
  target.textContent = "";
  state.typeTimer = window.setInterval(() => {
    index += 1;
    target.textContent = text.slice(0, index);
    if (index >= text.length) {
      clearTypeTimer();
      const scene = scenes[state.sceneIndex];
      setDialogueAdvanceAction(scene);
      state.timer = window.setTimeout(advanceDialogue, state.dialogueIndex === scene.dialogue.length - 1 ? 1100 : 900);
    }
  }, 14);
}

function completeTypedDialogue() {
  if (!state.isTyping) return false;
  const target = document.querySelector("[data-typing-text]");
  if (target) target.textContent = target.dataset.typingText || "";
  clearTypeTimer();
  clearSceneTimer();
  const scene = scenes[state.sceneIndex];
  setDialogueAdvanceAction(scene);
  state.timer = window.setTimeout(advanceDialogue, state.dialogueIndex === scene.dialogue.length - 1 ? 1100 : 900);
  return true;
}

function setDialogueAdvanceAction(scene) {
  setAction(
    state.dialogueIndex === scene.dialogue.length - 1 ? "Xem câu hỏi" : "Tiếp lời",
    false,
    "Space",
    "để tiếp lời"
  );
}

function answerMarkup(scene, showResults) {
  return scene.answers
    .map((answer, index) => {
      const selected = index === state.selectedIndex;
      const result = scene.results[index];
      return `
        <button
          class="answer ${selected ? "is-selected" : ""}"
          type="button"
          data-answer-index="${index}"
          ${showResults ? "disabled" : ""}
          aria-pressed="${selected}"
        >
          ${showResults ? `<span class="result-fill" aria-hidden="true"></span>` : ""}
          <span class="answer-number">${index + 1}</span>
          <span class="answer-copy">${answer}</span>
          ${showResults ? `<span class="answer-percent" data-target="${result}">0%</span>` : ""}
          ${selected && showResults ? `<span class="selected-note">Bạn chọn</span>` : ""}
        </button>
      `;
    })
    .join("");
}

function renderQuestion(showResults = false) {
  clearSceneTimer();
  clearTypeTimer();
  elements.stage.classList.remove("stage--dialogue");
  if (!showResults) restoreBeaIdle();
  const scene = scenes[state.sceneIndex];
  setCharacterVisibility(scene.characterMode);

  elements.sceneContent.innerHTML = `
    <div class="scene-stack scene-stack--question">
      ${chatLogMarkup(scene, scene.dialogue.length, -1, true)}
      <div class="question-panel">
      <p class="question-kicker">
        ${showResults ? "Góc nhìn của lớp mình" : `Tình huống ${state.sceneIndex + 1} / ${scenes.length}`}
      </p>
      <h1 id="sceneQuestion">${scene.question}</h1>
      ${
        showResults
          ? `<p class="results-note"><span>Không có đúng hay sai.</span><strong>100 lượt chọn giả lập</strong></p>`
          : ""
      }
      <div class="answer-list" role="${showResults ? "list" : "group"}" aria-label="Các lựa chọn">
        ${answerMarkup(scene, showResults)}
      </div>
      </div>
    </div>
  `;

  if (!showResults) {
    document.querySelectorAll("[data-answer-index]").forEach((button) => {
      button.addEventListener("click", () => selectAnswer(Number(button.dataset.answerIndex)));
    });
    setAction("Chọn một ý kiến", true, "1–3", "để chọn nhanh");
  } else {
    setAction(
      state.sceneIndex === scenes.length - 1 ? "Xem lời kết" : "Câu tiếp theo",
      false,
      "Enter",
      "để tiếp tục"
    );
    animateResults(scene);
  }

  elements.replayButton.disabled = false;
  setProgress();
}

function animateResults(scene) {
  const answers = [...document.querySelectorAll(".answer")];
  window.requestAnimationFrame(() => {
    answers.forEach((answer, index) => {
      const result = scene.results[index];
      answer.style.setProperty("--result-scale", result / 100);
      const label = answer.querySelector(".answer-percent");
      const start = performance.now();
      const duration = 650;

      const tick = (now) => {
        const elapsed = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - elapsed, 4);
        label.textContent = `${Math.round(result * eased)}%`;
        if (elapsed < 1) window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
    });
  });
}

function renderKeyMoments(isCompleted = false) {
  clearSceneTimer();
  clearTypeTimer();
  elements.stage.classList.remove("stage--dialogue");
  restoreBeaIdle();
  setCharacterVisibility("cover");
  elements.sceneContent.innerHTML = `
    <section class="finale" aria-labelledby="finaleTitle">
      <div class="key-moment-heading">
        <div>
          <p class="cover-prompt">${isCompleted ? "Warm-up Bài 1 hoàn tất · 5 / 5" : "Bài 1 · Bản đồ kiến thức"}</p>
          <h1 id="finaleTitle">Key moments</h1>
        </div>
        <div class="key-moment-stats" aria-label="Bài 1 có ${keyMoments.length} key moments">
          <span><strong>01</strong> bài học</span>
          <span><strong>${keyMoments.length}</strong> key moments</span>
        </div>
      </div>
      <div class="key-moment-scroll" aria-label="Danh sách key moments của Bài 1">
        <div class="key-card-grid">
          ${keyMoments
          .map(
            ([title, description], index) => `
              <article class="key-card">
                <span class="moment-index">${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>${title}</h2>
                  <p>${description}</p>
                </div>
              </article>
            `
          )
          .join("")}
        </div>
      </div>
      <p class="closing-line">Bạn đang dùng AI mỗi ngày — nhưng thực sự bên trong nó đang làm gì? Câu trả lời đầy đủ đang chờ bạn trong buổi học ngày mai.</p>
    </section>
  `;
  setAction("Về sảnh chờ", false, "Space", "để xem lựa chọn khác");
  elements.replayButton.disabled = true;
  setProgress();
  announce(isCompleted ? "Hoàn tất warm-up." : "Đang mở key moments.");
}

function render() {
  elements.stage.classList.toggle("stage--community", state.view === "discussion");
  elements.stage.classList.toggle("stage--keymoments", state.view === "keymoments" || state.view === "finale");
  if (state.view === "cover") renderCover();
  if (state.view === "discussion") renderDiscussion();
  if (state.view === "keymoments") renderKeyMoments(false);
  if (state.view === "dialogue") renderDialogue();
  if (state.view === "question") renderQuestion(false);
  if (state.view === "results") renderQuestion(true);
  if (state.view === "finale") renderKeyMoments(true);
  syncExitControl();
}

function setAction(label, disabled, key, hint) {
  elements.primaryAction.innerHTML = `${label}<span aria-hidden="true">→</span>`;
  elements.primaryAction.disabled = disabled;
  elements.actionHint.innerHTML = `<span class="keycap">${key}</span><span>${hint}</span>`;
}

function startWarmup() {
  state.sceneIndex = 0;
  state.dialogueIndex = 0;
  state.selectedIndex = null;
  state.view = "dialogue";
  render();
  announce("Bắt đầu tình huống 1.");
}

function openDiscussion() {
  state.view = "discussion";
  render();
  announce("Đang mở thảo luận trước giờ học.");
}

function openKeyMoments() {
  state.view = "keymoments";
  render();
}

function returnToLobby() {
  state.view = "cover";
  state.sceneIndex = 0;
  state.dialogueIndex = 0;
  state.selectedIndex = null;
  render();
  announce("Đã về sảnh chờ warm-up.");
}

function advanceDialogue() {
  if (elements.exitDialog.open) return;
  if (state.view !== "dialogue") return;
  const scene = scenes[state.sceneIndex];
  if (state.dialogueIndex < scene.dialogue.length - 1) {
    state.dialogueIndex += 1;
    render();
  } else {
    state.view = "question";
    render();
    announce(scene.question);
  }
}

function selectAnswer(index) {
  if (state.view !== "question") return;
  state.selectedIndex = index;
  state.view = "results";
  render();
  triggerMascotReaction();
  announce(`Bạn chọn: ${scenes[state.sceneIndex].answers[index]}. Đã hiển thị tỷ lệ lớp.`);
}

function triggerMascotReaction() {
  [elements.leftCharacter, elements.rightCharacter].forEach((character) => {
    if (!character.classList.contains("is-visible")) return;
    character.classList.remove("is-reacting");
    window.requestAnimationFrame(() => character.classList.add("is-reacting"));
  });

  loadBeaAnimation("assets/duolingo-lottie/bea-correct.json", false);

  window.setTimeout(() => {
    [elements.leftCharacter, elements.rightCharacter].forEach((character) => character.classList.remove("is-reacting"));
  }, 900);
}

function nextScene() {
  if (state.view === "cover") {
    startWarmup();
    return;
  }

  if (state.view === "discussion") {
    startWarmup();
    return;
  }

  if (state.view === "dialogue") {
    if (completeTypedDialogue()) return;
    advanceDialogue();
    return;
  }

  if (state.view === "results") {
    if (state.sceneIndex >= scenes.length - 1) {
      state.view = "finale";
      render();
      return;
    }

    state.sceneIndex += 1;
    state.dialogueIndex = 0;
    state.selectedIndex = null;
    state.view = "dialogue";
    render();
    announce(`Tình huống ${state.sceneIndex + 1}.`);
    return;
  }

  if (state.view === "finale" || state.view === "keymoments") {
    returnToLobby();
  }
}

function replayDialogue() {
  if (state.view === "cover" || state.view === "discussion" || state.view === "keymoments" || state.view === "finale") return;
  state.dialogueIndex = 0;
  state.selectedIndex = null;
  state.view = "dialogue";
  render();
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    announce("Trình duyệt không thể bật toàn màn. Bạn có thể nhấn F11.");
  }
}

function syncFullscreenButton() {
  const active = Boolean(document.fullscreenElement);
  elements.fullscreenButton.innerHTML = `<span aria-hidden="true">${active ? "↙" : "⛶"}</span>${active ? "Thoát toàn màn" : "Toàn màn"}`;
  elements.fullscreenButton.setAttribute(
    "aria-label",
    active ? "Thoát chế độ trình chiếu toàn màn" : "Bật chế độ trình chiếu toàn màn"
  );
}

function syncExitControl() {
  elements.exitButton.hidden = !isAttemptActive();
}

function isAttemptActive() {
  return state.view === "dialogue" || state.view === "question" || state.view === "results";
}

function configureExitDialog(destination) {
  const leavingForCourse = destination === "course";
  elements.exitDialogTitle.textContent = leavingForCourse ? "Về lại khóa học?" : "Thoát khỏi warm-up?";
  elements.exitDialogMessage.textContent = leavingForCourse
    ? "Tiến độ của lượt làm hiện tại sẽ bị xoá trước khi bạn quay về trang khóa học."
    : "Tiến độ của lượt làm hiện tại sẽ bị xoá. Bạn có thể bắt đầu lại từ sảnh chờ.";
  elements.cancelExitButton.textContent = "Tiếp tục làm bài";
  elements.confirmExitButton.textContent = leavingForCourse ? "Về khóa học" : "Thoát về sảnh chờ";
}

function openExitDialog(destination = "lobby") {
  if (elements.exitDialog.open) return;
  state.exitDestination = destination;
  configureExitDialog(destination);
  clearSceneTimer();
  elements.exitDialog.returnValue = "";
  elements.exitDialog.showModal();
}

function resumeAttemptAfterDialog() {
  if (state.view === "dialogue" && !state.isTyping) {
    const scene = scenes[state.sceneIndex];
    state.timer = window.setTimeout(advanceDialogue, state.dialogueIndex === scene.dialogue.length - 1 ? 1100 : 900);
  }
}

function confirmExitWarmup() {
  const destination = state.exitDestination;
  if (elements.exitDialog.open) elements.exitDialog.close();
  clearSceneTimer();
  clearTypeTimer();
  if (destination === "course") {
    window.location.assign(elements.courseBackLink.href);
    return;
  }
  returnToLobby();
  announce("Đã thoát warm-up và xoá tiến độ lượt làm.");
}

elements.primaryAction.addEventListener("click", nextScene);
elements.replayButton.addEventListener("click", replayDialogue);
elements.fullscreenButton.addEventListener("click", toggleFullscreen);
elements.exitButton.addEventListener("click", () => openExitDialog("lobby"));
elements.courseBackLink.addEventListener("click", (event) => {
  if (!isAttemptActive()) return;
  event.preventDefault();
  openExitDialog("course");
});
elements.exitDialog.addEventListener("close", () => {
  if (elements.exitDialog.returnValue === "confirm") {
    confirmExitWarmup();
  } else {
    resumeAttemptAfterDialog();
  }
});
document.addEventListener("fullscreenchange", syncFullscreenButton);

document.addEventListener("keydown", (event) => {
  const isFormField = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
  if (isFormField) return;

  if (event.key === " " && (state.view === "cover" || state.view === "discussion" || state.view === "keymoments" || state.view === "dialogue" || state.view === "finale")) {
    event.preventDefault();
    nextScene();
    return;
  }

  if (state.view === "question" && /^[1-9]$/.test(event.key)) {
    const index = Number(event.key) - 1;
    if (index < scenes[state.sceneIndex].answers.length) selectAnswer(index);
    return;
  }

  if (event.key === "Enter" && state.view === "results") {
    nextScene();
    return;
  }

  if (event.key.toLowerCase() === "r" && state.view === "finale") {
    nextScene();
  }

  if (event.key.toLowerCase() === "f" && !event.metaKey && !event.ctrlKey) {
    toggleFullscreen();
  }
});

initLottie();
syncFullscreenButton();
render();
