import axiosClient from './axiosClient';

export const submitReading = async (readingData) => {
  const response = await axiosClient.post('/api/sensors/readings', readingData);
  return response.data;
};

export const getReadings = async (farmId, filters = {}) => {
  const { from = '', to = '', limit = 100 } = filters;
  const response = await axiosClient.get(`/api/sensors/readings?farmId=${farmId}&from=${from}&to=${to}&limit=${limit}`);
  return response.data;
};

export const getLatestReading = async (farmId) => {
  const response = await axiosClient.get(`/api/sensors/readings/latest?farmId=${farmId}`);
  return response.data;
};

export const getReadingStats = async (farmId, from = '', to = '') => {
  const response = await axiosClient.get(`/api/sensors/readings/stats?farmId=${farmId}&from=${from}&to=${to}`);
  return response.data;
};
