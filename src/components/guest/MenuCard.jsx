import React from "react";
import useCartStore from "../../store/cartStore";
import { formatPrice } from "../../utils/format";

const MenuCard = ({ menu, isClosed = false, isClosingSoon = false }) => {
  const { cart, addToCart, removeFromCart } = useCartStore();
  const itemInCart = cart.find((item) => item.id === menu.id);
  const count = itemInCart ? itemInCart.count : 0;

  const isStaffCall = menu.category === "직원호출";

  // ✅ 영업 종료면 무조건 disable, 아니면 품절만 disable
  const isDisabled = isClosed || menu.isSoldOut;

  return (
    <div className="relative">
      {/* ✅ 영업 종료 오버레이 (영업 종료일 때만) */}
      {isClosed && (
        <div className="absolute inset-0 z-20 rounded-2xl bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-sm font-bold text-gray-800">영업 종료</p>
          <p className="text-xs text-gray-500 mt-1">
            주문은 영업재개 후에 다시 가능합니다
          </p>
        </div>
      )}

      <div
        className={`bg-white rounded-2xl p-4 mb-3 flex items-center gap-4 shadow-sm transition-all relative ${
          isDisabled ? "opacity-70 pointer-events-none" : ""
        }`}
      >
        {/* 1) 이미지 영역 */}
        <div className="w-[100px] h-[100px] bg-gray-200 rounded-xl flex-none overflow-hidden relative">
          {menu.image ? (
            <img
              src={menu.image}
              alt={menu.name}
              className={`w-full h-full object-cover ${
                isDisabled ? "brightness-[0.7] grayscale-[0.4]" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center text-gray-400 text-xs">
              이미지
            </div>
          )}

          {/* ✅ 마감 임박 배지 (영업 종료가 아닐 때만 보여줌) */}
          {!isClosed && isClosingSoon && !menu.isSoldOut && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-50 text-yellow-900 border border-yellow-100 text-[10px] font-extrabold px-2 py-1 rounded shadow-sm">
                마감 임박
              </span>
            </div>
          )}

          {/* SOLD OUT */}
          {menu.isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10">
              <span className="bg-red-50/90 text-red-800/70 border border-red-100 text-[10px] font-extrabold px-2 py-1 rounded shadow-sm backdrop-blur-[1px]">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* 2) 메뉴 정보 */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`text-[17px] font-bold leading-tight ${
                isDisabled ? "text-gray-500" : "text-toss-dark"
              }`}
            >
              {menu.name}
            </h3>

            {menu.isSoldOut && (
              <span className="text-red-800/40 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100/50">
                품절
              </span>
            )}
          </div>

          {!isStaffCall ? (
            <p
              className={`text-sm font-medium ${
                isDisabled ? "text-gray-400" : "text-toss-light"
              }`}
            >
              {formatPrice(menu.price)}원
            </p>
          ) : (
            <p
              className={`text-sm font-bold ${
                isDisabled ? "text-gray-400" : "text-toss-blue"
              }`}
            >
              서비스
            </p>
          )}

          {/* ✅ 마감 임박 안내 문구 (영업 종료가 아닐 때만) */}
          {!isClosed && isClosingSoon && (
            <p className="mt-1 text-[11px] font-semibold text-yellow-800/80">
              곧 영업이 종료됩니다. 서둘러 주문해주세요.
            </p>
          )}
        </div>

        {/* 3) 버튼 영역 */}
        <div className="flex-none">
          {isClosed || menu.isSoldOut ? (
            <div className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-2 rounded-lg font-bold text-xs cursor-not-allowed whitespace-nowrap shadow-sm">
              주문 불가
            </div>
          ) : count === 0 ? (
            <button
              onClick={() => addToCart(menu)}
              className="bg-toss-lightBlue text-toss-blue px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition whitespace-nowrap"
            >
              담기
            </button>
          ) : (
            <div className="flex flex-col items-center bg-toss-grey rounded-lg w-[80px]">
              <div className="flex justify-between items-center w-full px-2 py-1">
                <button
                  onClick={() => removeFromCart(menu.id)}
                  className="w-6 h-6 flex justify-center items-center text-toss-light text-xl"
                >
                  −
                </button>
                <span className="text-toss-dark font-bold text-sm">
                  {count}
                </span>
                <button
                  onClick={() => addToCart(menu)}
                  className="w-6 h-6 flex justify-center items-center text-toss-blue text-xl"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
