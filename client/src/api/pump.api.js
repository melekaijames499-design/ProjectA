import axiosClient from './axiosClient';

export const controlPump = async (controlData) => {
  const response = await axiosClient.post('/api/pump/control', controlData);
  return response.data;
};

export const getPumpLogs = async (farmId, filters = {}) => {
  const { from = '', to = '', limit = 20 } = filters;
  const response = await axiosClient.get(`/api/pump/logs?farmId=${farmId}&from=${from}&to=${to}&limit=${limit}`);
  return response.data;
};

export const getPumpStatus = async (farmId) => {
  const response = await axiosClient.get(`/api/pump/status?farmId=${farmId}`);
  return response.data;
};
