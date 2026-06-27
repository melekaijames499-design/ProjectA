import axiosClient from './axiosClient';

export const login = async (email, password) => {
  const response = await axiosClient.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await axiosClient.post('/api/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosClient.post('/api/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await axiosClient.get('/api/auth/me');
  return response.data;
};

export const updateMe = async (profileData) => {
  const response = await axiosClient.put('/api/auth/me', profileData);
  return response.data;
};
