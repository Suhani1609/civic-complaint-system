import api from './axios';

export const createComplaint = async (formData) => {
  const { data } = await api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getComplaints = async (params = {}) => {
  const { data } = await api.get('/complaints', { params });
  return data;
};

export const getComplaintById = async (id) => {
  const { data } = await api.get(`/complaints/${id}`);
  return data;
};

export const updateStatus = async (id, payload) => {
  const { data } = await api.patch(`/complaints/${id}/status`, payload);
  return data;
};

export const assignComplaint = async (id, officerId) => {
  const { data } = await api.post(`/complaints/${id}/assign`, { officerId });
  return data;
};

export const reopenComplaint = async (id, remark) => {
  const { data } = await api.post(`/complaints/${id}/reopen`, { remark });
  return data;
};

export const submitFeedback = async (id, payload) => {
  const { data } = await api.post(`/complaints/${id}/feedback`, payload);
  return data;
};

export const deleteComplaint = async (id) => {
  const { data } = await api.delete(`/complaints/${id}`);
  return data;
};

export const uploadAfterImage = async (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post(`/complaints/${id}/after-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getWards = async () => {
  const { data } = await api.get('/wards');
  return data;
};