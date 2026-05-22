import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import CategoryTab from "../../components/guest/CategoryTab";
import MenuCard from "../../components/guest/MenuCard";
import CartFloatingBar from "../../components/guest/CartFloatingBar";
import OrderBottomSheet from "../../components/guest/OrderBottomSheet";

import { MENU_CATEGORIES } from "../../constants/categories";
import { getMenus } from "../../utils/mockApi";

// Remove local businessStatus imports

import { getPublicTableInfo } from "../../api/tableApi";

const REVERSE_MENU_CATEGORY_MAP = {
  "MAIN_FOOD": "메인",
  "SIDE_FOOD": "사이드",
  "DRINK": "음료",
  "REQUEST": "직원호출"
};

const MenuPage = () => {
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [menus, setMenus] = useState([]);

  // ✅ 영업 상태
  const [isClosed, setIsClosed] = useState(false);
  const [closingSoon, setClosingSoon] = useState(false);
  const [minLeft, setMinLeft] = useState(null);

  const [storeName, setStoreNameState] = useState("");

  // table 번호
  const { tableToken } = useParams();
  const queryParams = new URLSearchParams(location.search);
  
  // 추후 API를 통해 받아올 실제 테이블 번호 및 부스 정보
  const [tableNumber, setTableNumber] = useState(queryParams.get("table") || "1");
  const [boothId, setBoothId] = useState(null);

  // 메뉴 fetch
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (!tableToken) return;
        const data = await getPublicTableInfo(tableToken);
        setBoothId(data.boothId);
        setTableNumber(data.tableNumber);
        setStoreNameState(data.boothName);
        
        // 서버에서 받아온 영업 상태 (명시적으로 false일 때만 마감으로 간주)
        setIsClosed(data.open === false);

        if (data.open !== false && data.openTime && data.closeTime) {
          const now = new Date();
          const [oh, om] = data.openTime.split(":").map(Number);
          const [ch, cm] = data.closeTime.split(":").map(Number);
          
          const openDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), oh, om, 0);
          const closeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ch, cm, 0);
          
          // 자정을 넘기는 영업시간 지원 (예: 18:00 ~ 02:00)
          if (closeDate <= openDate) {
            if (now.getHours() < ch) {
              openDate.setDate(openDate.getDate() - 1);
            } else {
              closeDate.setDate(closeDate.getDate() + 1);
            }
          }

          const isTimeBetween = now.getTime() >= openDate.getTime() && now.getTime() < closeDate.getTime();
          
          if (!isTimeBetween) {
            // 시간이 아닐 때는 강제 마감 처리
            setIsClosed(true);
            setClosingSoon(false);
            setMinLeft(null);
          } else {
            // 시간 안에 들어왔다면 정상 영업중
            const diffMs = closeDate.getTime() - now.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            
            if (diffMin > 0 && diffMin <= 60) {
              setClosingSoon(true);
              setMinLeft(diffMin);
            } else {
              setClosingSoon(false);
              setMinLeft(null);
            }
          }
        } else if (data.open !== false && data.closeTime) {
          // 오픈 시간 없이 마감 시간만 있는 경우
          const now = new Date();
          const [ch, cm] = data.closeTime.split(":").map(Number);
          const closeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ch, cm, 0);
          
          const diffMs = closeDate.getTime() - now.getTime();
          const diffMin = Math.floor(diffMs / 60000);

          if (diffMs <= 0) {
            setIsClosed(true);
            setClosingSoon(false);
            setMinLeft(null);
          } else if (diffMin > 0 && diffMin <= 60) {
            setClosingSoon(true);
            setMinLeft(diffMin);
          } else {
            setClosingSoon(false);
            setMinLeft(null);
          }
        } else {
          setClosingSoon(false);
          setMinLeft(null);
        }
        
        const mapped = data.menus.map(m => ({
          ...m,
          image: m.imageUrl ? `${import.meta.env.VITE_API_BASE_URL || ''}${m.imageUrl}` : null,
          category: REVERSE_MENU_CATEGORY_MAP[m.category] || m.category,
          isSoldOut: m.soldOut, // UI 호환용
        }));
        setMenus(mapped);
      } catch (err) {
        console.error("Failed to load table info", err);
      }
    };
    
    fetchInfo();
    const interval = setInterval(fetchInfo, 5000); // 5초마다 갱신
    return () => clearInterval(interval);
  }, [tableToken]);

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
          {storeName}
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
        tableToken={tableToken} // 주문 생성 API에 필요함
        isClosed={isClosed} // ✅ 핵심: 주문하기 버튼 차단용
      />
    </div>
  );
};

export default MenuPage;
