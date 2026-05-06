import axios from './axios';

export const getMenus = async (boothId) => {
  const response = await axios.get(`/api/booths/${boothId}/menus`);
  return response.data;
};

export const createMenu = async (boothId, formData) => {
  const response = await axios.post(`/api/booths/${boothId}/menus`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateMenu = async (boothId, menuId, formData) => {
  const response = await axios.patch(`/api/booths/${boothId}/menus/${menuId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteMenu = async (boothId, menuId) => {
  const response = await axios.delete(`/api/booths/${boothId}/menus/${menuId}`);
  return response.data;
};

export const toggleSoldOut = async (boothId, menuId) => {
  const response = await axios.patch(`/api/booths/${boothId}/menus/${menuId}/sold-out`);
  return response.data;
};
