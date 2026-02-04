import axios from 'axios';
import config from '../config';

const API_URL = '/print';

const createRequest = async (userId, printType, copies, cost, documentFile, paymentFile) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('printType', printType);
    formData.append('copies', copies);
    formData.append('cost', cost);
    if (documentFile) {
        formData.append('document', documentFile);
    }
    if (paymentFile) {
        formData.append('payment', paymentFile);
    }

    const response = await axios.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const getAllRequests = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getRequestsByUser = async (userId) => {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
};

const updateStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/${id}/status`, null, {
        params: { status },
    });
    return response.data;
};

const getSettings = async () => {
    const response = await axios.get(`${API_URL}/settings`);
    return response.data;
};

const updateSettings = async (bwCost, colorCost) => {
    const params = new URLSearchParams();
    if (bwCost !== undefined) params.append('blackAndWhiteCost', bwCost);
    if (colorCost !== undefined) params.append('colorCost', colorCost);

    const response = await axios.put(`${API_URL}/settings`, null, { params });
    return response.data;
};

export default {
    createRequest,
    getAllRequests,
    getRequestsByUser,
    updateStatus,
    getSettings,
    updateSettings
};
