import api from './api';
import config from '../config';

const financeService = {
    getStats: () => api.get('/api/finance/stats'),
    getExpenditures: () => api.get('/api/finance/expenditures'),
    addExpenditure: (data) => api.post('/api/finance/expenditures', data),
    deleteExpenditure: (id) => api.delete(`/api/finance/expenditures/${id}`),

    // Seat revenue is from Booking Service
    getSeatRevenue: () => api.get('/api/v1/bookings/revenue')
};

export default financeService;
