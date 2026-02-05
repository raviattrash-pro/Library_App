import api from './api';

const API_URL = '/lost-found';

const getAllItems = async () => {
    const response = await api.get(API_URL);
    return response.data || [];
};

const getFoundItems = async () => {
    const response = await api.get(`${API_URL}/found`);
    return response.data || [];
};

const addItem = async (title, description, location, dateFound, imageFile) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('dateFound', dateFound);
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

const markClaimed = async (id) => {
    const response = await api.put(`${API_URL}/${id}/claim`);
    return response.data;
};

export default {
    getAllItems,
    getFoundItems,
    addItem,
    markClaimed,
};
