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
  replyingTo: null
};

const mascotAnimations = {};

const elements = {
  topbar: document.querySelector("#warmupTopbar"),
  stage: document.querySelector(".stage"),
  sceneContent: document.querySelector("#sceneContent"),
  progressFill: document.querySelector("#progressFill"),
  progressLabel: document.querySelector("#progressLabel"),
  progressWrap: document.querySelector("#progressWrap"),
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
          <p class="cover-prompt" id="discussionCount">Cộng đồng lớp học · ${state.communityComments.length} bình luận</p>
          <h1 id="discussionTitle">Thảo luận trước giờ học</h1>
        </div>
        <button class="text-nav" type="button" data-discussion-action="lobby">← Sảnh chờ</button>
      </div>
      <div class="community-layout">
        <div class="composer-side">
          ${commentComposerMarkup()}
        </div>
        <div class="community-feed" aria-label="Bình luận của cộng đồng">
          ${state.communityComments.map(communityCommentMarkup).join("")}
        </div>
      </div>
    </section>
  `;
  bindDiscussionEvents();

  elements.actionHint.innerHTML = "";
  elements.primaryAction.innerHTML = `Làm warm-up<span aria-hidden="true">→</span>`;
  elements.primaryAction.disabled = false;
  elements.replayButton.disabled = true;
  setProgress();
}

function commentComposerMarkup() {
  return `
    <form class="comment-composer" id="commentForm">
      <label id="commentComposerLabel" for="commentInput">Bạn đang nghĩ gì?</label>
      <p id="commentComposerHelp">Đăng một câu hỏi hoặc góc nhìn để cả lớp cùng thảo luận.</p>
      <textarea id="commentInput" maxlength="240" rows="8" placeholder="Ví dụ: Nếu AI chỉ dự đoán, “hiểu” nghĩa là gì?"></textarea>
      <div class="composer-actions">
        <span id="commentCounter">0 / 240</span>
        <div class="composer-buttons">
          <button type="button" class="composer-cancel-btn" id="cancelReplyBtn" hidden>Hủy</button>
          <button id="commentSubmitButton" type="submit" disabled>Đăng bình luận</button>
        </div>
      </div>
    </form>
  `;
}

function bindDiscussionEvents() {
  const discussion = getDiscussionRoot();
  const form = discussion.querySelector("#commentForm");
  const input = discussion.querySelector("#commentInput");

  discussion.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    if (event.target.closest("[data-discussion-action='lobby']")) {
      returnToLobby();
      return;
    }

    const reactionButton = event.target.closest("[data-reaction-id]");
    if (reactionButton) {
      reactToComment(reactionButton.dataset.reactionId);
      return;
    }

    const replyButton = event.target.closest("[data-reply-to]");
    if (replyButton) {
      toggleReplyComposer(replyButton.dataset.replyTo);
      return;
    }

    if (event.target.closest("#cancelReplyBtn")) {
      clearReplyComposer(true);
      announce("Đã hủy trả lời.");
    }
  });

  input.addEventListener("input", syncComposerSubmitState);
  input.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") form.requestSubmit();
    if (event.key === "Escape" && state.replyingTo) {
      clearReplyComposer(true);
      announce("Đã hủy trả lời.");
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.replyingTo) postCommunityReply(state.replyingTo, input.value);
    else postCommunityComment(input.value);
  });
}

function communityCommentMarkup(comment) {
  const replies = Array.isArray(comment.replies) ? comment.replies : [];
  return `
    <article class="community-comment" data-comment-id="${escapeHtml(comment.id)}">
      <div class="comment-avatar" aria-hidden="true">${escapeHtml(comment.initials)}</div>
      <div class="comment-body">
        <div class="comment-meta">
          <strong>${escapeHtml(comment.author)}</strong>
          <span>${escapeHtml(comment.time)}</span>
        </div>
        <p>${escapeHtml(comment.text)}</p>
        <div class="comment-tools">
          ${reactionButtonMarkup(comment)}
          <button class="comment-reply-button" type="button" data-reply-to="${escapeHtml(comment.id)}">${replyButtonLabel(replies.length)}</button>
        </div>
        ${
          replies.length
            ? `<div class="comment-replies">
                ${replies.map(replyMarkup).join("")}
              </div>`
            : ""
        }
        ${state.replyingTo === comment.id ? replyIndicatorMarkup(comment) : ""}
      </div>
    </article>
  `;
}

function replyMarkup(reply) {
  return `
    <article class="comment-reply">
      <div class="reply-avatar" aria-hidden="true">${escapeHtml(reply.initials)}</div>
      <div>
        <div class="comment-meta"><strong>${escapeHtml(reply.author)}</strong><span>${escapeHtml(reply.time)}</span></div>
        <p>${escapeHtml(reply.text)}</p>
      </div>
    </article>
  `;
}

function reactionButtonMarkup(comment) {
  return `
    <button class="comment-reaction ${comment.liked ? "is-liked" : ""}" type="button" data-reaction-id="${escapeHtml(comment.id)}" aria-pressed="${Boolean(comment.liked)}" aria-label="${comment.liked ? "Bỏ thích" : "Thích"} bình luận của ${escapeHtml(comment.author)}">
      <span aria-hidden="true">${comment.liked ? "♥" : "♡"}</span> ${comment.reactions}
    </button>
  `;
}

function replyButtonLabel(count) {
  return `Trả lời${count ? ` · ${count}` : ""}`;
}

function replyIndicatorMarkup(comment) {
  return `
    <div class="composer-typing-indicator composer-typing-indicator--inline" aria-live="polite">
      <div class="composer-typing-avatar" aria-hidden="true">B</div>
      <div class="composer-typing-info">
        <span class="composer-typing-label">Bạn · đang trả lời <strong>${escapeHtml(comment.author)}</strong></span>
        <span class="typing-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </div>
    </div>
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

  const comment = {
    id: `local-${Date.now()}`,
    author: "Bạn",
    initials: "B",
    time: "vừa xong",
    text: text.slice(0, 240),
    reactions: 0,
    liked: false,
    replies: []
  };
  state.communityComments.unshift(comment);
  state.replyingTo = null;
  persistCommunityComments();
  const feed = getDiscussionRoot().querySelector(".community-feed");
  feed.insertAdjacentHTML("afterbegin", communityCommentMarkup(comment));
  animateDiscussionElement(feed.firstElementChild, "is-entering");
  updateDiscussionCount();
  const input = getDiscussionRoot().querySelector("#commentInput");
  input.value = "";
  syncComposerSubmitState();
  input.focus();
  feed.scrollTop = 0;
  announce("Bình luận của bạn đã được đăng.");
}

