import axiosClient from './axiosClient';

export const getFarmDetails = async (id) => {
  const response = await axiosClient.get(`/api/farms/${id}`);
  return response.data;
};

export const getFarmSummary = async (id) => {
  const response = await axiosClient.get(`/api/farms/${id}/summary`);
  return response.data;
};
