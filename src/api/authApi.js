import axios from './axios';

export const loginApi = async (userId, password) => {
  const response = await axios.post('/api/auth/login', {
    userId,
    password
  });
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get('/api/auth/me');
  return response.data;
};

export const logoutApi = async () => {
  const response = await axios.post('/api/auth/logout');
  return response.data;
};
