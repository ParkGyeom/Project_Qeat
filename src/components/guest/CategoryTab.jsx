import React from "react";
// 상수는 MenuPage에서 넘겨받으므로 import 안 해도 됨 (이미 넘겨주고 있음)

const CategoryTab = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto p-4 no-scrollbar bg-white border-b sticky top-0 z-10">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)} // 여기서 onSelect를 실행해야 함
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
            activeCategory === cat
              ? "bg-toss-blue text-white shadow-md"
              : "bg-gray-100 text-toss-light"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryTab;
