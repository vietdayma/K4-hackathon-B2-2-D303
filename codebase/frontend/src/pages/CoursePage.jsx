import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CoursePage.css';

const daysData = [
  { day: 1, slides: 2, pdf: "/data/vlearn-pack/slides/d1-slide-hackathon.pdf" },
  { day: 2, slides: 1, pdf: "/data/vlearn-pack/slides/d2-slide-hackathon.pdf" },
  { day: 3, slides: 2 },
  { day: 4, slides: 3 },
  { day: 5, slides: 3 },
  { day: 6, slides: 1 }
];

export default function CoursePage() {
  const [openDay, setOpenDay] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState({});

  const toggleDay = (dayNum) => {
    setOpenDay(openDay === dayNum ? null : dayNum);
  };

  const toggleDrawer = (dayNum, action) => {
    setDrawerOpen(prev => ({
      ...prev,
      [dayNum]: prev[dayNum] === action ? null : action
    }));
  };

  const transcriptPath = (dayNum) => {
    return `/data/vlearn-pack/transcript/transcript-${String(dayNum).padStart(2, "0")}-clean.md`;
  };

  return (
    <div className="course-page-wrapper">
      <header className="site-header">
        <div className="nav-shell">
          <a className="brand" href="#top" aria-label="VLearn">
            <span className="brand-mark" aria-hidden="true"><i></i><i></i></span>
            <span><b>V</b>Learn</span>
          </a>
          <nav className="main-nav" aria-label="Điều hướng chính">
            <a href="#top">⌂&nbsp; Trang chủ</a>
            <a className="is-active" href="#course">▣&nbsp; Khóa học</a>
            <a href="#practice">⌘&nbsp; Luyện tập <small>SẮP RA MẮT</small></a>
            <a href="#notebook">▤&nbsp; Sổ tay học tập</a>
          </nav>
          <div className="header-tools" aria-label="Công cụ tài khoản">
            <button className="code-lab" type="button">↗&nbsp; Mở Codelabs</button>
            <button className="icon-button" type="button" aria-label="Ngôn ngữ">VI</button>
            <button className="icon-button" type="button" aria-label="Đổi giao diện">◔</button>
            <button className="icon-button" type="button" aria-label="Thông báo">♧</button>
            <button className="account" type="button" aria-label="Tài khoản">2</button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="course-summary" id="course">
          <div className="content-width course-summary__content">
            <div>
              <p className="course-label">VLEARN · VINUNI AI THỰC CHIẾN</p>
              <h1>COMP2010 - Khoá 3 + 4 Phase 1</h1>
              <p className="learner-count">1074 học viên cùng lớp</p>
            </div>
            <div className="reading-progress" aria-label="Tiến độ đọc">
              <div><span>✓</span> Đã đọc 0/7 ngày <i></i> <strong>0%</strong></div>
              <button type="button">Bắt đầu đọc</button>
            </div>
          </div>
        </section>

        <section className="course-days" aria-label="Nội dung khóa học">
          <div className="content-width" id="daysList">
            {daysData.map((day) => {
              const isOpen = openDay === day.day;
              const isWarmupReady = day.day === 1;
              const isQuizReady = day.day === 1;
              const isDrawerOpen = drawerOpen[day.day] === 'slides';

              return (
                <article key={day.day} className={`day-card ${isOpen ? 'is-open' : ''}`}>
                  <button 
                    className="day-heading" 
                    type="button" 
                    aria-expanded={isOpen}
                    onClick={() => toggleDay(day.day)}
                  >
                    <span className="day-number">
                      <small>DAY</small>
                      <strong>{String(day.day).padStart(2, "0")}</strong>
                    </span>
                    <span className="day-title">
                      <b>Day{String(day.day).padStart(2, "0")}</b>
                      <small>Chưa hoàn thành ngày học · {day.slides} slide</small>
                    </span>
                    <span className="chevron" aria-hidden="true">⌄</span>
                  </button>
                  
                  {isOpen && (
                    <div className="day-details">
                      <div className="day-actions" aria-label={`Tài nguyên Day${String(day.day).padStart(2, "0")}`}>
                        {isWarmupReady ? (
                          <Link className="day-action day-action--warmup" to="/warmup">
                            <span>◷</span>
                            <div>
                              <b>Chuẩn bị trước buổi học</b>
                              <small>Warm-up AI · khoảng 4 phút</small>
                            </div>
                          </Link>
                        ) : (
                          <button className="day-action" type="button" onClick={() => alert(`Phần chuẩn bị của Day${String(day.day).padStart(2, "0")} đang được biên soạn.`)}>
                            <span>◷</span>
                            <div>
                              <b>Chuẩn bị trước buổi học</b>
                              <small>Đang được biên soạn</small>
                            </div>
                          </button>
                        )}

                        <button className="day-action" type="button" onClick={() => toggleDrawer(day.day, 'slides')}>
                          <span>▤</span>
                          <div>
                            <b>Đọc slide</b>
                            <small>{day.slides} slide · mở tài liệu bên dưới</small>
                          </div>
                        </button>

                        {isQuizReady ? (
                          <Link className="day-action day-action--quiz" to="/quiz/survey">
                            <span>✓</span>
                            <div>
                              <b>Kiểm tra sau bài</b>
                              <small>Khảo sát nhanh và quiz củng cố</small>
                            </div>
                          </Link>
                        ) : (
                          <button className="day-action" type="button" onClick={() => alert(`Bài kiểm tra của Day${String(day.day).padStart(2, "0")} đang được biên soạn.`)}>
                            <span>✓</span>
                            <div>
                              <b>Kiểm tra sau bài</b>
                              <small>Đang được biên soạn</small>
                            </div>
                          </button>
                        )}
                      </div>

                      {isDrawerOpen && (
                        <div className="resource-drawer" data-drawer="slides">
                          <div className="drawer-heading">
                            <span>▤</span>
                            <div>
                              <b>Tài liệu Day{String(day.day).padStart(2, "0")}</b>
                              <small>Chọn tài liệu để đọc trong một tab mới</small>
                            </div>
                          </div>
                          <div className="resource-list">
                            {day.pdf && (
                              <a href={day.pdf} target="_blank" rel="noreferrer">
                                <span className="file-type">PDF</span>
                                <b>Slide Day{String(day.day).padStart(2, "0")}</b>
                                <small>Mở tài liệu ↗</small>
                              </a>
                            )}
                            <a href={transcriptPath(day.day)} target="_blank" rel="noreferrer">
                              <span className="file-type file-type--note">MD</span>
                              <b>Transcript Day{String(day.day).padStart(2, "0")}</b>
                              <small>Mở ghi chú ↗</small>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