function reactToComment(id) {
  const comment = state.communityComments.find((item) => item.id === id);
  if (!comment) return;
  comment.liked = !comment.liked;
  comment.reactions = Math.max(0, comment.reactions + (comment.liked ? 1 : -1));
  persistCommunityComments();
  const button = getCommentNode(id)?.querySelector(".comment-reaction");
  if (button) {
    button.classList.toggle("is-liked", comment.liked);
    button.setAttribute("aria-pressed", String(comment.liked));
    button.setAttribute("aria-label", `${comment.liked ? "Bỏ thích" : "Thích"} bình luận của ${comment.author}`);
    button.innerHTML = `<span aria-hidden="true">${comment.liked ? "♥" : "♡"}</span> ${comment.reactions}`;
    animateDiscussionElement(button, "is-reacting", 200);
  }
  announce(`${comment.liked ? "Đã thích" : "Đã bỏ thích"} bình luận của ${comment.author}.`);
}

function toggleReplyComposer(id) {
  state.replyingTo = state.replyingTo === id ? null : id;
  syncReplyIndicator();
  updateDiscussionComposer({ focus: Boolean(state.replyingTo) });
  if (state.replyingTo) {
    const target = state.communityComments.find((comment) => comment.id === id);
    if (target) announce(`Đang trả lời bình luận của ${target.author}.`);
  }
}

function postCommunityReply(commentId, rawText) {
  const text = rawText.trim();
  const comment = state.communityComments.find((item) => item.id === commentId);
  if (!comment || !text) return;
  const reply = {
    id: `reply-${Date.now()}`,
    author: "Bạn",
    initials: "B",
    time: "vừa xong",
    text: text.slice(0, 180)
  };
  comment.replies.push(reply);
  state.replyingTo = null;
  persistCommunityComments();
  const commentNode = getCommentNode(commentId);
  let replies = commentNode?.querySelector(".comment-replies");
  if (!replies && commentNode) {
    commentNode.querySelector(".comment-tools").insertAdjacentHTML("afterend", '<div class="comment-replies"></div>');
    replies = commentNode.querySelector(".comment-replies");
  }
  if (replies) {
    replies.insertAdjacentHTML("beforeend", replyMarkup(reply));
    animateDiscussionElement(replies.lastElementChild, "is-entering");
  }
  updateReplyButtonCount(comment);
  syncReplyIndicator();
  updateDiscussionComposer({ focus: true });
  announce(`Đã trả lời bình luận của ${comment.author}.`);
}

function clearReplyComposer(focus = false) {
  state.replyingTo = null;
  syncReplyIndicator();
  updateDiscussionComposer({ focus });
}

