import React from "react";
import { useNavigate } from "react-router-dom";

const OwnerLogin = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // 나중에 실제 로그인 로직이 들어갈 곳
    navigate("/owner/orders"); // 로그인 성공 시 주문관리 탭으로 이동
  };

  return (
    <div className="min-h-screen bg-toss-grey flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-[400px] p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-toss-dark mb-2">
            사장님 로그인
          </h1>
          <p className="text-toss-light text-sm">
            등록된 매장 계정으로 로그인해주세요
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-toss-dark mb-1">
              아이디
            </label>
            <input
              type="text"
              placeholder="admin"
              className="w-full p-4 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-toss-dark mb-1">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 bg-toss-grey rounded-xl outline-none focus:ring-2 focus:ring-toss-blue/50 transition"
            />
          </div>

          <button className="w-full bg-toss-blue text-white py-4 rounded-xl font-bold text-lg mt-4 hover:bg-blue-600 transition">
            로그인하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerLogin;
