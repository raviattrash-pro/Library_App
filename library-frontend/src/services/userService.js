import api from './api';
import config from '../config';

const userService = {
    getAllUsers: () => api.get(config.API_ENDPOINTS.USERS),

    getUserById: (id) => api.get(`${config.API_ENDPOINTS.USERS}/${id}`),

    updateUser: (id, userData) => api.put(`${config.API_ENDPOINTS.USERS}/${id}`, userData),

    deleteUser: (id) => api.delete(`${config.API_ENDPOINTS.USERS}/${id}`),

    updateUserRole: (id, role) => api.patch(`${config.API_ENDPOINTS.USERS}/${id}/role?role=${role}`)
};

export default userService;
