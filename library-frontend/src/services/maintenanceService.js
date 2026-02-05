import api from './api';

const API_URL = '/maintenance';

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

    const response = await api.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const getRequestsByUser = async (userId) => {
    const response = await api.get(`${API_URL}/user/${userId}`);
    return response.data || [];
};

const getAllRequests = async () => {
    const response = await api.get(API_URL);
    return response.data || [];
};

const updateStatus = async (id, status) => {
    const response = await api.put(`${API_URL}/${id}/status`, null, {
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
