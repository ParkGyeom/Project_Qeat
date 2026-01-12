import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import CategoryTab from "../../components/guest/CategoryTab";
import MenuCard from "../../components/guest/MenuCard";
import CartFloatingBar from "../../components/guest/CartFloatingBar";
import OrderBottomSheet from "../../components/guest/OrderBottomSheet";

import { MENU_CATEGORIES } from "../../constants/categories";
import { getMenus } from "../../utils/mockApi";

import {
  isBusinessClosedToday,
  isClosingSoon,
  minutesToClose,
  ensureAutoCloseToday,
} from "../../utils/businessStatus";

import { getStoreName } from "../../utils/storeInfo";

const MenuPage = () => {
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [menus, setMenus] = useState([]);

  // ✅ 영업 상태
  const [isClosed, setIsClosed] = useState(false);
  const [closingSoon, setClosingSoon] = useState(false);
  const [minLeft, setMinLeft] = useState(null);

  const [storeName, setStoreNameState] = useState(getStoreName());

  // table 번호
  const queryParams = new URLSearchParams(location.search);
  const tableNumber = queryParams.get("table") || "1";

  // 메뉴 fetch
  useEffect(() => {
    const fetchMenus = () => setMenus(getMenus() || []);
    fetchMenus();
    const interval = setInterval(fetchMenus, 3000);
    return () => clearInterval(interval);
  }, []);

  // ✅ 영업마감/마감임박 상태를 1초마다 갱신
  useEffect(() => {
    const tick = () => {
      // 마감시간 지나면 자동 마감
      ensureAutoCloseToday();

      setIsClosed(isBusinessClosedToday());
      setClosingSoon(isClosingSoon());
      setMinLeft(minutesToClose());
    };

    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // 카테고리 필터 + 품절 하단정렬
  const filteredMenus = useMemo(() => {
    return (menus || [])
      .filter((m) => m.category === activeCategory)
      .sort((a, b) => {
        if (a.isSoldOut === b.isSoldOut) return 0;
        return a.isSoldOut ? 1 : -1;
      });
  }, [menus, activeCategory]);

  return (
    <div className="w-full h-full bg-toss-grey flex flex-col relative">
      <header className="px-5 pt-8 pb-4 bg-white sticky top-0 z-20 border-b border-toss-grey/50">
        <p className="text-base font-semibold text-gray-500 mb-0.5">
          {storeName} 주점 🍺
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900">
          테이블 {tableNumber}번
        </h1>

        {/* ✅ 마감 임박 경고 */}
        {!isClosed && closingSoon && (
          <div className="mt-4 px-4 py-3 rounded-2xl bg-yellow-50 border border-yellow-100 text-yellow-900">
            <p className="text-sm font-extrabold">
              ⏰ 곧 영업이 종료됩니다
              {minLeft !== null ? ` · 약 ${minLeft}분 남음` : ""}
            </p>
            <p className="text-xs font-semibold text-yellow-800/80 mt-1">
              서둘러 주문해주세요.
            </p>
          </div>
        )}

        {/* ✅ 영업 종료 배너 */}
        {isClosed && (
          <div className="mt-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 font-bold text-sm text-center">
            오늘은 영업이 종료되었습니다. 주문이 불가능합니다.
          </div>
        )}
      </header>

      <CategoryTab
        categories={MENU_CATEGORIES}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="p-5 flex-1 overflow-y-auto pb-32">
        {filteredMenus.length === 0 ? (
          <div className="p-10 text-center text-toss-light">
            해당 카테고리에 메뉴가 없습니다.
          </div>
        ) : (
          filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              isClosed={isClosed}
              isClosingSoon={closingSoon}
            />
          ))
        )}
      </div>

      {/* ✅ 영업 종료면 바텀시트 열어도 주문 못 하게 만들 거라,
          일단 바는 눌릴 수 있게 두되, 원하면 여기서도 비활성 처리 가능 */}
      <CartFloatingBar onClick={() => setIsSheetOpen(true)} />

      <OrderBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        tableNumber={tableNumber}
        isClosed={isClosed} // ✅ 핵심: 주문하기 버튼 차단용
      />
    </div>
  );
};

export default MenuPage;
