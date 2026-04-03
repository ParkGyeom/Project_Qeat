import React, { useState, useEffect } from "react";
import OrderCard from "../../components/owner/OrderCard";
import { getOrders, updateOrder } from "../../utils/mockApi";

const getTimeLabel = (order, mode) => {
  // mode: "order" | "done"
  const parse = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const byId = parse(order?.id);
  const byOrderTime = parse(order?.orderTime) || byId;

  if (mode === "done") {
    const byDoneAt = parse(order?.doneAt);
    const d = byDoneAt || byOrderTime;
    return d
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "-";
  }

  // mode === "order"
  const d = byOrderTime;
  return d
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "-";
};

const OrderManage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [orders, setOrders] = useState([]);

  // 주문 목록 로드
  useEffect(() => {
    const fetchOrders = () => {
      const allOrders = getOrders() || [];
      const sortedOrders = [...allOrders].sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter(
    (o) => o.status === "접수대기" || o.status === "조리중"
  );
  const completedOrders = orders
    .filter((o) => o.status === "처리완료")
    .sort((a, b) => {
      const timeA = new Date(a.doneAt || a.orderTime || a.id).getTime();
      const timeB = new Date(b.doneAt || b.orderTime || b.id).getTime();
      return timeB - timeA; // 최신순 정렬
    });

  // ✅ 주문 취소 처리
  const handleCancel = (id) => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder) return;

    if (!window.confirm("고객의 주문을 취소하시겠습니까?")) return;

    // localStorage에서 완전히 삭제되도록 처리 (mockApi의 delete 로직 차용)
    const key = `qeat_orders_${targetOrder.storeName || "기본"}`; // 실제 환경에 맞게 key 생성될 수 있으나 mockApi updateOrder 대신 삭제 처리
    // 현재는 window 객체나 API를 통해 삭제 함수를 호출해야 하지만, mockApi에 별도 삭제 함수가 없으므로 state 제외 후 저장
    const updatedOrders = orders.filter((o) => o.id !== id);
    // 참고: mockApi 내부 구조상 로컬스토리지 키를 다시 구해야하지만, 여기서는 직접 저장소를 수정하거나 임시로 상태만 비웁니다.
    // 안전하게 상태에서만 완전히 제거 처리 (다음에 로드될땐 서버/스토리지 로직에 따름)
    
    // 이부분은 실제 백엔드 연동 전 임시 방편으로 localStorage도 같이 비워줍니다. (mockApi.js 참고)
    try {
       const orderKey = `qeat_orders_${localStorage.getItem("qeat_booth_detail_v1") ? JSON.parse(localStorage.getItem("qeat_booth_detail_v1")).name : ""}`;
       if (orderKey.length > 13) {
           localStorage.setItem(orderKey, JSON.stringify(updatedOrders));
       }
    } catch(e) {}

    // 화면 즉시 반영 (아예 삭제)
    setOrders(updatedOrders);
  };

  // ✅ 상태 단계별 업데이트: 접수대기 -> 조리중 -> 처리완료
  const handleStatusUpdate = (id) => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder) return;

    let nextStatus = "";
    let confirmMsg = "";
    const updated = { ...targetOrder };

    if (targetOrder.status === "접수대기") {
      nextStatus = "조리중";
      confirmMsg = "입금을 확인하셨나요? 조리중 상태로 변경합니다.";
      // ✅ 입금 확인 시점(조리 시작 시점) 기록
      updated.confirmedAt = new Date().toISOString();
    } else if (targetOrder.status === "조리중") {
      nextStatus = "처리완료";
      confirmMsg = "조리가 완료되었나요? 처리완료 상태로 이동합니다.";
    }

    if (!window.confirm(confirmMsg)) return;

    updated.status = nextStatus;

    const saved = updateOrder(updated);

    // 화면 즉시 반영
    setOrders((prev) => prev.map((o) => (o.id === id ? saved : o)));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-toss-dark flex items-center gap-2">
          주문 관리 <span className="text-lg">🔔</span>
        </h2>

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

      {activeTab === "active" ? (
        activeOrders.length === 0 ? (
          <div className="h-[400px] flex flex-col justify-center items-center text-toss-light bg-white rounded-2xl border border-gray-100">
            <p className="text-xl">현재 대기 중인 주문이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  ...order,
                  tableNo: order.tableNumber,
                  time: getTimeLabel(order, "order"), // ✅ 주문시간 표시
                  totalPrice: order.totalAmount,
                }}
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancel}
                isCompleted={false}
              />
            ))}
          </div>
        )
      ) : completedOrders.length === 0 ? (
        <div className="h-[400px] flex flex-col justify-center items-center text-toss-light bg-white rounded-2xl border border-gray-100">
          <p className="text-xl">완료된 주문 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={{
                ...order,
                tableNo: order.tableNumber,
                time: getTimeLabel(order, "done"), // ✅ 완료시간(doneAt) 우선 표시
                totalPrice: order.totalAmount,
              }}
              onComplete={() => {}}
              isCompleted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManage;
