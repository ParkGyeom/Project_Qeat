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

  const activeOrders = orders.filter((o) => o.status === "접수대기");
  const completedOrders = orders.filter((o) => o.status === "처리완료");

  // ✅ 조리 완료 처리: status만 바꾸고 doneAt은 mockApi(updateOrder)가 자동 기록
  const handleComplete = (id) => {
    if (!window.confirm("조리를 완료 처리하시겠습니까?")) return;

    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder) return;

    const updated = {
      ...targetOrder,
      status: "처리완료",
      // doneAt은 여기서 굳이 안 넣음 (updateOrder가 자동 처리)
    };

    const saved = updateOrder(updated); // ✅ updateOrder가 doneAt까지 확정해서 리턴

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
                onComplete={handleComplete}
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
