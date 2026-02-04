import axios from 'axios';
import config from '../config';

const API_URL = 'http://localhost:8082/maintenance';

const createRequest = async (userId, userName, userEmail, userPhone, type, description, imageFile) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('userName', userName || '');
    formData.append('userEmail', userEmail || '');
    formData.append('userPhone', userPhone || '');
    formData.append('type', type);
    formData.append('description', description);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await axios.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const getRequestsByUser = async (userId) => {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
};

const getAllRequests = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const updateStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/${id}/status`, null, {
        params: { status },
    });
    return response.data;
};

export default {
    createRequest,
    getRequestsByUser,
    getAllRequests,
    updateStatus,
};
