import api from '../api/axios';

/**
 * Admin Service
 * Admin-only API calls.
 */

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const updateAdminUser = async (id, data) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAdminSessions = async (params = {}) => {
  const response = await api.get('/admin/sessions', { params });
  return response.data;
};
