import api from './api';

export const mappingService = {
  async getAllUserMappings() {
    const response = await api.get('/mappings');
    return response.data;
  },

  async getDoctorsByPatient(patientId) {
    const response = await api.get(`/mappings/${patientId}`);
    return response.data;
  },

  async assignDoctor(patientId, doctorId) {
    const response = await api.post('/mappings', {
      patientId: parseInt(patientId, 10),
      doctorId: parseInt(doctorId, 10),
    });
    return response.data;
  },

  async removeMapping(id) {
    const response = await api.delete(`/mappings/${id}`);
    return response.data;
  },
};
