import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setStoreName } from "../../utils/storeInfo";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const STORAGE_KEY = "owners";
const SESSION_KEY = "owner_session";

const loadOwners = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const OwnerLogin = () => {
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const list = loadOwners();
    const user = list.find((o) => o.id === id.trim());

    if (!user) {
      setError("가입되지 않은 학번입니다.");
      return;
    }
    if (user.password !== pw) {
      setError("비밀번호가 올바르지 않습니다.");
      return;
    }
    // ✅ 세션 저장 (기존 로직)
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: user.id,
        name: user.name,
        approved: true,
        loginAt: new Date().toISOString(),
      })
    );

    // ✨ [수정] 로그인 성공 시, 부스 선택 화면으로 이동
    navigate("/owner/booth-select");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-indigo-900 via-toss-blue to-[#F4F7FB] relative overflow-hidden">
      {/* 자연스러운 톤 연결을 돕는 은은한 빛 번짐 효과 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[30vw] h-[30vw] bg-[#F4F7FB]/60 rounded-full blur-[100px] pointer-events-none" />

      {/* 배경 로고 (화면 전체 우측에 거대하게 배치) - 화이트 톤으로 필터 적용 */}
      <img
        src="/sejong_logo.svg"
        alt="Sejong Logo"
        className="absolute top-1/2 right-0 translate-x-[35%] -translate-y-1/2 w-[180vw] sm:w-[150vw] lg:w-[1400px] opacity-[0.15] pointer-events-none z-0 brightness-0 invert mix-blend-overlay"
      />

      {/* Left Panel: Branding & Visuals (배경 투명화로 메인 그라데이션 투영) */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-12 z-10">
        <div className="relative w-full max-w-md">
          {/* Logo on the left panel */}
          <div className="mb-12">
            <span className="text-4xl font-black tracking-tighter text-white">
              Qeat <span className="text-blue-200">Business</span>
            </span>
          </div>
          
          <h1 className="text-[38px] leading-[1.3] font-extrabold text-white tracking-tight mb-6">
            스마트한 축제 부스 관리의 시작,<br />
            Qeat과 함께하세요.
          </h1>
          <p className="text-[17px] text-blue-100/90 font-medium leading-relaxed">
            주문 접수부터 매출 분석까지,<br />
            사장님의 성공적인 비즈니스를 지원합니다.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 lg:hidden z-20">
          <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
            Qeat <span className="text-blue-200 whitespace-nowrap">Business</span>
          </span>
        </div>

        {/* 폼을 감싸는 화이트 글래스 카드 */}
        <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-2xl p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 relative z-10">
          <div className="text-left mb-10 pt-10 lg:pt-0">
            <h2 className="text-[32px] font-extrabold text-toss-dark tracking-tight mb-2">
              사장님 로그인
            </h2>
            <p className="text-toss-light text-[15px] font-medium">
              계정에 로그인하여 매장을 관리해보세요
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-bold text-left animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="학번"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="20231234"
            />
            <Input
              label="비밀번호"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
            />

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                size="lg"
                className="rounded-xl font-bold text-[16px] h-[52px] shadow-sm hover:shadow-md transition-shadow"
              >
                로그인하기
              </Button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
