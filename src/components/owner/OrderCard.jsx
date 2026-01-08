import React from "react";
import { formatPrice } from "../../utils/format";

const OrderCard = ({ order, onComplete, isCompleted }) => {
  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between h-full transition-shadow ${
        isCompleted
          ? "border-gray-100 opacity-70"
          : "border-toss-blue/20 hover:shadow-md"
      }`}
    >
      <div>
        {/* 상단: 테이블 번호 & 시간 */}
        <div className="flex justify-between items-start mb-4">
          <h3
            className={`text-xl font-bold ${
              isCompleted ? "text-gray-500" : "text-toss-blue"
            }`}
          >
            {order.tableNo}번 테이블
          </h3>
          <span className="text-xs text-toss-light bg-toss-grey px-2 py-1 rounded">
            {order.time}
          </span>
        </div>

        {/* 주문 메뉴 리스트 (사진 없이 텍스트만 유지) */}
        <ul className="space-y-2 mb-6">
          {order.items.map((item, index) => (
            <li
              key={index}
              className="flex justify-between text-toss-dark text-[15px]"
            >
              <span className="font-medium">
                {item.name}{" "}
                <span className="text-toss-blue font-bold">x{item.count}</span>
              </span>
              <span className="text-toss-light text-sm">
                {formatPrice(item.price * item.count)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 하단: 총 금액 & 버튼 영역 */}
      <div>
        <div className="flex justify-between items-center border-t border-gray-100 pt-4 mb-4">
          <span className="text-toss-light font-medium">총 결제금액</span>
          <span className="text-xl font-bold text-toss-dark">
            {formatPrice(order.totalPrice)}원
          </span>
        </div>

        {/* [수정 포인트] 완료 여부에 따라 버튼 다르게 표시 */}
        {isCompleted ? (
          <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold text-center cursor-default">
            처리 완료됨
          </div>
        ) : (
          <button
            onClick={() => onComplete(order.id)}
            className="w-full bg-toss-blue text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg shadow-blue-200"
          >
            조리 완료
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
