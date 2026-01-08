import React, { useState } from "react";
import CategoryTab from "../../components/guest/CategoryTab";
import MenuCard from "../../components/guest/MenuCard";
import CartFloatingBar from "../../components/guest/CartFloatingBar";
import OrderBottomSheet from "../../components/guest/OrderBottomSheet";

// 데이터는 그대로 유지
const DUMMY_MENUS = [
  { id: 1, category: "메인", name: "후라이드 치킨", price: 18000, image: null },
  { id: 2, category: "메인", name: "양념 치킨", price: 19000, image: null },
  { id: 3, category: "사이드", name: "치즈볼", price: 5000, image: null },
  { id: 4, category: "음료", name: "콜라 500ml", price: 2000, image: null },
  { id: 5, category: "직원호출", name: "물 좀 주세요", price: 0, image: null },
];
const CATEGORIES = ["메인", "사이드", "음료", "직원호출"];

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("메인");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredMenus = DUMMY_MENUS.filter(
    (menu) => menu.category === activeCategory
  );

  return (
    <div className="w-full h-full bg-toss-grey flex flex-col relative">
      {/* [수정된 디자인] */}
      <header className="px-5 pt-8 pb-4 bg-white sticky top-0 z-20 border-b border-toss-grey/50">
        {/* 1. 가게 이름: 적당한 크기 + 중간 진하기 회색 */}
        {/* text-base(보통크기), font-semibold(중간두께), text-gray-500(진한회색) */}
        <p className="text-base font-semibold text-gray-500 mb-0.5">
          컴공 주점 🍺
        </p>

        {/* 2. 테이블 번호: 아주 큰 크기 + 아주 두꺼운 글씨 + 검정색 */}
        {/* text-3xl(매우큼), font-extrabold(가장두꺼움), text-gray-900(거의검정) */}
        <h1 className="text-3xl font-extrabold text-gray-900">테이블 1번</h1>
      </header>

      <CategoryTab
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="p-5 flex-1 overflow-y-auto pb-32">
        {filteredMenus.map((menu) => (
          <MenuCard key={menu.id} menu={menu} />
        ))}
      </div>

      <CartFloatingBar onClick={() => setIsSheetOpen(true)} />
      <OrderBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
};

export default MenuPage;
