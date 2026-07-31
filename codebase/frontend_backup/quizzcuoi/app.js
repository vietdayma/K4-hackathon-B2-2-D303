/**
 * VLEARN SYSTEM - QUIZ FINAL MODULE
 * File: codebase/frontend/quizzcuoi/app.js
 * Chức năng: Quản lý toàn bộ logic tương tác và kết nối API của phần Khảo sát & Trắc nghiệm.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Địa chỉ gốc của API Backend
    const API_BASE_URL = 'http://localhost:8000/api';

    // ==========================================================================
    // 1. LOGIC CHO MÀN HÌNH KHẢO SÁT (index.html)
    // ==========================================================================
    const submitSurveyBtn = document.getElementById('submitSurveyBtn');
    const stars = document.querySelectorAll('.star-rating');
    
    if (submitSurveyBtn || stars.length > 0) {
        console.log("[Survey UI] Khởi tạo giao diện Khảo sát mức độ tiếp thu.");
        
        const ratingLabel = document.querySelector('.rating-label');
        const textarea = document.querySelector('.feedback-input');
        const surveyError = document.getElementById('surveyError');
        const suggestionsContainer = document.querySelector('.suggestions-container');

        const ratingTexts = [
            "Chưa hiểu lắm - Cần ôn lại",
            "Hiểu sương sương - Cần thực hành",
            "Khá ổn - Cần luyện tập thêm",
            "Rất tốt - Sẵn sàng áp dụng",
            "Xuất sắc - Hoàn toàn tự tin!"
        ];

        let selectedLevel = 0; // 1 -> 5 đại diện cho mức độ hiểu bài (số sao)

        // Thiết lập sự kiện click chọn sao
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedLevel = index + 1;
                console.log(`[Survey UI] Người dùng chọn mức độ: ${selectedLevel} sao`);
                
                stars.forEach((s, i) => {
                    s.classList.remove('pop');
                    if (i <= index) {
                        s.setAttribute('fill', 'var(--star-yellow)');
                        s.setAttribute('stroke', 'var(--star-yellow)');
                        void s.offsetWidth; // Kích hoạt lại animation nhấp nháy (reset animation)
                        s.classList.add('pop');
                    } else {
                        s.setAttribute('fill', 'none');
                        s.setAttribute('stroke', 'var(--star-empty)');
                    }
                });

                ratingLabel.classList.add('hide');
                setTimeout(() => {
                    ratingLabel.textContent = ratingTexts[index];
                    ratingLabel.classList.remove('hide');
                }, 200); 
            });
        });

        // Hàm gán sự kiện click cho các chip gợi ý chủ đề (Chips)
        function wireChips() {
            const chips = document.querySelectorAll('.suggestion-chip');
            chips.forEach(chip => {
                // Gỡ bỏ sự kiện cũ tránh trùng lặp nếu render lại
                chip.replaceWith(chip.cloneNode(true));
            });

            // Gán lại sự kiện mới sau khi clone
            const newChips = document.querySelectorAll('.suggestion-chip');
            newChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    let currentText = textarea.value.trim();
                    let chipText = chip.textContent;

                    if (currentText.length > 0) {
                        textarea.value = currentText + ", " + chipText;
                    } else {
                        textarea.value = chipText;
                    }
                    textarea.focus();
                    console.log(`[Survey UI] Chọn gợi ý chủ đề: ${chipText}`);
                });
            });
        }
        
        // Khởi chạy gán sự kiện ban đầu cho các chip tĩnh
        wireChips();

        // Xử lý gửi khảo sát và lấy quiz từ API backend
        async function handleSurveySubmit() {
            if (selectedLevel === 0) {
                // Validate mức độ nhận biết (bắt buộc)
                console.warn("[Survey Submit] Lỗi: Chưa chọn mức độ hiểu bài.");
                surveyError.textContent = "Vui lòng chọn mức độ hiểu bài của bạn (số sao) trước khi tiếp tục.";
                surveyError.classList.remove('hide');
                return;
            }

            const vagueKnowledge = textarea.value.trim();
            console.log(`[Survey API Request] Gửi yêu cầu lấy câu hỏi: level=${selectedLevel}, vague_knowledge='${vagueKnowledge}'`);

            // Hiển thị trạng thái Loading
            submitSurveyBtn.classList.add('loading');
            submitSurveyBtn.disabled = true;
            surveyError.classList.add('hide');

            try {
                // Xây dựng URL với query params
                const url = new URL(`${API_BASE_URL}/quiz`);
                url.searchParams.append('level', selectedLevel);
                if (vagueKnowledge) {
                    url.searchParams.append('vague_knowledge', vagueKnowledge);
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Mã lỗi HTTP: ${response.status}`);
                }

                const data = await response.json();
                console.log("[Survey API Response] Nhận dữ liệu phản hồi:", data);

                if (data.status === "success") {
                    // Lưu dữ liệu vào localStorage để chuyển tiếp sang trang luyện tập
                    localStorage.setItem('quizzes', JSON.stringify(data.questions));
                    localStorage.setItem('selectedLevel', selectedLevel);
                    localStorage.setItem('vagueKnowledge', vagueKnowledge);
                    
                    console.log("[Survey Flow] Xác thực thành công, chuyển sang trang trắc nghiệm.");
                    window.location.href = 'cauhoi.html';
                } else if (data.status === "clarification_needed") {
                    // Khi kiến thức mơ hồ chưa rõ hoặc vi phạm an toàn, hiển thị message yêu cầu làm rõ
                    console.warn("[Survey Flow] Cần làm rõ chủ đề:", data.message);
                    surveyError.textContent = data.message || "Kiến thức mơ hồ bạn nhập chưa khớp với chủ đề bài học. Hãy mô tả rõ hơn hoặc chọn gợi ý bên dưới.";
                    surveyError.classList.remove('hide');

                    // Cập nhật lại các chip gợi ý từ API gợi ý
                    if (data.suggested_topics && data.suggested_topics.length > 0) {
                        console.log("[Survey UI] Cập nhật danh sách gợi ý chủ đề:", data.suggested_topics);
                        suggestionsContainer.innerHTML = data.suggested_topics.map(topic => 
                            `<button class="suggestion-chip" type="button">${topic}</button>`
                        ).join('');
                        wireChips(); // Gán lại sự kiện click
                    }
                    
                    // Tắt loading
                    submitSurveyBtn.classList.remove('loading');
                    submitSurveyBtn.disabled = false;
                }
            } catch (error) {
                // Ghi log lỗi ra console màn hình như yêu cầu của người dùng để tiện test lỗi
                console.error("[Survey API Error] Không thể kết nối hoặc tải dữ liệu từ Backend:", error);
                surveyError.textContent = "Không thể kết nối đến máy chủ Backend. Vui lòng đảm bảo dịch vụ Backend đang chạy trên cổng 8000.";
                surveyError.classList.remove('hide');
                
                // Tắt loading
                submitSurveyBtn.classList.remove('loading');
                submitSurveyBtn.disabled = false;
            }
        }

        // Đăng ký sự kiện click cho nút Tiếp tục
        if (submitSurveyBtn) {
            submitSurveyBtn.addEventListener('click', handleSurveySubmit);
        }

        // Bắt sự kiện phím Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !submitSurveyBtn.classList.contains('loading')) {
                // Tránh trigger Enter nếu đang focus trong textarea
                if (document.activeElement !== textarea) {
                    e.preventDefault();
                    handleSurveySubmit();
                }
            }
        });
    }


    // ==========================================================================
    // 2. LOGIC CHO MÀN HÌNH LUYỆN TẬP (cauhoi.html)
    // ==========================================================================
    const quizApp = document.getElementById('quizApp');
    
    if (quizApp) {
        console.log("[Quiz UI] Khởi tạo giao diện Luyện tập trắc nghiệm.");

        // Tải 10 câu hỏi từ localStorage
        const quizzesRaw = localStorage.getItem('quizzes');
        if (!quizzesRaw) {
            console.warn("[Quiz Flow] Không tìm thấy dữ liệu câu hỏi trong localStorage. Quay lại trang khảo sát.");
            window.location.href = 'index.html';
            return;
        }

        const quizzes = JSON.parse(quizzesRaw);
        console.log(`[Quiz Data] Đã tải thành công ${quizzes.length} câu hỏi ôn tập.`, quizzes);

        // Biến quản lý trạng thái
        let currentQuestionIndex = 0;
        let eloScore = 0; // Tích lũy Elo ban đầu từ 0
        let isAnswered = false; // Trạng thái câu hiện tại đã chọn đáp án chưa
        let hintLevelUsed = 0; // Mức hint cao nhất đã dùng cho câu hiện tại (0, 1, 2, 3)
        let answersState = Array(quizzes.length).fill(null); // Lưu kết quả cụ thể của từng câu
        let chatHistory = []; // Lưu trữ lịch sử chat của câu hiện tại

        // Ánh xạ DOM Elements
        const questionBadge = document.getElementById('questionBadge');
        const questionText = document.getElementById('questionText');
        const optionsList = document.getElementById('optionsList');
        const skipContainer = document.getElementById('skipContainer');
        const skipBtn = document.getElementById('skipBtn');
        const feedbackContainer = document.getElementById('feedbackContainer');
        const aiMessage = document.getElementById('aiMessage');
        const explanationBox = document.getElementById('explanationBox');
        const nextBtn = document.getElementById('nextBtn');
        const eloScoreEl = document.getElementById('eloScore');
        const progressBar = document.getElementById('progressBar');
        const quizBody = document.getElementById('quizBody');

        // Hint dropdown & buttons
        const hintToggleBtn = document.getElementById('hintToggleBtn');
        const hintContent = document.getElementById('hintContent');
        const hintLevelBtns = document.querySelectorAll('.hint-level-btn');
        const hintResultText = document.getElementById('hintResultText');

        // Chat Drawer Elements
        const askAiTutorBtn = document.getElementById('askAiTutorBtn');
        const chatDrawer = document.getElementById('chatDrawer');
        const chatDrawerCloseBtn = document.getElementById('chatDrawerCloseBtn');
        const chatDrawerBody = document.getElementById('chatDrawerBody');
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');

        // Scoreboard Modal Elements
        const scoreboardModal = document.getElementById('scoreboardModal');
        const correctCountText = document.getElementById('correctCountText');
        const finalEloText = document.getElementById('finalEloText');
        const evaluationText = document.getElementById('evaluationText');

        // Định nghĩa mức Elo khấu trừ cho mỗi cấp độ gợi ý
        const ELO_DEDUCTIONS = { 0: 0.0, 1: 0.3, 2: 0.6, 3: 0.9 };

        // Hàm render câu hỏi hiện tại lên giao diện
        function renderQuestion(index) {
            const question = quizzes[index];
            console.log(`[Quiz render] Đang render câu hỏi chỉ số ${index} (ID: ${question.id})`);

            // Reset trạng thái câu hỏi
            isAnswered = false;
            hintLevelUsed = 0;
            chatHistory = []; // Reset lịch sử chat mỗi câu mới

            // 1. Cập nhật thông tin tiêu đề và số thứ tự
            questionBadge.textContent = `Câu ${index + 1} / ${quizzes.length}`;
            questionText.textContent = question.question;

            // 2. Cập nhật thanh tiến trình (Progress Bar)
            const segments = progressBar.querySelectorAll('.progress-segment');
            segments.forEach((seg, idx) => {
                seg.className = 'progress-segment'; // Reset các class cũ
                if (idx < index) {
                    // Các câu đã làm trước đó
                    const prevAns = answersState[idx];
                    if (prevAns && prevAns.isCorrect) {
                        seg.classList.add('correct');
                    } else {
                        seg.classList.add('wrong');
                    }
                } else if (idx === index) {
                    seg.classList.add('active'); // Câu hiện tại đang làm
                }
            });

            // 3. Render danh sách phương án lựa chọn động
            const optionLetters = ['A', 'B', 'C', 'D'];
            optionsList.innerHTML = question.options.map((optionText, idx) => {
                const letter = optionLetters[idx];
                
                // Chuẩn hóa phương án: loại bỏ prefix 'A. ', 'B. ' nếu backend trả về dư thừa
                let cleanText = optionText;
                if (optionText.startsWith(`${letter}. `)) {
                    cleanText = optionText.substring(3);
                } else if (optionText.startsWith(`${letter}.`)) {
                    cleanText = optionText.substring(2);
                }

                return `
                    <div class="option-item" data-id="${letter}">
                        <div class="option-letter">${letter}</div>
                        <div class="option-text">${cleanText}</div>
                        <div class="option-icon icon-correct">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div class="option-icon icon-wrong">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </div>
                    </div>
                `;
            }).join('');

            // Gán sự kiện click cho các phương án vừa render
            const optionElements = optionsList.querySelectorAll('.option-item');
            optionElements.forEach(element => {
                element.addEventListener('click', () => {
                    const selectedId = element.getAttribute('data-id');
                    handleAnswerSelection(selectedId);
                });
            });

            // 4. Reset giao diện HINT
            hintContent.classList.remove('show');
            hintResultText.classList.add('hide');
            hintResultText.innerHTML = '';
            hintLevelBtns.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('active');
            });

            // 5. Reset các nút và vùng Feedback giải thích
            feedbackContainer.classList.add('hide');
            explanationBox.innerHTML = '';
            skipContainer.classList.remove('hide');
            nextBtn.classList.remove('d-flex');
            nextBtn.style.display = 'none';

            // 6. Reset giao diện Chat
            chatDrawerBody.innerHTML = `
                <div class="chat-message system">
                    Chào bạn! Mình là AI Tutor. Hãy đặt các câu hỏi về bài tập hiện tại, mình sẽ gợi mở, dẫn dắt để giúp bạn tự tìm câu trả lời mà không tiết lộ đáp án trực tiếp.
                </div>
            `;
            
            // Tự động cuộn phần nội dung câu hỏi về đầu trang
            quizBody.scrollTop = 0;
        }

        // Xử lý bật/tắt dropdown Hint
        if (hintToggleBtn) {
            hintToggleBtn.addEventListener('click', () => {
                hintContent.classList.toggle('show');
            });
        }

        // Xử lý gọi API lấy Hint theo cấp độ
        hintLevelBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const level = parseInt(btn.getAttribute('data-level'), 10);
                const currentQuestion = quizzes[currentQuestionIndex];
                
                console.log(`[Hint API Request] Gọi Hint cấp độ ${level} cho câu: ${currentQuestion.id}`);
                
                // Hiển thị trạng thái loading tạm thời
                hintResultText.textContent = "Đang kết nối AI Tutor lấy gợi ý...";
                hintResultText.classList.remove('hide');
                btn.disabled = true;

                try {
                    const response = await fetch(`${API_BASE_URL}/quiz/hint`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            question_text: currentQuestion.question,
                            options: currentQuestion.options,
                            hint_level: level
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log("[Hint API Response] Nhận gợi ý từ API:", data);

                    // Cập nhật mức khấu trừ Elo cao nhất đã sử dụng
                    if (level > hintLevelUsed) {
                        hintLevelUsed = level;
                    }

                    // Render nội dung gợi ý và các trích dẫn tài liệu nếu có
                    let citationHtml = '';
                    if (data.citations && data.citations.length > 0) {
                        citationHtml = `
                            <div class="citations-list">
                                ${data.citations.map(c => `
                                    <div class="citation-item">
                                        <div class="citation-meta">
                                            <span class="citation-tag">${c.chunk_id}</span>
                                            ${c.slide_file ? `<a href="../../../data/vlearn-pack/slides/${c.slide_file}${c.slide_page ? `#page=${c.slide_page}` : ''}" target="_blank" class="citation-link">📄 Slide: ${c.slide_file} (Trang ${c.slide_page})</a>` : ''}
                                        </div>
                                        <blockquote class="citation-quote">"${c.quote}"</blockquote>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }

                    hintResultText.innerHTML = `
                        <div><strong>Gợi ý từ Tutor (Trừ ${ELO_DEDUCTIONS[level] * 100}% Elo câu này):</strong></div>
                        <div style="margin-top: 6px;">${data.hint_text}</div>
                        ${citationHtml}
                    `;
                } catch (error) {
                    console.error("[Hint API Error] Lỗi khi lấy gợi ý:", error);
                    hintResultText.textContent = "Không thể tải gợi ý từ AI. Hãy thử lại sau.";
                    btn.disabled = false;
                }
            });
        });

        // Xử lý khi người dùng chọn một phương án đáp án (hoặc Skip)
        async function handleAnswerSelection(selectedId) {
            if (isAnswered) return;
            isAnswered = true;

            const currentQuestion = quizzes[currentQuestionIndex];
            console.log(`[Answer Submit] Lựa chọn của học viên: ${selectedId} cho câu: ${currentQuestion.id}`);

            // Ẩn vùng bỏ qua và đóng hint
            skipContainer.classList.add('hide');
            hintContent.classList.remove('show');

            // Hiển thị nút Tiếp tục và vùng feedback
            nextBtn.classList.add('d-flex');
            nextBtn.style.display = 'block';
            feedbackContainer.classList.remove('hide');
            explanationBox.innerHTML = '<div style="padding: 12px; font-weight: bold;">Đang phân tích lời giải thích từ AI Tutor...</div>';

            try {
                // Gọi API Explain để nhận phân tích cặn kẽ dựa vào tài liệu
                const response = await fetch(`${API_BASE_URL}/explain`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question_text: currentQuestion.question,
                        options: currentQuestion.options,
                        user_answer: selectedId
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                console.log("[Explain API Response] Nhận phân tích giải thích:", data);

                const correctLetter = data.correct_answer;
                const isCorrect = (selectedId === correctLetter);

                // 1. Cập nhật hiển thị màu sắc đúng/sai trên các phương án
                const optionElements = optionsList.querySelectorAll('.option-item');
                optionElements.forEach(opt => {
                    const optId = opt.getAttribute('data-id');
                    if (optId === correctLetter) {
                        opt.classList.add('correct');
                    }
                    if (optId === selectedId && !isCorrect && selectedId !== 'SKIP') {
                        opt.classList.add('wrong');
                    }
                });

                // 2. Tính toán điểm Elo đạt được cho câu hỏi này
                let scoreEarned = 0;
                if (isCorrect) {
                    const deduction = ELO_DEDUCTIONS[hintLevelUsed];
                    scoreEarned = Math.round(10 * (1 - deduction)); // Thang điểm 10 Elo cho mỗi câu
                    eloScore += scoreEarned;
                    
                    // Cập nhật điểm hiển thị trên Header
                    eloScoreEl.textContent = eloScore;

                    aiMessage.textContent = `Tutor: “Tuyệt vời! Bạn đã trả lời chính xác và đạt ${scoreEarned} Elo!”`;
                    aiMessage.style.color = "var(--friendly-green-dark)";
                    explanationBox.classList.remove('wrong-mode');
                } else {
                    aiMessage.textContent = selectedId === 'SKIP' 
                        ? "Tutor: “Bạn đã bỏ qua câu hỏi. Hãy xem giải thích bên dưới để củng cố kiến thức nhé!”"
                        : "Tutor: “Đáp án chưa chính xác. Đừng nản lòng, hãy xem phần giải thích từ bài giảng nhé!”";
                    aiMessage.style.color = "var(--primary-color-dark)";
                    explanationBox.classList.add('wrong-mode');
                }

                // 3. Lưu lại kết quả của câu trả lời này
                answersState[currentQuestionIndex] = {
                    selectedAnswer: selectedId,
                    isCorrect: isCorrect,
                    score: scoreEarned,
                    correctAnswer: correctLetter
                };

                // Cập nhật màu của Segment trên thanh tiến trình ngay lập tức
                const segments = progressBar.querySelectorAll('.progress-segment');
                if (segments[currentQuestionIndex]) {
                    segments[currentQuestionIndex].classList.remove('active');
                    segments[currentQuestionIndex].classList.add(isCorrect ? 'correct' : 'wrong');
                }

                // 4. Render nội dung giải thích chi tiết và trích dẫn citations
                let citationsHtml = '';
                if (data.citations && data.citations.length > 0) {
                    citationsHtml = `
                        <div class="explain-section citations-section">
                            <p class="explain-title info" style="color: var(--primary-color-dark)">📌 NGUỒN TÀI LIỆU TRÍCH DẪN (RAG)</p>
                            <div class="citations-list">
                                ${data.citations.map(c => {
                                    const slideLink = c.slide_file ? `href="../../../data/vlearn-pack/slides/${c.slide_file}${c.slide_page ? `#page=${c.slide_page}` : ''}"` : '';
                                    const transcriptLink = c.source_file ? `href="../../../data/vlearn-pack/transcript/${c.source_file}"` : '';
                                    return `
                                        <div class="citation-item">
                                            <div class="citation-meta">
                                                <span class="citation-tag">${c.chunk_id}</span>
                                                ${c.slide_file ? `<a ${slideLink} target="_blank" class="citation-link">📄 Slide: ${c.slide_file} (Trang ${c.slide_page || 1})</a>` : ''}
                                                ${c.source_file ? `<a ${transcriptLink} target="_blank" class="citation-link">📝 Transcript: ${c.source_file}</a>` : ''}
                                            </div>
                                            <blockquote class="citation-quote">"${c.quote}"</blockquote>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }

                explanationBox.innerHTML = `
                    <div class="explain-section">
                        <p class="explain-title green">✓ GIẢI THÍCH CHI TIẾT (Đáp án đúng: ${correctLetter})</p>
                        <p class="explain-content">${data.explanation}</p>
                    </div>
                    ${citationsHtml}
                `;

                // Tự động cuộn xuống phần giải thích
                setTimeout(() => {
                    quizBody.scrollTo({ top: quizBody.scrollHeight, behavior: 'smooth' });
                }, 100);

            } catch (error) {
                console.error("[Explain API Error] Lỗi khi giải thích câu hỏi:", error);
                explanationBox.innerHTML = `<div style="padding: 12px; color: var(--error-red); font-weight: bold;">Lỗi hệ thống: Không thể tạo giải thích từ máy chủ.</div>`;
            }
        }

        // Bắt sự kiện Skip (Bỏ qua)
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                handleAnswerSelection('SKIP');
            });
        }

        // ==========================================
        // 3. LOGIC CHAT SOCRATIC (HỎI AI TUTOR)
        // ==========================================
        
        // Mở Chat Drawer
        if (askAiTutorBtn) {
            askAiTutorBtn.addEventListener('click', () => {
                chatDrawer.classList.add('open');
                chatInput.focus();
                console.log("[Chat UI] Mở ngăn kéo Chat Socratic.");
            });
        }

        // Đóng Chat Drawer
        if (chatDrawerCloseBtn) {
            chatDrawerCloseBtn.addEventListener('click', () => {
                chatDrawer.classList.remove('open');
                console.log("[Chat UI] Đóng ngăn kéo Chat Socratic.");
            });
        }

        // Xử lý gửi tin nhắn chat Socratic
        async function handleSendChatMessage() {
            const messageText = chatInput.value.trim();
            if (!messageText) return;

            // Render tin nhắn của User lên giao diện
            appendChatMessage("user", messageText);
            chatInput.value = '';

            // Đưa tin nhắn vào lịch sử chat
            chatHistory.push({ role: "user", content: messageText });

            // Hiển thị typing indicator (AI đang suy nghĩ)
            const typingIndicator = showTypingIndicator();

            const currentQuestion = quizzes[currentQuestionIndex];
            console.log(`[Chat API Request] Gửi tin nhắn chat: '${messageText}' cho câu hỏi: ${currentQuestion.id}`);

            try {
                const response = await fetch(`${API_BASE_URL}/quiz/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question_text: currentQuestion.question,
                        options: currentQuestion.options,
                        user_message: messageText,
                        history: chatHistory
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                console.log("[Chat API Response] Nhận phản hồi dẫn dắt Socratic:", data);

                // Loại bỏ hiệu ứng đang gõ
                typingIndicator.remove();

                // Append câu trả lời của AI và lưu vào lịch sử
                appendChatMessage("assistant", data.reply, data.citations);
                chatHistory.push({ role: "model", content: data.reply });

            } catch (error) {
                console.error("[Chat API Error] Lỗi khi trao đổi chat với AI:", error);
                typingIndicator.remove();
                appendChatMessage("assistant", "Có lỗi kết nối đến máy chủ AI Tutor. Bạn vui lòng thử lại nhé!");
            }
        }

        // Thêm tin nhắn vào khung chat
        function appendChatMessage(sender, text, citations = []) {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('chat-message', sender);
            
            let citationHtml = '';
            if (citations && citations.length > 0) {
                citationHtml = `
                    <div class="citations-list" style="margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
                        ${citations.map(c => `
                            <div class="citation-item" style="padding: 6px 10px; margin-bottom: 4px; font-size: 11px;">
                                <div class="citation-meta" style="gap: 4px; margin-bottom: 2px;">
                                    <span class="citation-tag" style="padding: 1px 4px; font-size: 9px;">${c.chunk_id}</span>
                                    ${c.slide_file ? `<a href="../../../data/vlearn-pack/slides/${c.slide_file}${c.slide_page ? `#page=${c.slide_page}` : ''}" target="_blank" class="citation-link" style="font-size: 10px;">📄 Slide (Trang ${c.slide_page})</a>` : ''}
                                </div>
                                <blockquote class="citation-quote" style="font-size: 10px; line-height: 1.3;">"${c.quote}"</blockquote>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            msgDiv.innerHTML = `
                <div class="chat-text">${text}</div>
                ${citationHtml}
            `;
            
            chatDrawerBody.appendChild(msgDiv);
            chatDrawerBody.scrollTop = chatDrawerBody.scrollHeight; // Cuộn xuống dưới cùng
        }

        // Tạo typing indicator
        function showTypingIndicator() {
            const indicator = document.createElement('div');
            indicator.classList.add('typing-indicator');
            indicator.innerHTML = '<span></span><span></span><span></span>';
            chatDrawerBody.appendChild(indicator);
            chatDrawerBody.scrollTop = chatDrawerBody.scrollHeight;
            return indicator;
        }

        // Đăng ký sự kiện nút gửi chat
        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', handleSendChatMessage);
        }
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendChatMessage();
                }
            });
        }


        // ==========================================
        // 4. ĐIỀU HƯỚNG CÂU HỎI & KẾT THÚC (SCOREBOARD)
        // ==========================================
        
        // Nhấn nút Tiếp tục chuyển câu
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentQuestionIndex < quizzes.length - 1) {
                    currentQuestionIndex++;
                    renderQuestion(currentQuestionIndex);
                } else {
                    // Show Scoreboard kết quả cuối cùng
                    showFinalScoreboard();
                }
            });
        }

        // Hiển thị Scoreboard modal overlay
        function showFinalScoreboard() {
            console.log("[Quiz Scoreboard] Kết thúc toàn bộ bài quiz. Tính toán điểm số.");
            
            // Đếm số câu trả lời đúng
            const correctCount = answersState.filter(ans => ans && ans.isCorrect).length;
            correctCountText.textContent = `${correctCount} / ${quizzes.length}`;
            finalEloText.textContent = eloScore;

            // Đưa ra lời nhận xét đánh giá năng lực dựa trên điểm Elo tích lũy được
            let evaluation = "";
            if (eloScore >= 80) {
                evaluation = "Tutor: “Xuất sắc! Bạn có tư duy rất nhạy bén, nắm vững kiến thức từ tài liệu bài giảng và vận dụng xuất sắc. Bạn hoàn toàn tự tin áp dụng kiến thức này vào thực chiến!”";
            } else if (eloScore >= 50) {
                evaluation = "Tutor: “Tốt lắm! Bạn đã hiểu và áp dụng được hầu hết các khái niệm chính. Hãy đọc kỹ thêm các tài liệu slide và transcript được trích dẫn để khắc phục những điểm còn thiếu sót nhé!”";
            } else {
                evaluation = "Tutor: “Bạn cần dành thêm thời gian ôn tập lại. Hãy bấm vào các link tài liệu trích dẫn chi tiết trong các câu trả lời sai để đọc lại kỹ nội dung giảng viên truyền tải nhé. Cố gắng lên!”";
            }
            evaluationText.textContent = evaluation;

            // Hiện modal overlay
            scoreboardModal.classList.remove('hide');
        }

        // Bắt sự kiện phím tắt (1, 2, 3, 4, Enter) cho việc chọn phương án nhanh
        document.addEventListener('keydown', (e) => {
            // Chỉ bắt sự kiện phím tắt khi KHÔNG mở chat drawer hoặc đang gõ input
            if (document.activeElement === chatInput) return;

            if (!isAnswered) {
                if (e.key === '1') handleAnswerSelection('A');
                if (e.key === '2') handleAnswerSelection('B');
                if (e.key === '3') handleAnswerSelection('C');
                if (e.key === '4') handleAnswerSelection('D');
            } else {
                if (e.key === 'Enter') {
                    // Tự động nhấn nút Tiếp tục khi ấn Enter sau khi đã trả lời xong
                    if (currentQuestionIndex < quizzes.length - 1) {
                        currentQuestionIndex++;
                        renderQuestion(currentQuestionIndex);
                    } else if (scoreboardModal.classList.contains('hide')) {
                        showFinalScoreboard();
                    }
                }
            }
        });

        // Chạy render câu hỏi đầu tiên
        renderQuestion(currentQuestionIndex);
    }
});