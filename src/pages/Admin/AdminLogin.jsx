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
    <div className="relative min-h-screen bg-[#F2F4F6] flex justify-center items-center p-4 overflow-hidden">
      {/* 배경 장식 1: 은은한 블러 원 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-toss-blue/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 배경 장식 2: 거대한 Qeat 워터마크 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
        <span className="text-[25vw] font-black text-black tracking-tighter mix-blend-multiply">
          Qeat
        </span>
      </div>

      {/* 로그인 박스 */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md w-full max-w-[420px] p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/50 animate-fade-in">
        <div className="text-center mb-10">
          <div className="mx-auto flex justify-center items-center w-16 h-16 rounded-[20px] bg-gray-50 text-toss-dark mb-5 shadow-sm">
            {/* 관리자 뱃지/쉴드 아이콘 */}
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-toss-dark tracking-tight mb-2">
            통합 관리자
          </h1>
          <p className="text-toss-light text-[15px] font-medium">
            관리자 비밀번호를 입력해주세요
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full p-4 bg-gray-50 text-lg tracking-widest text-center font-bold rounded-xl outline-none border border-gray-100 focus:border-toss-blue focus:ring-4 focus:ring-toss-blue/10 transition-all placeholder:text-gray-300 placeholder:tracking-normal"
            />
            <p className="text-center text-[13px] text-gray-400 mt-3 font-medium">
              * 숫자만 입력할 수 있습니다.
            </p>
          </div>

          <div className="pt-4">
            <button className="w-full bg-toss-blue text-white h-[52px] rounded-xl font-bold text-[16px] hover:bg-blue-600 transition-colors shadow-sm">
              관리자 접속
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
