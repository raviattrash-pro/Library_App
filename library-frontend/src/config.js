const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default {
    API_BASE_URL,
    API_ENDPOINTS: {
        AUTH: {
            LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
            REGISTER: `${API_BASE_URL}/api/v1/auth/register`
        },
        USERS: `${API_BASE_URL}/api/v1/users`,
        SEATS: `${API_BASE_URL}/api/v1/seats`,
        SHIFTS: `${API_BASE_URL}/api/v1/shifts`,
        BOOKINGS: `${API_BASE_URL}/api/v1/bookings`
    }
};
