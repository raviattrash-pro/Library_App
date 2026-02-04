import api from './api';
import config from '../config';

// Add LOCKERS endpoint to config if not exists, but for now hardcode or assume /api/lockers
const LOCKER_API = '/api/lockers';

const lockerService = {
    getAllLockers: () => api.get(LOCKER_API),

    createLocker: (lockerData) => api.post(LOCKER_API, lockerData),

    bookLocker: (bookingData) => {
        const formData = new FormData();
        formData.append('userId', bookingData.userId);
        formData.append('lockerId', bookingData.lockerId);
        formData.append('durationMonths', bookingData.durationMonths);
        if (bookingData.paymentScreenshot) {
            formData.append('paymentScreenshot', bookingData.paymentScreenshot);
        }
        return api.post(`${LOCKER_API}/book`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    verifyBooking: (bookingId, isApproved) => api.put(`${LOCKER_API}/verify/${bookingId}?isApproved=${isApproved}`),

    getAllBookings: () => api.get(`${LOCKER_API}/pending`),

    getUserBookings: (userId) => api.get(`${LOCKER_API}/user/${userId}`),

    updatePrice: (lockerId, newPrice) => api.put(`${LOCKER_API}/${lockerId}/price`, null, { params: { newPrice } }),

    cancelBooking: (bookingId) => api.put(`${LOCKER_API}/cancel/${bookingId}`)
};

export default lockerService;
