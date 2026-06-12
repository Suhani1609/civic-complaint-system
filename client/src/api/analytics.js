import api from './axios';

export const getOverview       = async () => (await api.get('/analytics/overview')).data;
export const getByCategory     = async () => (await api.get('/analytics/by-category')).data;
export const getByStatus       = async () => (await api.get('/analytics/by-status')).data;
export const getMonthly        = async () => (await api.get('/analytics/monthly')).data;
export const getWardPerformance= async () => (await api.get('/analytics/ward-performance')).data;