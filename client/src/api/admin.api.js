import axiosClient from './axiosClient';

// User Management APIs
export const getUsers = async (page = 1, limit = 10, role = 'all') => {
  const response = await axiosClient.get(`/api/admin/users?page=${page}&limit=${limit}&role=${role}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosClient.post('/api/admin/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axiosClient.put(`/api/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/api/admin/users/${id}`);
  return response.data;
};

// Farm Management APIs
export const getFarms = async () => {
  const response = await axiosClient.get('/api/admin/farms');
  return response.data;
};

export const createFarm = async (farmData) => {
  const response = await axiosClient.post('/api/admin/farms', farmData);
  return response.data;
};

export const updateFarm = async (id, farmData) => {
  const response = await axiosClient.put(`/api/admin/farms/${id}`, farmData);
  return response.data;
};

export const deleteFarm = async (id) => {
  const response = await axiosClient.delete(`/api/admin/farms/${id}`);
  return response.data;
};

// Global Analytics & Alerts
export const getAnalytics = async () => {
  const response = await axiosClient.get('/api/admin/analytics');
  return response.data;
};

export const getAllAlerts = async (filters = {}) => {
  const { farmId = 'all', isResolved = 'all', severity = 'all' } = filters;
  const response = await axiosClient.get(`/api/admin/alerts?farmId=${farmId}&isResolved=${isResolved}&severity=${severity}`);
  return response.data;
};
