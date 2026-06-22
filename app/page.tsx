export default function HomePage() {
  return (
    <main>
      {/* ── 히어로 (검정 배경) ── */}
      <section
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#000000" }}
      >
        {/* 헤더 */}
        <header className="max-w-[1280px] w-full mx-auto px-8 py-7 flex items-center justify-between">
          <span
            className="text-sm font-medium tracking-widest"
            style={{ color: "#ffffff" }}
          >
            AUDREYTAILOR
          </span>
        </header>

        {/* 히어로 본문 */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-32">
          <h1
            className="font-light mb-8 max-w-3xl"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: "1.05",
              letterSpacing: "-2px",
              color: "#ffffff",
            }}
          >
            AUDREYTAILOR
          </h1>

          <p
            className="text-lg mb-12 max-w-lg leading-relaxed"
            style={{ color: "#999999" }}
          >
            드레스피팅부터 스타일리스트까지,
            <br />
            팀 전체 예약을 한 화면에서 관리하세요.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <a
              href="/app"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[12px] text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#0096f7",
                color: "#ffffff",
              }}
            >
              예약 관리 시작하기
            </a>
            <p className="text-xs" style={{ color: "#666666" }}>
              팀 예약 현황을 확인하고 관리합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 핵심 가치 카드 (Parchment 배경) ── */}
      <section
        className="px-6 py-32"
        style={{ backgroundColor: "#fdfdf7" }}
      >
        <div className="max-w-[1280px] mx-auto">
          {/* 섹션 타이틀 */}
          <p
            className="text-sm font-medium tracking-widest text-center mb-16"
            style={{ color: "#999999" }}
          >
            핵심 기능
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 카드 1 */}
            <div
              className="rounded-[18px] p-9 flex flex-col gap-5"
              style={{
                backgroundColor: "#f5f2de",
                boxShadow: "rgba(0, 0, 0, 0.12) 0px 0.5px 2px 0px",
              }}
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{ backgroundColor: "#0096f7" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="13" rx="2" stroke="white" strokeWidth="1.5" />
                  <path d="M2 8h16" stroke="white" strokeWidth="1.5" />
                  <path d="M6 2v4M14 2v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#000000" }}
                >
                  부서별 예약, 한 화면에
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#666666" }}
                >
                  드레스피팅·헤어메이크업·스타일리스트 1~6,
                  8개 카테고리 예약 현황을 캘린더로 한눈에 확인합니다.
                </p>
              </div>
            </div>

            {/* 카드 2 */}
            <div
              className="rounded-[18px] p-9 flex flex-col gap-5"
              style={{
                backgroundColor: "#f5f2de",
                boxShadow: "rgba(0, 0, 0, 0.12) 0px 0.5px 2px 0px",
              }}
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{ backgroundColor: "#0096f7" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3" stroke="white" strokeWidth="1.5" />
                  <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#000000" }}
                >
                  클릭 한 번으로 담당 배정
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#666666" }}
                >
                  텍스트 입력 없이 버튼으로 담당자를 지정합니다.
                  배정 정보는 내부 직원만 확인할 수 있습니다.
                </p>
              </div>
            </div>

            {/* 카드 3 */}
            <div
              className="rounded-[18px] p-9 flex flex-col gap-5"
              style={{
                backgroundColor: "#f5f2de",
                boxShadow: "rgba(0, 0, 0, 0.12) 0px 0.5px 2px 0px",
              }}
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{ backgroundColor: "#0096f7" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1H6l-3 3V5a1 1 0 011-1z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h2
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#000000" }}
                >
                  예약 확정 알림, 자동으로
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#666666" }}
                >
                  예약이 확정되면 고객에게 카카오톡 메시지가 자동으로 전송됩니다.
                  직접 보낼 필요가 없습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer
        className="px-8 py-8 border-t"
        style={{
          backgroundColor: "#fdfdf7",
          borderColor: "#e7e3e1",
        }}
      >
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <span
            className="text-xs font-medium tracking-widest"
            style={{ color: "#999999" }}
          >
            AUDREYTAILOR
          </span>
          <span className="text-xs" style={{ color: "#d3d3d3" }}>
            내부 직원 전용 시스템
          </span>
        </div>
      </footer>
    </main>
  );
}
