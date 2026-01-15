import React, { useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { getOrders } from "../utils/mockApi";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const prevCountRef = useRef(0);

  // 현재 접속한 곳이 관리자 페이지인지 확인
  const isAdmin = location.pathname.startsWith("/admin");

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

      if (currentActiveCount > prevCountRef.current) {
        playNotificationSound();
      }
      prevCountRef.current = currentActiveCount;
    };

    const interval = setInterval(checkNewOrders, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // ✅ 관리자용: 가입 승인 대기 건수 상태
  const [pendingCount, setPendingCount] = React.useState(0);

  // 실시간 승인 대기 건수 감지 (관리자 페이지에서만)
  useEffect(() => {
    if (!isAdmin) return;

    const checkPendingOwners = () => {
      try {
        const raw = localStorage.getItem("owners");
        const list = raw ? JSON.parse(raw) : [];
        const count = list.filter((o) => !o.approved).length;
        setPendingCount(count);
      } catch (e) {
        console.error("Failed to load owners for pending count", e);
      }
    };

    checkPendingOwners();
    const interval = setInterval(checkPendingOwners, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // 메뉴 리스트 분기
  const MENUS = isAdmin
    ? [
        { id: "approval", name: "가입 승인", path: "/admin/approval", count: pendingCount },
        { id: "stores", name: "서비스 이용 목록", path: "/admin/stores" },
        { id: "settings", name: "관리자 설정", path: "/admin/settings" },
      ]
    : [
        { id: "orders", name: "주문 관리", path: "/owner/orders" },
        { id: "menu", name: "메뉴 관리", path: "/owner/menu" },
        { id: "sales", name: "매출 관리", path: "/owner/sales" },
        // ✅ 추가: 영업 관리 탭
        { id: "business", name: "영업 관리", path: "/owner/business" },
      ];

  // ✅ 로그아웃: 세션 삭제 + 이동
  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem("admin_session");
      navigate("/admin/login");
    } else {
      localStorage.removeItem("owner_session");
      navigate("/owner/login");
    }
  };

  return (
    <div className="min-h-screen bg-toss-grey flex">
      <nav className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-toss-blue">
            {isAdmin ? "통합 관리자" : "사장님 광장"}
          </h1>
          <p className="text-xs text-toss-light mt-1">
            {isAdmin ? "서비스 운영 시스템" : "내 매장 관리 시스템"}
          </p>
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
    </div>
  );
};

export default AdminLayout;
