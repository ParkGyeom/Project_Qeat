import React, { useState, useEffect } from "react";
import OrderCard from "../../components/owner/OrderCard";
import { getOrders, updateOrderStatus, cancelOrder } from "../../api/orderApi";
import { getBoothInfo } from "../../utils/storeInfo";
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

  const currentBooth = getBoothInfo();

  // 주문 목록 로드
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentBooth?.boothId) return;
      try {
        const allOrders = await getOrders(currentBooth.boothId);
        const sortedOrders = [...(allOrders || [])].sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
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
  const handleCancel = async (id) => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder || !currentBooth?.boothId) return;

    if (!window.confirm("고객의 주문을 취소하시겠습니까?")) return;

    try {
      await cancelOrder(currentBooth.boothId, id);
      // 화면 즉시 반영
      setOrders(orders.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("주문 취소에 실패했습니다.");
    }
  };

  // ✅ 상태 단계별 업데이트: 접수대기 -> 조리중 -> 처리완료
  const handleStatusUpdate = async (id) => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder || !currentBooth?.boothId) return;

    let nextStatus = "";
    let confirmMsg = "";

    if (targetOrder.status === "접수대기") {
      nextStatus = "조리중";
      confirmMsg = "입금을 확인하셨나요? 조리중 상태로 변경합니다.";
    } else if (targetOrder.status === "조리중") {
      nextStatus = "처리완료";
      confirmMsg = "조리가 완료되었나요? 처리완료 상태로 이동합니다.";
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateOrderStatus(currentBooth.boothId, id, nextStatus);
      // 화면 즉시 반영
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === id) {
            const updated = { ...o, status: nextStatus };
            if (nextStatus === "조리중" && !o.confirmedAt) updated.confirmedAt = new Date().toISOString();
            if (nextStatus === "처리완료" && !o.doneAt) updated.doneAt = new Date().toISOString();
            return updated;
          }
          return o;
        })
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("주문 상태 변경에 실패했습니다.");
    }
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
