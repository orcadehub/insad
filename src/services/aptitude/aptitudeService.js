import api from '../api/apiClient';

export const aptitudeService = {
  getAllQuestions: async () => {
    const response = await api.get('/aptitude-questions');
    return response.data;
  },

  createQuestion: async (questionData) => {
    const response = await api.post('/aptitude-questions', questionData);
    return response.data;
  },

  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/aptitude-questions/${id}`, questionData);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`/aptitude-questions/${id}`);
    return response.data;
  },

  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/aptitude-questions/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
