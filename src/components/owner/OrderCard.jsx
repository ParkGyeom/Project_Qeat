import React from "react";
import { formatPrice } from "../../utils/format";

const OrderCard = ({ order, onStatusUpdate, onCancel, isCompleted }) => {
  const [now, setNow] = React.useState(new Date());

  // ✅ 실시간 경과 시간 업데이트를 위한 타이머 (1분마다)
  React.useEffect(() => {
    if (order.status === "조리중" && !isCompleted) {
      const interval = setInterval(() => {
        setNow(new Date());
      }, 30000); // 30초마다 갱신
      return () => clearInterval(interval);
    }
  }, [order.status, isCompleted]);

  const getStatusInfo = () => {
    if (isCompleted) return { text: "처리 완료됨", color: "bg-gray-100 text-gray-400" };
    
    switch (order.status) {
      case "접수대기":
        return { 
          buttonText: "입금 확인", 
          buttonColor: "bg-toss-blue hover:bg-blue-600 shadow-blue-200",
          badgeText: "입금 확인 전",
          badgeColor: "bg-orange-50 text-orange-600 border-orange-100"
        };
      case "조리중":
        return { 
          buttonText: "조리 완료", 
          buttonColor: "bg-green-500 hover:bg-green-600 shadow-green-200",
          badgeText: "조리 중",
          badgeColor: "bg-blue-50 text-toss-blue border-blue-100"
        };
      default:
        return { buttonText: "확인", buttonColor: "bg-toss-blue" };
    }
  };

  const statusInfo = getStatusInfo();

  // ✅ 경과 시간 계산 및 텍스트 반환
  const getElapsedDisplay = () => {
    if (order.status !== "조리중" || !order.confirmedAt) return null;
    const start = new Date(order.confirmedAt);
    const seconds = Math.floor((now - start) / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return "방금 전";
    return `${minutes}분 경과`;
  };

  const elapsedDisplay = getElapsedDisplay();
  const minutesElapsed = order.confirmedAt ? Math.floor((now - new Date(order.confirmedAt)) / 60000) : 0;

  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between h-full transition-shadow ${
        isCompleted
          ? "border-gray-100 opacity-70"
          : "border-toss-blue/20 hover:shadow-md"
      }`}
    >
      <div>
        {/* 상단: 테이블 번호 & 시간 & 상태 배지 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3
              className={`text-xl font-bold ${
                isCompleted ? "text-gray-500" : "text-toss-blue"
              }`}
            >
              {order.tableNo}번 테이블
            </h3>
            {!isCompleted && (
              <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.badgeColor}`}>
                {statusInfo.badgeText}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-toss-light bg-toss-grey px-2 py-1 rounded">
              {order.time}
            </span>
            {elapsedDisplay && !isCompleted && (
              <span className={`text-[11px] font-bold mt-1 ${
                minutesElapsed >= 10 
                  ? "text-red-500 animate-pulse" 
                  : "text-green-500"
              }`}>
                {elapsedDisplay}
              </span>
            )}
          </div>
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
            {order.status === "주문취소" ? "주문 취소됨" : "처리 완료됨"}
          </div>
        ) : order.status === "접수대기" ? (
          <div className="flex gap-2">
            <button
              onClick={() => onCancel && onCancel(order.id)}
              className="w-1/2 bg-red-50 text-red-500 hover:bg-red-100 py-3 rounded-xl font-bold text-lg transition"
            >
              주문 취소
            </button>
            <button
              onClick={() => onStatusUpdate(order.id)}
              className={`w-1/2 text-white py-3 rounded-xl font-bold text-lg transition shadow-lg ${statusInfo.buttonColor}`}
            >
              {statusInfo.buttonText}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onStatusUpdate(order.id)}
            className={`w-full text-white py-3 rounded-xl font-bold text-lg transition shadow-lg ${statusInfo.buttonColor}`}
          >
            {statusInfo.buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
