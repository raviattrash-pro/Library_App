import api from './api';
import config from '../config';

const seatService = {
    getAllSeats: () => api.get(config.API_ENDPOINTS.SEATS),

    getSeatById: (id) => api.get(`${config.API_ENDPOINTS.SEATS}/${id}`),

    getAvailableSeats: () => api.get(`${config.API_ENDPOINTS.SEATS}/available`),

    createSeat: (seatData) => api.post(config.API_ENDPOINTS.SEATS, seatData),

    updateSeat: (id, seatData) => api.put(`${config.API_ENDPOINTS.SEATS}/${id}`, seatData),

    deleteSeat: (id) => api.delete(`${config.API_ENDPOINTS.SEATS}/${id}`),

    updateSeatStatus: (id, status) => api.patch(`${config.API_ENDPOINTS.SEATS}/${id}/status?status=${status}`)
};

export default seatService;
