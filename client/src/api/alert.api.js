import axiosClient from './axiosClient';

export const getAlerts = async (farmId, filters = {}) => {
  const { isResolved = 'all', severity = 'all' } = filters;
  const response = await axiosClient.get(`/api/alerts?farmId=${farmId}&isResolved=${isResolved}&severity=${severity}`);
  return response.data;
};

export const resolveAlert = async (alertId) => {
  const response = await axiosClient.put(`/api/alerts/${alertId}/resolve`);
  return response.data;
};

export const testAlert = async (testData) => {
  const response = await axiosClient.post('/api/alerts/test', testData);
  return response.data;
};
