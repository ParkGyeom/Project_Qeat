import axios from './axios';

// 손님용: 주문 생성
export const createGuestOrder = async (tableToken, orderData) => {
  const response = await axios.post(`/api/public/tables/${tableToken}/orders`, orderData);
  return response.data;
};

// 사장님용: 주문 목록 조회 (보류)
// export const getOrders = async (boothId) => {
//   ...
// };
