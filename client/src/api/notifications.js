import api from './axios';

export const getNotifications  = async () =>
  (await api.get('/notifications')).data;

export const getUnreadCount    = async () =>
  (await api.get('/notifications/unread-count')).data;

export const markAsRead        = async (id) =>
  (await api.patch(`/notifications/${id}/read`)).data;

export const markAllRead       = async () =>
  (await api.patch('/notifications/read-all')).data;

export const deleteNotification = async (id) =>
  (await api.delete(`/notifications/${id}`)).data;