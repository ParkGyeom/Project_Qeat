import axios from './axios';

// 테이블 목록 조회
export const getTables = async (boothId) => {
  const response = await axios.get(`/api/booths/${boothId}/tables`);
  return response.data;
};

// 테이블 추가 (단건 - 특정 번호 직접 지정)
export const createTable = async (boothId, tableNumber) => {
  const response = await axios.post(`/api/booths/${boothId}/tables`, {
    tableNumber,
  });
  return response.data;
};

// 테이블 일괄 추가 (비활성 테이블 재활성화 우선 → 부족분 신규 생성)
export const bulkCreateTables = async (boothId, count) => {
  const response = await axios.post(`/api/booths/${boothId}/tables/bulk`, {
    count,
  });
  return response.data;
};

// 테이블 비활성화
export const deactivateTable = async (boothId, tableId) => {
  const response = await axios.patch(`/api/booths/${boothId}/tables/${tableId}/deactivate`);
  return response.data;
};

// 테이블 활성화 (비활성화된 테이블 재활성화, 기존 QR token 유지)
export const activateTable = async (boothId, tableId) => {
  const response = await axios.patch(`/api/booths/${boothId}/tables/${tableId}/activate`);
  return response.data;
};

// 손님용: 토큰으로 테이블 및 메뉴 정보 조회
export const getPublicTableInfo = async (tableToken) => {
  const response = await axios.get(`/api/public/tables/${tableToken}`);
  return response.data;
};
