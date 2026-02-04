import api from './api';
import config from '../config';

const bookingService = {
    getAllBookings: () => api.get(config.API_ENDPOINTS.BOOKINGS),

    getBookingById: (id) => api.get(`${config.API_ENDPOINTS.BOOKINGS}/${id}`),

    getUserBookings: (userId) => api.get(`${config.API_ENDPOINTS.BOOKINGS}/user/${userId}`),

    createBooking: (bookingData) => api.post(config.API_ENDPOINTS.BOOKINGS, bookingData),

    updateBooking: (id, bookingData) => api.put(`${config.API_ENDPOINTS.BOOKINGS}/${id}`, bookingData),

    cancelBooking: (id) => api.post(`${config.API_ENDPOINTS.BOOKINGS}/${id}/cancel`),

    deleteBooking: (id) => api.delete(`${config.API_ENDPOINTS.BOOKINGS}/${id}`),

    // Payment verification
    verifyPayment: (id) => api.put(`${config.API_ENDPOINTS.BOOKINGS}/${id}/verify-payment`),

    rejectPayment: (id, reason) => api.put(`${config.API_ENDPOINTS.BOOKINGS}/${id}/reject-payment`, { reason })
};

export default bookingService;
