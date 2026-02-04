import axios from 'axios';
import config from '../config';

const API_URL = 'http://localhost:8082/attendance';

const scanQr = async (userId, qrContent) => {
    const response = await axios.post(`${API_URL}/scan`, null, {
        params: { userId, qrContent }
    });
    return response.data;
};

const getCurrentSession = async (userId) => {
    const response = await axios.get(`${API_URL}/current`, {
        params: { userId }
    });
    return response.data;
};
const getSummary = async (userId) => {
    const response = await axios.get(`${API_URL}/summary`, {
        params: { userId }
    });
    return response.data;
};

export default {
    scanQr,
    getCurrentSession,
    getSummary
};
