import React from "react";
import useCartStore from "../../store/cartStore";
import { formatPrice } from "../../utils/format";

const MenuCard = ({ menu }) => {
  const { cart, addToCart, removeFromCart } = useCartStore();
  const itemInCart = cart.find((item) => item.id === menu.id);
  const count = itemInCart ? itemInCart.count : 0;

  return (
    <div className="bg-white rounded-2xl p-4 mb-3 flex items-center gap-4 shadow-sm">
      {/* 1. [New] 이미지 공간 (100x100 크기 고정) */}
      <div className="w-[100px] h-[100px] bg-gray-200 rounded-xl flex-none overflow-hidden relative">
        {/* 나중에 이미지가 있으면 보여주고, 없으면 회색 박스 유지 */}
        {menu.image ? (
          <img
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex justify-center items-center text-gray-400 text-xs">
            이미지
          </div>
        )}
      </div>

      {/* 2. 메뉴 정보 (가운데) */}
      <div className="flex-1">
        <h3 className="text-[17px] font-bold text-toss-dark leading-tight mb-1">
          {menu.name}
        </h3>
        <p className="text-sm text-toss-light font-medium">
          {formatPrice(menu.price)}원
        </p>
        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
          {/* 설명이 있다면 여기에 표시 (나중에 추가 가능) */}
          바삭하고 맛있는 {menu.name}
        </p>
      </div>

      {/* 3. 버튼 영역 (오른쪽 끝) */}
      <div className="flex-none">
        {count === 0 ? (
          <button
            onClick={() => addToCart(menu)}
            className="bg-toss-lightBlue text-toss-blue px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition whitespace-nowrap"
          >
            담기
          </button>
        ) : (
          <div className="flex flex-col items-center bg-toss-grey rounded-lg w-[80px]">
            {/* 수량 조절 디자인 변경: 세로형 or 가로형 중 선택 가능하지만, 공간상 가로 유지 */}
            <div className="flex justify-between items-center w-full px-2 py-1">
              <button
                onClick={() => removeFromCart(menu.id)}
                className="w-6 h-6 flex justify-center items-center text-toss-light text-xl leading-none pb-1"
              >
                −
              </button>
              <span className="text-toss-dark font-bold text-sm">{count}</span>
              <button
                onClick={() => addToCart(menu)}
                className="w-6 h-6 flex justify-center items-center text-toss-blue text-xl leading-none pb-1"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
