import axios from './axios';

export const getMyBooths = async () => {
  const response = await axios.get('/api/booths/my');
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
