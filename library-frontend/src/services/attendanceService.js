import api from './api';

const API_URL = '/attendance';

const scanQr = async (userId, qrContent) => {
    const response = await api.post(`${API_URL}/scan`, null, {
        params: { userId, qrContent }
    });
    return response.data;
};

const getCurrentSession = async (userId) => {
    const response = await api.get(`${API_URL}/current`, {
        params: { userId }
    });
    return response.data;
};
const getSummary = async (userId) => {
    const response = await api.get(`${API_URL}/summary`, {
        params: { userId }
    });
    return response.data;
};

export default {
    scanQr,
    getCurrentSession,
    getSummary
};
