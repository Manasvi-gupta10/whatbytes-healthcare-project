import api from './api';

export const patientService = {
  async getAllPatients() {
    const response = await api.get('/patients');
    return response.data;
  },

  async getPatientById(id) {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  async createPatient(patientData) {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  async updatePatient(id, patientData) {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  async deletePatient(id) {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};
