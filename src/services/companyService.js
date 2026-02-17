import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const companyService = {
  // Company APIs
  createCompany: async (companyData) => {
    const response = await axios.post(`${API_URL}/company/companies`, companyData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getAllCompanies: async () => {
    const response = await axios.get(`${API_URL}/company/companies`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getCompaniesByTenant: async () => {
    const response = await axios.get(`${API_URL}/company/companies/tenant`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateCompany: async (id, companyData) => {
    const response = await axios.put(`${API_URL}/company/companies/${id}`, companyData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await axios.delete(`${API_URL}/company/companies/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Question APIs
  createQuestion: async (questionData) => {
    const response = await axios.post(`${API_URL}/company/questions`, questionData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getQuestionsByCompany: async (companyId) => {
    const response = await axios.get(`${API_URL}/company/questions/company/${companyId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getQuestionById: async (id) => {
    const response = await axios.get(`${API_URL}/company/questions/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateQuestion: async (id, questionData) => {
    const response = await axios.put(`${API_URL}/company/questions/${id}`, questionData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await axios.delete(`${API_URL}/company/questions/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};
