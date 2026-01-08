import React, { useState } from "react";
import OrderCard from "../../components/owner/OrderCard";

// 테스트용 접수 대기 데이터
const INITIAL_ACTIVE_ORDERS = [
  {
    id: 1,
    tableNo: 1,
    time: "18:30",
    totalPrice: 23000,
    items: [
      { name: "후라이드 치킨", count: 1, price: 18000 },
      { name: "콜라 500ml", count: 1, price: 2000 },
      { name: "공기밥", count: 3, price: 1000 },
    ],
  },
  {
    id: 2,
    tableNo: 3,
    time: "18:32",
    totalPrice: 4500,
    items: [{ name: "생맥주 500cc", count: 1, price: 4500 }],
  },
];

// 테스트용 이미 완료된 데이터
const INITIAL_COMPLETED_ORDERS = [
  {
    id: 99,
    tableNo: 7,
    time: "17:50",
    totalPrice: 12000,
    items: [
      { name: "감자튀김", count: 1, price: 7000 },
      { name: "치즈볼", count: 1, price: 5000 },
    ],
  },
];

const OrderManage = () => {
  // 상태 관리: 탭, 대기 목록, 완료 목록
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'completed'
  const [activeOrders, setActiveOrders] = useState(INITIAL_ACTIVE_ORDERS);
  const [completedOrders, setCompletedOrders] = useState(
    INITIAL_COMPLETED_ORDERS
  );

  // [핵심 로직] 주문 완료 처리 (삭제 X -> 이동 O)
  const handleComplete = (id) => {
    if (window.confirm("조리를 완료 처리하시겠습니까?")) {
      // 1. 해당 주문 찾기
      const targetOrder = activeOrders.find((order) => order.id === id);

      // 2. 대기 목록에서 제거
      setActiveOrders(activeOrders.filter((order) => order.id !== id));

      // 3. 완료 목록 맨 앞에 추가
      setCompletedOrders([targetOrder, ...completedOrders]);
    }
  };

  return (
    <div>
      {/* 상단 제목 & 탭 버튼 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-toss-dark">주문 관리</h2>

        {/* 탭 버튼 그룹 */}
        <div className="bg-gray-100 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "active"
                ? "bg-white text-toss-blue shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            대기 ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "completed"
                ? "bg-white text-toss-blue shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            완료 ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* 탭 내용 표시 영역 */}
      {activeTab === "active" ? (
        // [접수 대기 탭]
        activeOrders.length === 0 ? (
          <div className="h-[400px] flex flex-col justify-center items-center text-toss-light bg-white rounded-2xl border border-gray-100">
            <p className="text-xl">현재 대기 중인 주문이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onComplete={handleComplete}
                isCompleted={false}
              />
            ))}
          </div>
        )
      ) : // [처리 완료 탭]
      completedOrders.length === 0 ? (
        <div className="h-[400px] flex flex-col justify-center items-center text-toss-light bg-white rounded-2xl border border-gray-100">
          <p className="text-xl">완료된 주문 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onComplete={() => {}} // 완료된 건은 기능 없음
              isCompleted={true} // 회색 스타일 적용
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManage;
