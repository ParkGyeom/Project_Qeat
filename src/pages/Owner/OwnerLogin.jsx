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
      setError("존재하지 않는 아이디입니다.");
      return;
    }
    if (user.password !== pw) {
      setError("비밀번호가 올바르지 않습니다.");
      return;
    }
    if (!user.approved) {
      setError("관리자 승인 대기 중입니다. 승인 후 로그인할 수 있어요.");
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
    <div className="relative min-h-screen bg-[#F2F4F6] flex justify-center items-center p-4 overflow-hidden">
      {/* 배경 장식 1: 은은한 블러 원 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-toss-blue/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 배경 장식 2: 거대한 Qeat 워터마크 (아주 연하게) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
        <span className="text-[25vw] font-black text-black tracking-tighter mix-blend-multiply">
          Qeat
        </span>
      </div>

      {/* 로그인 박스 */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md w-full max-w-[420px] p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/50">
        <div className="text-center mb-10">
          <div className="mx-auto flex justify-center items-center w-16 h-16 rounded-[20px] bg-blue-50 text-toss-blue mb-5 shadow-sm">
            {/* 심플한 상점/로고 아이콘 */}
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-toss-dark tracking-tight mb-2">
            사장님 로그인
          </h1>
          <p className="text-toss-light text-[15px] font-medium">
            Qeat 점주 전용 시스템입니다
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="owner"
          />
          <Input
            label="비밀번호"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
          />

          <div className="pt-4">
            <Button
              type="submit"
              fullWidth
              size="lg"
              className="rounded-xl font-bold text-[16px] h-[52px]"
            >
              로그인하기
            </Button>
          </div>
        </form>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-[13px] font-bold text-toss-light">
              처음이신가요?
            </span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          <Button
            variant="outline"
            fullWidth
            size="lg"
            className="mt-5 rounded-xl font-bold text-[16px] h-[52px]"
            onClick={() => navigate("/owner/signup")}
          >
            입점 신청하기
          </Button>

          <p className="text-center text-[13px] text-gray-400 mt-4 leading-relaxed">
            가입 후 관리자 승인이 완료되면
            <br />
            로그인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
