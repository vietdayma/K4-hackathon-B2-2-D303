// Đợi toàn bộ HTML tải xong mới chạy Logic
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LOGIC CHO TRANG KHẢO SÁT (index.html)
    // ==========================================
    const stars = document.querySelectorAll('.star-rating');
    
    if (stars.length > 0) { // Kiểm tra xem có đang ở trang Khảo sát không
        const ratingLabel = document.querySelector('.rating-label');
        const ratingTexts = [
            "Chưa hiểu lắm - Cần ôn lại",
            "Hiểu sương sương - Cần thực hành",
            "Khá ổn - Cần luyện tập thêm",
            "Rất tốt - Sẵn sàng áp dụng",
            "Xuất sắc - Hoàn toàn tự tin!"
        ];

        // Xử lý hiệu ứng chọn sao
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                stars.forEach((s, i) => {
                    s.classList.remove('pop');
                    if (i <= index) {
                        s.setAttribute('fill', 'var(--star-yellow)');
                        s.setAttribute('stroke', 'var(--star-yellow)');
                        void s.offsetWidth; // Reset animation
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

        // Xử lý bấm vào các thẻ Gợi ý (Chips)
        const chips = document.querySelectorAll('.suggestion-chip');
        const textarea = document.querySelector('.feedback-input');

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                let currentText = textarea.value.trim();
                let chipText = chip.textContent;

                if (currentText.length > 0) {
                    textarea.value = currentText + ", " + chipText;
                } else {
                    textarea.value = chipText;
                }
                textarea.focus();
            });
        });

        // Bắt sự kiện Enter để chuyển sang trang câu hỏi
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                window.location.href = 'cauhoi.html';
            }
        });
    }

    // ==========================================
    // 2. LOGIC CHO TRANG TRẮC NGHIỆM (cauhoi.html)
    // ==========================================
    const quizApp = document.getElementById('quizApp');
    
    if (quizApp) { // Kiểm tra xem có đang ở trang Trắc nghiệm không
        const hintToggleBtn = document.getElementById('hintToggleBtn');
        const hintContent = document.getElementById('hintContent');
        const options = document.querySelectorAll('.option-item');
        const skipContainer = document.getElementById('skipContainer');
        const feedbackContainer = document.getElementById('feedbackContainer');
        const explanationBox = document.getElementById('explanationBox');
        const aiMessage = document.getElementById('aiMessage');
        const nextBtn = document.getElementById('nextBtn');
        const quizBody = document.getElementById('quizBody');
        const seg1 = document.getElementById('seg-1');

        let isAnswered = false;

        // Xử lý nút bật/tắt HINT
        if(hintToggleBtn) {
            hintToggleBtn.addEventListener('click', () => {
                hintContent.classList.toggle('show');
            });
        }

        // Hàm xử lý khi chọn đáp án
        function handleSelectAnswer(selectedId) {
            if (isAnswered) return;
            isAnswered = true;

            quizApp.classList.add('answered');

            const selectedElement = document.querySelector(`.option-item[data-id="${selectedId}"]`);
            const correctElement = document.querySelector('.option-item[data-id="C"]'); // C là đáp án đúng

            skipContainer.classList.add('d-none');
            hintContent.classList.remove('show'); 
            
            nextBtn.classList.add('d-flex');
            feedbackContainer.classList.add('d-block');

            correctElement.classList.add('correct');

            if (selectedId === 'C') { 
                aiMessage.textContent = "Tutor: “Tuyệt vời! Bạn nắm lý thuyết rất vững vàng!”";
                aiMessage.style.color = "var(--friendly-green-dark)";
                explanationBox.classList.remove('wrong-mode');
                seg1.classList.add('correct');
            } else { 
                aiMessage.textContent = "Tutor: “Đừng nản lòng, hãy xem phần giải thích bên dưới nhé!”";
                aiMessage.style.color = "var(--primary-color-dark)"; 
                explanationBox.classList.add('wrong-mode');

                if (selectedElement && selectedId !== 'SKIP') {
                    selectedElement.classList.add('wrong');
                }
            }
            
            // Tự động cuộn xuống phần giải thích
            setTimeout(() => {
                quizBody.scrollTo({ top: quizBody.scrollHeight, behavior: 'smooth' });
            }, 100);
        }

        // Bắt sự kiện Click chuột vào đáp án
        options.forEach(option => {
            option.addEventListener('click', () => {
                const id = option.getAttribute('data-id');
                handleSelectAnswer(id);
            });
        });

        // Bắt sự kiện bỏ qua
        const skipBtn = document.querySelector('.skip-btn');
        if(skipBtn) {
            skipBtn.addEventListener('click', () => {
                handleSelectAnswer('SKIP'); 
            });
        }

        // Bắt sự kiện phím tắt (1,2,3,4, Enter)
        document.addEventListener('keydown', (e) => {
            if (!isAnswered) {
                if (e.key === '1') handleSelectAnswer('A');
                if (e.key === '2') handleSelectAnswer('B');
                if (e.key === '3') handleSelectAnswer('C');
                if (e.key === '4') handleSelectAnswer('D');
            } else {
                if (e.key === 'Enter') {
                    alert("Tính năng chuyển sang màn hình tiếp theo sẽ được code sau!");
                }
            }
        });

        if(nextBtn) {
            nextBtn.addEventListener('click', () => {
                alert("Tính năng chuyển sang màn hình tiếp theo sẽ được code sau!");
            });
        }
    }
});