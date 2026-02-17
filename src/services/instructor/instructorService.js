import api from '../api/apiClient';

export const instructorService = {
  getAllInstructors: async () => {
    const response = await api.get('/instructors');
    return response.data;
  },

  createInstructor: async (instructorData) => {
    const response = await api.post('/instructors', instructorData);
    return response.data;
  },

  updateInstructor: async (id, instructorData) => {
    const response = await api.put(`/instructors/${id}`, instructorData);
    return response.data;
  },

  deleteInstructor: async (id) => {
    const response = await api.delete(`/instructors/${id}`);
    return response.data;
  }
};