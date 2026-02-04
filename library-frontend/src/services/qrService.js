import api from './api';
import config from '../config';

const qrService = {
    // Get current UPI QR code
    getQRCode: () => api.get('/api/v1/admin/qr'),

    // Upload/Update QR code
    uploadQRCode: (qrData) => api.post('/api/v1/admin/qr', qrData),

    // Update existing QR code
    updateQRCode: (qrData) => api.put('/api/v1/admin/qr', qrData)
};

export default qrService;
