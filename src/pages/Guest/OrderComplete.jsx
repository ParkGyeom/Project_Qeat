import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getStoreName } from "../../utils/storeInfo";

const OrderComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storeName = getStoreName();

  // URL 쿼리에서 테이블 번호 가져오기
  const queryParams = new URLSearchParams(location.search);
  const tableNumber = queryParams.get("table") || "1";

  // 페이지 진입 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* 성공 애니메이션 아이콘 (Toss 스타일) */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 bg-toss-lightBlue rounded-full flex items-center justify-center animate-bounce-subtle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-toss-blue animate-draw-check"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-toss-dark mb-2">
        주문이 완료되었습니다!
      </h1>
      <p className="text-lg text-toss-light font-medium mb-8">
        사장님께 소중한 주문이 전달되었어요.
      </p>

      {/* 주문 정보 요약 카드 */}
      <div className="w-full max-w-sm bg-toss-grey/30 rounded-3xl p-6 mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-gray-500">방문 매장</span>
          <span className="text-sm font-extrabold text-toss-dark">{storeName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-500">테이블 번호</span>
          <span className="text-sm font-extrabold text-toss-blue">{tableNumber}번 테이블</span>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs text-gray-400 font-medium mb-6">
          입금 확인 후 사장님이 주문을 승인해 드릴 거예요.<br/>
          잠시만 기다려 주세요!
        </p>
        
        <button
          onClick={() => navigate(`/guest/menu?table=${tableNumber}`)}
          className="w-full py-4 bg-toss-blue text-white font-bold rounded-2xl text-lg hover:bg-blue-600 transition-all shadow-lg active:scale-[0.98]"
        >
          메뉴 보러가기
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes draw-check {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw-check {
          stroke-dasharray: 24;
          animation: draw-check 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OrderComplete;
