import api from '../api/apiClient';

export const tenantService = {
  getAllTenants: async () => {
    const response = await api.get('/tenants');
    return response.data;
  },

  getInstructorTenants: async () => {
    const response = await api.get('/tenants/my-tenants');
    return response.data;
  },

  createTenant: async (tenantData) => {
    const response = await api.post('/tenants', tenantData);
    return response.data;
  },

  updateTenant: async (id, tenantData) => {
    const response = await api.put(`/tenants/${id}`, tenantData);
    return response.data;
  },

  deleteTenant: async (id) => {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
  }
};