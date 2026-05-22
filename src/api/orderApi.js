import axios from './axios';
import defaultAxios from 'axios';

// 손님용: 주문 생성
export const createGuestOrder = async (tableToken, orderData) => {
  const response = await defaultAxios.post(`${import.meta.env.VITE_API_BASE_URL || ''}/api/public/tables/${tableToken}/orders`, orderData);
  return response.data;
};

const STATUS_MAP = {
  CHECK: "접수대기",
  COOKING: "조리중",
  DONE: "처리완료",
  CANCELED: "주문취소",
};

// 사장님용: 주문 목록 조회
export const getOrders = async (boothId) => {
  const response = await axios.get(`/api/booths/${boothId}/orders`);
  
  return (response.data || []).map((order) => ({
    id: order.orderId,
    tableNumber: order.tableNumber,
    status: STATUS_MAP[order.status] || order.status,
    totalAmount: order.totalPrice,
    orderTime: order.createdAt,
    doneAt: order.completedAt,
    items: (order.items || []).map(item => ({
      name: item.menuName,
      count: item.quantity,
      price: item.price
    })),
    menus: (order.items || []).map(item => ({
      name: item.menuName,
      count: item.quantity,
      price: item.price
    }))
  }));
};

// 사장님용: 주문 상태 변경 (접수대기 -> 조리중, 조리중 -> 처리완료)
export const updateOrderStatus = async (boothId, orderId, frontendStatus) => {
  let endpoint = "";
  if (frontendStatus === "조리중") {
    // 접수대기 -> 조리중 API
    endpoint = `/api/orders/${orderId}/booths/${boothId}/confirm`;
  } else if (frontendStatus === "처리완료") {
    // 조리중 -> 처리완료 API
    endpoint = `/api/orders/${orderId}/booths/${boothId}/complete`;
  } else {
    throw new Error(`알 수 없는 상태 변경 요청입니다: ${frontendStatus}`);
  }
  
  const response = await axios.patch(endpoint);
  return response.data;
};

// 사장님용: 주문 취소
export const cancelOrder = async (boothId, orderId) => {
  const response = await axios.patch(`/api/orders/${orderId}/booths/${boothId}/cancel`);
  return response.data;
};

// 사장님용: 매출 요약 조회 (DONE 상태만 포함)
export const getSalesSummary = async (boothId, startDate, endDate) => {
  const response = await axios.get(`/api/booths/${boothId}/sales-summary`, {
    params: { startDate, endDate }
  });
  return response.data;
};
