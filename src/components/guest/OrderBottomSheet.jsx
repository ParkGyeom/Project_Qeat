import React from "react";
import useCartStore from "../../store/cartStore";
import { formatPrice } from "../../utils/format";

const OrderBottomSheet = ({ isOpen, onClose }) => {
  const { cart } = useCartStore();
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.count,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl p-6 shadow-2xl animate-slide-up">
        <h2 className="text-xl font-bold text-toss-dark mb-6">
          주문 내역 확인
        </h2>

        <div className="max-h-[30vh] overflow-y-auto mb-6 space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center text-toss-dark"
            >
              <span>
                {item.name}{" "}
                <span className="text-toss-blue font-bold">x{item.count}</span>
              </span>
              <span>{formatPrice(item.price * item.count)}원</span>
            </div>
          ))}
        </div>

        <div className="h-[1px] bg-toss-grey w-full mb-4"></div>

        <div className="flex justify-between items-center mb-8">
          <span className="text-lg font-bold text-toss-light">총 결제금액</span>
          <span className="text-2xl font-bold text-toss-blue">
            {formatPrice(totalPrice)}원
          </span>
        </div>

        <div className="bg-toss-grey p-4 rounded-xl mb-4">
          <p className="text-sm text-toss-light mb-1">입금 계좌 (토스뱅크)</p>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-toss-dark text-lg">
              3333-XX-XXXXXX
            </span>
            <button
              onClick={() => alert("복사됨")}
              className="text-xs bg-white border border-gray-300 px-2 py-1 rounded text-toss-dark"
            >
              복사
            </button>
          </div>
          <p className="text-xs text-toss-red font-bold">
            ※ 입금자명을 반드시 '테이블 번호(1번)'로 해주세요!
          </p>
        </div>

        <button className="w-full bg-toss-blue text-white py-4 rounded-xl font-bold text-lg">
          입금 완료 및 주문하기
        </button>
      </div>
    </div>
  );
};

export default OrderBottomSheet;
