import axiosClient from './axiosClient';

export const getSchedules = async (farmId) => {
  const response = await axiosClient.get(`/api/schedules?farmId=${farmId}`);
  return response.data;
};

export const createSchedule = async (scheduleData) => {
  const response = await axiosClient.post('/api/schedules', scheduleData);
  return response.data;
};

export const updateSchedule = async (id, scheduleData) => {
  const response = await axiosClient.put(`/api/schedules/${id}`, scheduleData);
  return response.data;
};

export const deleteSchedule = async (id) => {
  const response = await axiosClient.delete(`/api/schedules/${id}`);
  return response.data;
};

export const toggleSchedule = async (id) => {
  const response = await axiosClient.patch(`/api/schedules/${id}/toggle`);
  return response.data;
};
