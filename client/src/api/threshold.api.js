import axiosClient from './axiosClient';

export const getThresholds = async (farmId) => {
  const response = await axiosClient.get(`/api/thresholds?farmId=${farmId}`);
  return response.data;
};

export const upsertThresholds = async (thresholdData) => {
  const response = await axiosClient.put('/api/thresholds', thresholdData);
  return response.data;
};
