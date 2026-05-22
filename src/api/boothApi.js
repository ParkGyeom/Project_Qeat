import axios from './axios';

export const getMyBooths = async () => {
  const response = await axios.get('/api/booths/my');
  return response.data;
};

export const getMyApprovedBooths = async () => {
  const response = await axios.get('/api/booths/my/approved');
  return response.data;
};

export const getBoothDetail = async (id) => {
  const response = await axios.get(`/api/booths/${id}`);
  return response.data;
};

export const createBooth = async (boothData) => {
  // 백엔드의 실제 DTO 구조에 맞춰야 함. (name, bankName, accountNumber 등)
  const response = await axios.post('/api/booths', boothData);
  return response.data;
};

export const updateBooth = async (id, boothData) => {
  const response = await axios.put(`/api/booths/${id}`, boothData);
  return response.data;
};

export const deleteBooth = async (id) => {
  const response = await axios.delete(`/api/booths/${id}`);
  return response.data;
};

// 영업 상태(수동 오픈/마감) 변경
export const updateBoothOpenStatus = async (boothId, isOpen) => {
  const response = await axios.patch(`/api/booths/${boothId}/open-status`, {
    open: isOpen
  });
  return response.data;
};

// 영업 시간(자동) 설정
export const updateBoothOperatingTime = async (boothId, openTime, closeTime) => {
  const response = await axios.patch(`/api/booths/${boothId}/operating-time`, {
    openTime,
    closeTime
  });
  return response.data;
};

// 영업 시간(자동) 초기화
export const deleteBoothOperatingTime = async (boothId) => {
  const response = await axios.delete(`/api/booths/${boothId}/operating-time`);
  return response.data;
};

// 부스 승인 (총괄 관리자용)
export const approveBooth = async (boothId) => {
  const response = await axios.patch(`/api/booths/${boothId}/approve`);
  return response.data;
};

// 부스 거절 (총괄 관리자용)
export const rejectBooth = async (boothId) => {
  const response = await axios.patch(`/api/booths/${boothId}/reject`);
  return response.data;
};

// 부스 운영 중지 (총괄 관리자용)
export const suspendBooth = async (boothId) => {
  const response = await axios.patch(`/api/booths/${boothId}/suspend`);
  return response.data;
};

// 대기 중인 부스 조회 (총괄 관리자용)
export const getPendingBooths = async () => {
  const response = await axios.get('/api/booths/pending');
  return response.data;
};

// 승인 완료 부스를 1개 이상 가진 사용자(운영자) 조회 (총괄 관리자용)
export const getBoothOperators = async () => {
  const response = await axios.get('/api/booths/operators');
  return response.data;
};

// 특정 운영자의 상세 정보 및 보유 부스 목록 조회 (총괄 관리자용)
export const getOperatorDetail = async (operatorId) => {
  const response = await axios.get(`/api/booths/operators/${operatorId}`);
  return response.data;
};
