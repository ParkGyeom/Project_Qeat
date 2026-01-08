import React from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/admin/approval"); // 로그인 성공 시 승인 페이지로 이동
  };

  return (
    <div className="min-h-screen bg-toss-dark flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-[400px] p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-toss-dark mb-2">
            통합 관리자
          </h1>
          <p className="text-toss-light text-sm">
            시스템 관리자 계정으로 로그인하세요
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="관리자 ID"
            className="w-full p-4 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-dark/20"
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full p-4 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-dark/20"
          />
          <button className="w-full bg-toss-dark text-white py-4 rounded-xl font-bold text-lg mt-4 hover:opacity-90 transition">
            관리자 접속
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
