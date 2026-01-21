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
    <div className="min-h-screen bg-toss-grey flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-[400px] p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-toss-dark mb-2">
            사장님 로그인
          </h1>
          <p className="text-toss-light text-sm">
            등록된 계정으로 로그인해주세요
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="admin"
          />
          <Input
            label="비밀번호"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" fullWidth size="lg" className="mt-4">
            로그인하기
          </Button>
        </form>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-xs font-bold text-toss-light">
              처음이신가요?
            </span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          <Button
            variant="outline"
            fullWidth
            size="lg"
            className="mt-4"
            onClick={() => navigate("/owner/signup")}
          >
            회원가입하기
          </Button>

          <p className="text-center text-xs text-toss-light mt-3">
            가입 후 관리자 승인 완료 시 로그인 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
