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
    <div className="min-h-screen bg-toss-grey flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-[400px] p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-toss-dark mb-2">
            통합 관리자
          </h1>
          <p className="text-toss-light text-sm">
            관리자 비밀번호를 입력하세요
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-toss-dark mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="••••"
              className="w-full p-4 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50 transition"
            />
            <p className="text-xs text-toss-light mt-2">* 숫자만 입력됩니다.</p>
          </div>

          <button className="w-full bg-toss-blue text-white py-4 rounded-xl font-bold text-lg mt-4 hover:bg-blue-600 transition">
            관리자 접속
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
