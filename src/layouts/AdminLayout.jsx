import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { getOrders } from "../utils/mockApi";
import { getBoothInfo, setBoothInfo } from "../utils/storeInfo";
import { getMyBooths } from "../api/boothApi";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const prevCountRef = useRef(0);

  // 현재 접속한 곳이 관리자 페이지인지 확인
  const isAdmin = location.pathname.startsWith("/admin");
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [showOrderToast, setShowOrderToast] = useState(false);

  // 알림음 재생 함수
  const playNotificationSound = () => {
    const audio = new Audio("/sounds/dingdong.mp3?v=" + Date.now());
    audio.play().catch(() => {
      console.log("화면을 클릭해야 알림음이 재생됩니다.");
    });
  };

  // 실시간 주문 감지 로직(사장님 페이지에서만)
  useEffect(() => {
    if (isAdmin) return;

    const initialOrders = getOrders() || [];
    prevCountRef.current = initialOrders.filter(
      (o) => o.status === "접수대기"
    ).length;

    const checkNewOrders = () => {
      const allOrders = getOrders() || [];
      const currentActiveCount = allOrders.filter(
        (o) => o.status === "접수대기"
      ).length;

      setPendingOrderCount(currentActiveCount); // ✅ 상태 업데이트

      if (currentActiveCount > prevCountRef.current) {
        playNotificationSound();
        
        // 사장님 페이지이고 현재 주문 관리 페이지가 아닐 때만 팝업 노출
        if (!isAdmin && location.pathname !== "/owner/orders") {
          setShowOrderToast(true);
          // 5초 뒤 자동 삭제
          setTimeout(() => setShowOrderToast(false), 5000);
        }
      }
      prevCountRef.current = currentActiveCount;
    };

    checkNewOrders(); // 초기 즉시 실행
    const interval = setInterval(checkNewOrders, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // ✅ 관리자용: 부스 승인 대기 건수 상태
  const [pendingBoothCount, setPendingBoothCount] = React.useState(0);

  // 실시간 승인 대기 건수 감지 (관리자 페이지에서만)
  useEffect(() => {
    if (!isAdmin) return;

    const checkPendingBooths = () => {
      try {
        // ✅ 부스 대기 건수 체크
        const rawBooths = localStorage.getItem("owner_booths_v1");
        const allBooths = rawBooths ? JSON.parse(rawBooths) : {};
        let boothCount = 0;
        Object.values(allBooths).forEach((boothList) => {
          boothCount += boothList.filter((b) => b.status === "pending").length;
        });
        setPendingBoothCount(boothCount);
      } catch (e) {
        console.error("Failed to load owners for pending count", e);
      }
    };

    checkPendingBooths();
    const interval = setInterval(checkPendingBooths, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // 메뉴 리스트 분기
  const MENUS = isAdmin
    ? [
        { id: "boothApproval", name: "부스 가입 승인", path: "/admin/booth-approval", count: pendingBoothCount },
        { id: "stores", name: "서비스 이용 목록", path: "/admin/stores" },
        { id: "settings", name: "관리자 설정", path: "/admin/settings" },
      ]
    : [
        { 
          id: "orders", 
          name: "주문 관리", 
          path: "/owner/orders", 
          count: pendingOrderCount // ✅ 주문 건수 연동
        },
        { id: "menu", name: "메뉴 관리", path: "/owner/menu" },
        { id: "sales", name: "매출 관리", path: "/owner/sales" },
        // ✅ 추가: 영업 관리 탭
        { id: "business", name: "영업 관리", path: "/owner/business" },
      ];

  // ✅ 부스 관련 상태
  const [currentBooth, setCurrentBooth] = React.useState(getBoothInfo());
  const [myBooths, setMyBooths] = React.useState([]);
  const [isBoothListOpen, setIsBoothListOpen] = React.useState(false);

  useEffect(() => {
    if (isAdmin) return;
    
    const fetchBooths = async () => {
      try {
        const list = await getMyBooths();
        setMyBooths(list);
      } catch (err) {
        console.error("Failed to fetch booths in layout", err);
      }
    };
    
    fetchBooths();
    
    // 현재 부스 정보 동기화
    setCurrentBooth(getBoothInfo());
  }, [isAdmin, location.pathname]);

  const handleBoothChange = (booth) => {
    setBoothInfo(booth);
    setCurrentBooth(booth);
    setIsBoothListOpen(false);
    // 데이터 새로고침을 위해 페이지 리로드 혹은 이동 (현재 페이지 유지하며 데이터만 새로고침되는지 확인)
    window.location.reload(); 
  };

  // ✅ 로그아웃: 세션 삭제 + 이동
  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem("admin_session");
      navigate("/admin/login");
    } else {
      localStorage.removeItem("owner_session");
      localStorage.removeItem("qeat_booth_detail_v1"); // 부스 선택 정보도 삭제
      navigate("/owner/login");
    }
  };

  return (
    <div className="min-h-screen bg-toss-grey flex">
      <nav className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        {/* ✅ 실시간 주문 팝업 알림 */}
        {showOrderToast && (
          <div 
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down cursor-pointer"
            onClick={() => {
              navigate("/owner/orders");
              setShowOrderToast(false);
            }}
          >
            <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 min-w-[320px] hover:bg-gray-50 transition-colors ring-4 ring-toss-blue/5">
              <div className="w-10 h-10 bg-toss-lightBlue rounded-full flex items-center justify-center text-xl">
                🔔
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold text-toss-blue mb-0.5">새로운 주문 도착</p>
                <p className="text-sm font-extrabold text-toss-dark">지금 바로 주문을 확인하세요!</p>
              </div>
              <div className="text-xs font-bold text-gray-400">
                방금 전
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-toss-blue">
            {isAdmin ? "통합 관리자" : "사장님 광장"}
          </h1>
          <p className="text-xs text-toss-light mt-1">
            {isAdmin ? "서비스 운영 시스템" : "내 매장 관리 시스템"}
          </p>

          {/* ✅ 부스 변경 탭 (사장님 전용) */}
          {!isAdmin && currentBooth && (
            <div className="mt-4 relative">
              <button
                onClick={() => setIsBoothListOpen(!isBoothListOpen)}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">🏬</span>
                  <span className="text-sm font-bold text-toss-dark truncate">
                    {currentBooth.name}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-gray-400 transition-transform ${isBoothListOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isBoothListOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto overflow-x-hidden py-1">
                  {myBooths.length > 0 ? (
                    myBooths.map((booth, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleBoothChange(booth)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                          currentBooth.name === booth.name ? "text-toss-blue font-bold" : "text-gray-600"
                        }`}
                      >
                        <span className="truncate">{booth.name}</span>
                        {currentBooth.name === booth.name && (
                          <span className="w-1 h-1 bg-toss-blue rounded-full"></span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-gray-400">등록된 부스가 없습니다.</div>
                  )}
                  <div className="border-t border-gray-50 mt-1">
                    <button
                      onClick={() => navigate("/owner/booth-select")}
                      className="w-full text-left px-4 py-2.5 text-xs text-toss-blue font-bold hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      부스 관리 이동
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 py-4 px-3 space-y-1">
          {MENUS.map((menu) => (
            <button
              key={menu.id}
              onClick={() => navigate(menu.path)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between ${
                location.pathname === menu.path
                  ? "bg-toss-lightBlue text-toss-blue font-bold"
                  : "text-toss-light hover:bg-gray-50"
              }`}
            >
              <span>{menu.name}</span>
              {menu.count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.2rem] h-[1.2rem] flex items-center justify-center">
                  {menu.count > 99 ? "99+" : menu.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full py-2 text-sm text-toss-light hover:text-toss-red transition-colors"
          >
            로그아웃
          </button>
        </div>
      </nav>

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -20px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
