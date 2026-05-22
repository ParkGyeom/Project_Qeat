import React, { useState } from "react";
import useCartStore from "../../store/cartStore";
import { formatPrice } from "../../utils/format";

const MenuCard = ({ menu, isClosed = false, isClosingSoon = false }) => {
  const { cart, addToCart, removeFromCart } = useCartStore();
  const itemInCart = cart.find((item) => item.id === menu.id);
  const count = itemInCart ? itemInCart.count : 0;

  const isStaffCall = menu.category === "직원호출";

  // ✅ 영업 종료면 무조건 disable, 아니면 품절만 disable
  const isDisabled = isClosed || menu.isSoldOut;

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
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
        onClick={() => {
          if (!isDisabled) setIsModalOpen(true);
        }}
        className={`bg-white rounded-2xl p-4 mb-3 flex items-center gap-4 shadow-sm transition-all relative ${
          isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:shadow-md"
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

          {menu.description && (
            <p className="text-[12px] text-toss-light/80 mb-2 line-clamp-2 break-all leading-relaxed transition-colors group-hover:text-toss-light">
              {menu.description}
            </p>
          )}

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
                isDisabled ? "text-gray-400" : "text-toss-light"
              }`}
            >
              비결제 항목
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
              onClick={(e) => {
                e.stopPropagation();
                addToCart(menu);
              }}
              className="bg-toss-lightBlue text-toss-blue px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition whitespace-nowrap"
            >
              담기
            </button>
          ) : (
            <div className="flex flex-col items-center bg-toss-grey rounded-lg w-[80px]">
              <div className="flex justify-between items-center w-full px-2 py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(menu.id);
                  }}
                  className="w-6 h-6 flex justify-center items-center text-toss-light text-xl"
                >
                  −
                </button>
                <span className="text-toss-dark font-bold text-sm">
                  {count}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(menu);
                  }}
                  className="w-6 h-6 flex justify-center items-center text-toss-blue text-xl"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ 상세 모달 (팝업창) */}
      {isModalOpen && !isDisabled && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)} // 바깥 영역 누르면 닫힘
        >
          <div 
            className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden flex flex-col relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()} // 모달 내부 누를 때는 닫히지 않음
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full z-10 transition-colors"
            >
              ✕
            </button>
            
            {/* 큰 이미지 */}
            <div className="w-full h-56 bg-white flex-none relative p-4 pb-2">
              <div className="w-full h-full rounded-[16px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative">
                {menu.image ? (
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    이미지가 없습니다
                  </div>
                )}
              </div>
            </div>

            {/* 정보 */}
            <div className="p-5 flex-1 overflow-y-auto max-h-[40vh]">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {menu.name}
              </h2>
              {!isStaffCall && (
                <p className="text-xl font-bold text-toss-blue mb-4">
                  {formatPrice(menu.price)}원
                </p>
              )}
              {menu.description ? (
                <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap break-words break-all mb-2">
                  {menu.description}
                </p>
              ) : (
                <p className="text-[15px] text-gray-400 italic mb-2">
                  설명이 없습니다.
                </p>
              )}
            </div>

            {/* 담기 버튼 영역 (팝업용) */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50">
              {count === 0 ? (
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    addToCart(menu); 
                  }}
                  className="w-full py-3.5 bg-toss-blue text-white font-bold rounded-xl text-[16px] hover:bg-blue-600 transition shadow-sm"
                >
                  {isStaffCall ? "호출 담기" : "장바구니에 담기"}
                </button>
              ) : (
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      removeFromCart(menu.id); 
                    }}
                    className="w-14 h-12 flex justify-center items-center text-gray-400 hover:text-gray-600 text-2xl bg-gray-50 rounded-lg"
                  >
                    −
                  </button>
                  <span className="font-bold text-[18px] text-gray-800">
                    {count}개 담김
                  </span>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      addToCart(menu); 
                    }}
                    className="w-14 h-12 flex justify-center items-center text-toss-blue hover:text-blue-600 text-2xl bg-blue-50 rounded-lg"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuCard;
