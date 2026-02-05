import api from './api';
import config from '../config';

const shiftService = {
    getAllShifts: () => api.get(config.API_ENDPOINTS.SHIFTS),

    getShiftById: (id) => api.get(`${config.API_ENDPOINTS.SHIFTS}/${id}`),

    createShift: (shiftData) => api.post(config.API_ENDPOINTS.SHIFTS, shiftData),

    updateShift: (id, shiftData) => api.put(`${config.API_ENDPOINTS.SHIFTS}/${id}`, shiftData),

    updateShiftPrice: (id, price) => api.put(`${config.API_ENDPOINTS.SHIFTS}/${id}/price?price=${price}`),

    deleteShift: (id) => api.delete(`${config.API_ENDPOINTS.SHIFTS}/${id}`)
};

export default shiftService;
