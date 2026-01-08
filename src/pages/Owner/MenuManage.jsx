import React, { useState } from "react";
import MenuForm from "../../components/owner/MenuForm";
import { formatPrice } from "../../utils/format";

// 초기 데이터
const INITIAL_MENUS = [
  {
    id: 1,
    category: "메인",
    name: "후라이드 치킨",
    price: 18000,
    isSoldOut: false,
    image: null,
  },
  {
    id: 2,
    category: "메인",
    name: "양념 치킨",
    price: 19000,
    isSoldOut: true,
    image: null,
  },
  {
    id: 3,
    category: "사이드",
    name: "치즈볼",
    price: 5000,
    isSoldOut: false,
    image: null,
  },
  {
    id: 4,
    category: "음료",
    name: "콜라 500ml",
    price: 2000,
    isSoldOut: false,
    image: null,
  },
  {
    id: 5,
    category: "직원호출",
    name: "물 좀 주세요",
    price: 0,
    isSoldOut: false,
    image: null,
  },
];

const CATEGORIES = ["전체", "메인", "사이드", "음료", "직원호출"];

const MenuManage = () => {
  const [menus, setMenus] = useState(INITIAL_MENUS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [activeCategory, setActiveCategory] = useState("전체");

  const filteredMenus =
    activeCategory === "전체"
      ? menus
      : menus.filter((menu) => menu.category === activeCategory);

  // [New] 카테고리별 태그 색상 반환 함수
  const getCategoryColor = (category) => {
    switch (category) {
      case "메인":
        return "bg-blue-100 text-blue-600"; // 파랑
      case "사이드":
        return "bg-orange-100 text-orange-600"; // 주황
      case "음료":
        return "bg-green-100 text-green-600"; // 초록
      case "직원호출":
        return "bg-purple-100 text-purple-600"; // 보라
      default:
        return "bg-gray-100 text-gray-600"; // 기본
    }
  };

  const openModal = (menu = null) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleSave = (menuData) => {
    if (editingMenu) {
      setMenus(menus.map((m) => (m.id === menuData.id ? menuData : m)));
    } else {
      setMenus([...menus, menuData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("정말 이 메뉴를 삭제하시겠습니까?")) {
      setMenus(menus.filter((m) => m.id !== id));
    }
  };

  const toggleSoldOut = (id) => {
    setMenus(
      menus.map((m) => (m.id === id ? { ...m, isSoldOut: !m.isSoldOut } : m))
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-toss-dark">메뉴 관리</h2>
        <button
          onClick={() => openModal(null)}
          className="bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-100 whitespace-nowrap"
        >
          + 메뉴 등록
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? "bg-toss-dark text-white shadow-md" // 선택된 탭은 검정색으로 강조
                : "bg-white text-toss-light border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredMenus.length === 0 ? (
          <div className="p-10 text-center text-toss-light">
            해당 카테고리에 메뉴가 없습니다.
          </div>
        ) : (
          filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="p-5 border-b border-gray-100 last:border-0 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div
                className={`flex items-center gap-4 ${
                  menu.isSoldOut ? "opacity-50 grayscale" : ""
                }`}
              >
                {/* 썸네일 */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-none border border-gray-200">
                  {menu.image ? (
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center text-xs text-gray-400">
                      No Img
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* [Color] 카테고리 색상 적용되는 부분 */}
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${getCategoryColor(
                        menu.category
                      )}`}
                    >
                      {menu.category}
                    </span>
                    <h3 className="text-lg font-bold text-toss-dark">
                      {menu.name}
                    </h3>
                    {menu.isSoldOut && (
                      <span className="text-xs font-bold text-red-500 border border-red-500 px-1 rounded">
                        품절됨
                      </span>
                    )}
                  </div>
                  <p className="text-toss-light">{formatPrice(menu.price)}원</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSoldOut(menu.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold border transition ${
                    menu.isSoldOut
                      ? "bg-toss-dark text-white border-toss-dark"
                      : "bg-white text-toss-red border-toss-red hover:bg-red-50"
                  }`}
                >
                  {menu.isSoldOut ? "품절 해제" : "품절 처리"}
                </button>
                <button
                  onClick={() => openModal(menu)}
                  className="px-3 py-2 bg-toss-grey text-toss-dark rounded-lg text-sm font-bold hover:bg-gray-200 transition"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(menu.id)}
                  className="px-3 py-2 text-toss-light hover:text-toss-red text-sm font-medium underline decoration-1 underline-offset-2"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <MenuForm
          initialData={editingMenu}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MenuManage;
