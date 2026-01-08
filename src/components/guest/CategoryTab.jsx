import React from "react";

const CategoryTab = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="sticky top-[70px] z-10 bg-white border-b border-toss-grey/50">
      <div className="flex overflow-x-auto no-scrollbar px-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`mr-6 py-3 whitespace-nowrap text-[15px] transition-colors ${
              activeCategory === category
                ? "font-bold text-toss-dark border-b-2 border-toss-dark"
                : "text-toss-light font-medium"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTab;
