import api from './api';
import config from '../config';

const authService = {
    login: async (username, password) => {
        const response = await api.post(config.API_ENDPOINTS.AUTH.LOGIN, {
            username,
            password
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post(config.API_ENDPOINTS.AUTH.REGISTER, userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getUserById: (id) => api.get(`/api/v1/users/${id}`)
};

export default authService;
