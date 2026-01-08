import React from "react";
import useCartStore from "../../store/cartStore";
import { formatPrice } from "../../utils/format";

const CartFloatingBar = ({ onClick }) => {
  const { cart } = useCartStore();
  const totalCount = cart.reduce((acc, item) => acc + item.count, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.count,
    0
  );

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-0 w-full max-w-[480px] p-5 pb-8 bg-gradient-to-t from-white via-white to-transparent z-30">
      <div className="text-xs text-toss-dark mb-2 px-1 truncate opacity-80">
        {cart.map((item) => `${item.name}×${item.count}`).join("  |  ")}
      </div>
      <button
        onClick={onClick}
        className="w-full bg-toss-blue text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex justify-between px-6 items-center"
      >
        <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
          {totalCount}개
        </span>
        <span>{formatPrice(totalPrice)}원 결제하기</span>
      </button>
    </div>
  );
};

export default CartFloatingBar;
