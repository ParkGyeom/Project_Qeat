import React from "react";
import { Outlet } from "react-router-dom";

const GuestLayout = () => {
  return (
    // PC 배경 (어두운 회색 등 자유롭게)
    <div className="min-h-screen w-full bg-[#E5E8EB] flex justify-center items-center">
      {/* 모바일 뷰 컨테이너 */}
      {/* [수정 포인트] bg-white -> bg-toss-grey 로 변경하여 배경 통일 */}
      <div className="w-full max-w-[480px] min-h-screen bg-toss-grey shadow-2xl relative overflow-hidden flex flex-col">
        {/* 페이지 내용 */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default GuestLayout;
