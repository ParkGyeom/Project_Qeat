import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_SESSION_KEY = "admin_session";
const ADMIN_PIN_KEY = "admin_pin";
const DEFAULT_ADMIN_PIN = "0000";

const getAdminPin = () =>
  localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const savedPin = getAdminPin();

    if (!pin.trim()) return setError("비밀번호를 입력해주세요.");
    if (pin !== savedPin) return setError("비밀번호가 올바르지 않습니다.");

    localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({ ok: true, loginAt: new Date().toISOString() })
    );

    navigate("/admin/approval");
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
              Qeat <span className="text-blue-200">Admin</span>
            </span>
          </div>
          
          <h1 className="text-[38px] leading-[1.3] font-extrabold text-white tracking-tight mb-6">
            시스템 통합 관리,<br />
            Qeat 관리자 센터.
          </h1>
          <p className="text-[17px] text-blue-100/90 font-medium leading-relaxed">
            안전하고 효율적인 플랫폼 운영을 지원합니다.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 lg:hidden z-20">
          <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
            Qeat <span className="text-blue-200 whitespace-nowrap">Admin</span>
          </span>
        </div>

        {/* 폼을 감싸는 화이트 글래스 카드 */}
        <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-2xl p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60">
          <div className="text-left mb-10 pt-10 lg:pt-0">
            <h2 className="text-[32px] font-extrabold text-toss-dark tracking-tight mb-2">
              통합 관리자
            </h2>
            <p className="text-toss-light text-[15px] font-medium">
              관리자 비밀번호를 입력해주세요
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-bold text-left animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-toss-dark mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                placeholder="••••"
                className="w-full p-4 bg-gray-50 text-lg tracking-widest text-left font-bold rounded-xl outline-none border border-gray-100 focus:border-toss-blue focus:ring-4 focus:ring-toss-blue/10 transition-all placeholder:text-gray-300 placeholder:tracking-normal"
              />
              <p className="text-left text-[13px] text-gray-400 mt-3 font-medium">
                * 숫자만 입력할 수 있습니다.
              </p>
            </div>

            <div className="pt-2">
              <button className="w-full bg-toss-blue text-white h-[52px] rounded-xl font-bold text-[16px] hover:bg-blue-600 transition-colors shadow-sm focus:ring-4 focus:ring-toss-blue/10 outline-none">
                관리자 접속
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
