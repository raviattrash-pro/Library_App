import api from './api';
import config from '../config';

const qrService = {
    // Get current UPI QR code
    getQRCode: () => api.get('http://localhost:8082/api/v1/admin/qr'),

    // Upload/Update QR code
    uploadQRCode: (qrData) => api.post('http://localhost:8082/api/v1/admin/qr', qrData),

    // Update existing QR code
    updateQRCode: (qrData) => api.put('http://localhost:8082/api/v1/admin/qr', qrData)
};

export default qrService;
