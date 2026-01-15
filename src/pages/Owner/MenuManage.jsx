import React, { useState, useEffect } from "react";
import MenuForm from "../../components/owner/MenuForm";
import { formatPrice } from "../../utils/format";
import { MENU_CATEGORIES } from "../../constants/categories";
import { getMenus, addMenu, deleteMenu, updateMenu } from "../../utils/mockApi";

const MenuManage = () => {
  const [menus, setMenus] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [activeCategory, setActiveCategory] = useState("전체");

  const categoryTabs = ["전체", ...MENU_CATEGORIES];

  useEffect(() => {
    const loadedMenus = getMenus();
    setMenus(loadedMenus);
  }, []);

  // [추가] 카테고리 정렬 우선순위 정의
  const CATEGORY_ORDER = {
    메인: 1,
    사이드: 2,
    음료: 3,
    직원호출: 4,
  };

  // [수정] 필터링 및 카테고리 순서 정렬 로직
  const filteredMenus =
    activeCategory === "전체"
      ? [...menus].sort((a, b) => {
          // 1. 카테고리 순서대로 정렬 (메인 > 사이드 > 음료 > 직원호출)
          const orderA = CATEGORY_ORDER[a.category] || 99;
          const orderB = CATEGORY_ORDER[b.category] || 99;
          if (orderA !== orderB) return orderA - orderB;

          // 2. 같은 카테고리 내에서는 최신순(ID 역순) 정렬
          return b.id - a.id;
        })
      : menus.filter((menu) => menu.category === activeCategory);

  const getCategoryColor = (category) => {
    switch (category) {
      case "메인":
        return "bg-blue-100 text-blue-600";
      case "사이드":
        return "bg-orange-100 text-orange-600";
      case "음료":
        return "bg-green-100 text-green-600";
      case "직원호출":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const openModal = (menu = null) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleSave = (menuData) => {
    if (editingMenu) {
      updateMenu(menuData);
      setMenus(menus.map((m) => (m.id === menuData.id ? menuData : m)));
    } else {
      const newMenu = addMenu(menuData);
      setMenus([...menus, newMenu]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("정말 이 메뉴를 삭제하시겠습니까?")) {
      deleteMenu(id);
      setMenus(menus.filter((m) => m.id !== id));
    }
  };

  const toggleSoldOut = (id) => {
    const targetMenu = menus.find((m) => m.id === id);
    if (!targetMenu) return;
    const updatedMenu = { ...targetMenu, isSoldOut: !targetMenu.isSoldOut };
    updateMenu(updatedMenu);
    setMenus(menus.map((m) => (m.id === id ? updatedMenu : m)));
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

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {categoryTabs.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? "bg-toss-dark text-white shadow-md"
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
            등록된 메뉴가 없습니다.
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
                  <p className="text-toss-light text-sm">
                    {menu.category === "직원호출" ? (
                      <span className="text-toss-blue font-bold">호출</span>
                    ) : (
                      `${formatPrice(menu.price)}원`
                    )}
                  </p>
                  {menu.description && (
                    <p className="text-xs text-toss-light/70 mt-1 line-clamp-1 max-w-[300px]">
                      {menu.description}
                    </p>
                  )}
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
          defaultCategory={activeCategory === "전체" ? "메인" : activeCategory}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MenuManage;
