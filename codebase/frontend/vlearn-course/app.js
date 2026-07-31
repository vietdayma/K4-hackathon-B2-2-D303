const days = [
  { day: 1, slides: 2, pdf: "../../../data/vlearn-pack/slides/d1-slide-hackathon.pdf" },
  { day: 2, slides: 1, pdf: "../../../data/vlearn-pack/slides/d2-slide-hackathon.pdf" },
  { day: 3, slides: 2 },
  { day: 4, slides: 3 },
  { day: 5, slides: 3 },
  { day: 6, slides: 1 }
];

const daysList = document.querySelector("#daysList");
const template = document.querySelector("#dayTemplate");
const announcer = document.querySelector("#announcer");

function transcriptPath(day) {
  return `../../../data/vlearn-pack/transcript/transcript-${String(day).padStart(2, "0")}-clean.md`;
}

function detailMarkup(day) {
  const isWarmupReady = day.day === 1;
  return `
    <div class="day-actions" aria-label="Tài nguyên Day${String(day.day).padStart(2, "0")}">
      ${
        isWarmupReady
          ? `<a class="day-action day-action--warmup" href="../warmup-ai/index.html"><span>◷</span><b>Chuẩn bị trước buổi học</b><small>Warm-up AI · khoảng 4 phút</small></a>`
          : `<button class="day-action" type="button" data-unavailable="warmup"><span>◷</span><b>Chuẩn bị trước buổi học</b><small>Đang được biên soạn</small></button>`
      }
      <button class="day-action" type="button" data-action="slides"><span>▤</span><b>Đọc slide</b><small>${day.slides} slide · mở tài liệu bên dưới</small></button>
      <button class="day-action" type="button" data-action="questions"><span>?</span><b>Câu hỏi sau buổi học</b><small>Ghi lại điều bạn muốn hỏi thêm</small></button>
    </div>
    <div class="resource-drawer" data-drawer="slides" hidden>
      <div class="drawer-heading"><span>▤</span><div><b>Tài liệu Day${String(day.day).padStart(2, "0")}</b><small>Chọn tài liệu để đọc trong một tab mới</small></div></div>
      <div class="resource-list">
        ${
          day.pdf
            ? `<a href="${day.pdf}" target="_blank" rel="noreferrer"><span class="file-type">PDF</span><b>Slide Day${String(day.day).padStart(2, "0")}</b><small>Mở tài liệu ↗</small></a>`
            : ""
        }
        <a href="${transcriptPath(day.day)}" target="_blank" rel="noreferrer"><span class="file-type file-type--note">MD</span><b>Transcript Day${String(day.day).padStart(2, "0")}</b><small>Mở ghi chú ↗</small></a>
      </div>
    </div>
    <form class="question-drawer" data-drawer="questions" hidden>
      <label for="question-${day.day}">Câu hỏi của bạn cho Day${String(day.day).padStart(2, "0")}</label>
      <div><input id="question-${day.day}" maxlength="180" placeholder="Ví dụ: Phần nào trong bài hôm nay cần được giải thích thêm?" /><button type="submit">Lưu câu hỏi</button></div>
      <p class="question-status" aria-live="polite"></p>
    </form>
  `;
}

function announce(message) {
  announcer.textContent = "";
  window.setTimeout(() => (announcer.textContent = message), 20);
}

function closeOtherDays(currentCard) {
  document.querySelectorAll(".day-card.is-open").forEach((card) => {
    if (card === currentCard) return;
    card.classList.remove("is-open");
    card.querySelector(".day-heading").setAttribute("aria-expanded", "false");
    card.querySelector(".day-details").hidden = true;
  });
}

function toggleDrawer(details, drawerName) {
  const drawer = details.querySelector(`[data-drawer="${drawerName}"]`);
  const shouldOpen = drawer.hidden;
  details.querySelectorAll("[data-drawer]").forEach((item) => (item.hidden = true));
  drawer.hidden = !shouldOpen;
}

function wireDay(card, day) {
  const heading = card.querySelector(".day-heading");
  const details = card.querySelector(".day-details");

  heading.addEventListener("click", () => {
    const opening = !card.classList.contains("is-open");
    closeOtherDays(card);
    card.classList.toggle("is-open", opening);
    heading.setAttribute("aria-expanded", String(opening));
    details.hidden = !opening;
    announce(`${opening ? "Đã mở" : "Đã đóng"} Day${String(day.day).padStart(2, "0")}.`);
  });

  details.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    const unavailable = event.target.closest("[data-unavailable]");
    if (unavailable) {
      announce(`Phần chuẩn bị của Day${String(day.day).padStart(2, "0")} đang được biên soạn.`);
      return;
    }
    if (!button) return;
    toggleDrawer(details, button.dataset.action);
  });

  details.querySelector(".question-drawer").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.querySelector("input");
    const status = form.querySelector(".question-status");
    const question = input.value.trim();
    if (!question) return;
    window.localStorage.setItem(`vlearn-day-${day.day}-question`, question);
    status.textContent = "Đã lưu câu hỏi trên trình duyệt này.";
    input.value = "";
  });
}

days.forEach((day) => {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector(".day-card");
  card.querySelector(".day-number strong").textContent = String(day.day).padStart(2, "0");
  card.querySelector(".day-title b").textContent = `Day${String(day.day).padStart(2, "0")}`;
  card.querySelector(".day-title small").textContent = `Chưa hoàn thành ngày học · ${day.slides} slide`;
  card.querySelector(".day-details").innerHTML = detailMarkup(day);
  daysList.append(card);
  wireDay(card, day);
});