function getDiscussionRoot() {
  return elements.sceneContent.querySelector(".discussion");
}

function getCommentNode(id) {
  return Array.from(getDiscussionRoot().querySelectorAll(".community-comment")).find((node) => node.dataset.commentId === id);
}

function syncComposerSubmitState() {
  const discussion = getDiscussionRoot();
  const input = discussion.querySelector("#commentInput");
  const counter = discussion.querySelector("#commentCounter");
  const submit = discussion.querySelector("#commentSubmitButton");
  counter.textContent = `${input.value.length} / 240`;
  submit.disabled = input.value.trim().length === 0;
}

function updateDiscussionComposer({ focus = false } = {}) {
  const discussion = getDiscussionRoot();
  const replyTarget = state.replyingTo
    ? state.communityComments.find((comment) => comment.id === state.replyingTo)
    : null;
  const form = discussion.querySelector("#commentForm");
  const input = discussion.querySelector("#commentInput");
  const label = discussion.querySelector("#commentComposerLabel");
  const help = discussion.querySelector("#commentComposerHelp");
  const cancel = discussion.querySelector("#cancelReplyBtn");
  const submit = discussion.querySelector("#commentSubmitButton");

  form.classList.toggle("comment-composer--reply", Boolean(replyTarget));
  label.innerHTML = replyTarget
    ? `Đang trả lời <span class="reply-target-name">${escapeHtml(replyTarget.author)}</span>`
    : "Bạn đang nghĩ gì?";
  help.innerHTML = replyTarget
    ? `Câu trả lời sẽ đăng dưới bình luận của <strong>${escapeHtml(replyTarget.author)}</strong>.`
    : "Đăng một câu hỏi hoặc góc nhìn để cả lớp cùng thảo luận.";
  input.placeholder = replyTarget
    ? `Viết câu trả lời cho ${replyTarget.author}…`
    : "Ví dụ: Nếu AI chỉ dự đoán, “hiểu” nghĩa là gì?";
  input.value = "";
  cancel.hidden = !replyTarget;
  submit.textContent = replyTarget ? "Trả lời" : "Đăng bình luận";
  syncComposerSubmitState();
  if (focus) window.setTimeout(() => input.focus(), 0);
}

function syncReplyIndicator() {
  const discussion = getDiscussionRoot();
  discussion.querySelectorAll(".composer-typing-indicator--inline").forEach((node) => node.remove());
  if (!state.replyingTo) return;
  const target = state.communityComments.find((comment) => comment.id === state.replyingTo);
  const commentNode = getCommentNode(state.replyingTo);
  if (target && commentNode) commentNode.querySelector(".comment-body").insertAdjacentHTML("beforeend", replyIndicatorMarkup(target));
}

function updateDiscussionCount() {
  const count = getDiscussionRoot().querySelector("#discussionCount");
  count.textContent = `Cộng đồng lớp học · ${state.communityComments.length} bình luận`;
}

function updateReplyButtonCount(comment) {
  const button = getCommentNode(comment.id)?.querySelector("[data-reply-to]");
  if (button) button.textContent = replyButtonLabel(comment.replies.length);
}

function animateDiscussionElement(element, className, duration = 220) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), duration);
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
  syncHeaderState();
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
  state.replyingTo = null;
  state.view = "discussion";
  render();
  announce("Đang mở thảo luận trước giờ học.");
}

function openKeyMoments() {
  state.view = "keymoments";
  render();
}

function returnToLobby() {
  state.replyingTo = null;
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

function syncHeaderState() {
  const attemptActive = isAttemptActive();
  elements.progressWrap.hidden = !attemptActive;
  elements.courseBackLink.hidden = attemptActive;
  elements.topbar.setAttribute("aria-label", attemptActive ? "Tiến độ warm-up" : "Điều hướng warm-up");
  elements.topbar.classList.toggle("topbar--attempt", attemptActive);
  elements.topbar.classList.toggle("topbar--overview", !attemptActive);
}

function isAttemptActive() {
  return state.view === "dialogue" || state.view === "question" || state.view === "results";
}

function openExitDialog() {
  if (elements.exitDialog.open) return;
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
  if (elements.exitDialog.open) elements.exitDialog.close();
  clearSceneTimer();
  clearTypeTimer();
  returnToLobby();
  announce("Đã thoát warm-up và xoá tiến độ lượt làm.");
}

elements.primaryAction.addEventListener("click", nextScene);
elements.replayButton.addEventListener("click", replayDialogue);
elements.fullscreenButton.addEventListener("click", toggleFullscreen);
elements.exitButton.addEventListener("click", openExitDialog);
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
