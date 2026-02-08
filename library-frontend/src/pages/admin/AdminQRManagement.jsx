import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import qrService from '../../services/qrService';
import { toast } from 'react-toastify';
import './AdminPages.css';

function AdminQRManagement() {
    const [currentQR, setCurrentQR] = useState(null);
    const [qrImage, setQrImage] = useState('');
    const [upiId, setUpiId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        fetchQRCode();
    }, []);

    const fetchQRCode = async () => {
        try {
            const response = await qrService.getQRCode();
            const data = response.data;
            let img = data?.imageUrl || '';
            if (img && !img.startsWith('data:') && !img.startsWith('http')) {
                const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                const baseUrl = config.API_BASE_URL.endsWith('/') ? config.API_BASE_URL : `${config.API_BASE_URL}/`;
                img = `${baseUrl}${cleanPath}`;
            }
            setCurrentQR(data);
            setQrImage(img);
            setUpiId(response.data?.upiId || '');
        } catch (error) {
            console.log('No QR code found yet');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setQrImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!qrImage) {
            toast.error('Please select a QR code image');
            return;
        }

        if (!upiId || !upiId.trim()) {
            toast.error('Please enter UPI ID');
            return;
        }

        setUploading(true);
        try {
            const qrData = {
                imageUrl: qrImage,
                upiId: upiId.trim(),
                updatedAt: new Date().toISOString()
            };

            if (currentQR) {
                await qrService.updateQRCode(qrData);
                toast.success('QR code and UPI ID updated successfully');
            } else {
                await qrService.uploadQRCode(qrData);
                toast.success('QR code and UPI ID uploaded successfully');
            }

            fetchQRCode();
        } catch (error) {
            console.error('Failed to upload QR:', error);
            toast.error(error.response?.data?.message || 'Failed to upload QR code');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                <h1>💳 UPI QR Code Management</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="qr-management-grid">
                <div className="qr-upload-section">
                    <div className="glass-card">
                        <h3>Upload UPI QR Code & ID</h3>
                        <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
                            Upload a QR code image and enter the UPI ID for payments
                        </p>

                        <div className="upload-area">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                id="qr-upload"
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="qr-upload" className="upload-label">
                                {qrImage ? (
                                    <img src={qrImage} alt="QR Code Preview" className="qr-preview" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <span style={{ fontSize: '3rem' }}>📱</span>
                                        <p>Click to upload QR code</p>
                                        <small>Supports: JPG, PNG (Max 5MB)</small>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="upi-id-section">
                            <label htmlFor="upi-id">
                                <strong>UPI ID</strong>
                            </label>
                            <input
                                type="text"
                                id="upi-id"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="Enter UPI ID (e.g., yourname@paytm)"
                                className="upi-input"
                            />
                        </div>

                        <button
                            className="btn-primary"
                            onClick={handleUpload}
                            disabled={uploading || !qrImage || !upiId}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {uploading ? 'Uploading...' : currentQR ? 'Update QR Code & UPI ID' : 'Upload QR Code & UPI ID'}
                        </button>
                    </div>
                </div>

                <div className="qr-info-section">
                    <div className="glass-card">
                        <h3>Current Active QR Code</h3>
                        {currentQR ? (
                            <>
                                <div className="current-qr-display">
                                    <img src={currentQR.imageUrl} alt="Current QR Code" />
                                </div>
                                <div className="qr-info">
                                    <p><strong>UPI ID:</strong></p>
                                    <p className="upi-id-display">{currentQR.upiId}</p>
                                    <p style={{ marginTop: '1rem' }}><strong>Last Updated:</strong></p>
                                    <p>{new Date(currentQR.updatedAt).toLocaleString()}</p>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>
                                <span style={{ fontSize: '3rem' }}>🚫</span>
                                <p>No QR code uploaded yet</p>
                                <small>Users won't be able to make payments until you upload a QR code</small>
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                        <h3>💡 Instructions</h3>
                        <ul style={{ lineHeight: '1.8', opacity: 0.9 }}>
                            <li>Upload a clear image of your UPI QR code</li>
                            <li>Users will scan this QR to make payments</li>
                            <li>After payment, users upload a screenshot</li>
                            <li>You can verify payments in Booking Management</li>
                            <li>Seats are allocated only after verification</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .qr-management-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                .upload-area {
                    border: 2px dashed rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    padding: 1rem;
                    transition: all 0.3s;
                }

                .upload-area:hover {
                    border-color: rgba(78, 205, 196, 0.5);
                    background: rgba(78, 205, 196, 0.05);
                }

                .upload-label {
                    display: block;
                    cursor: pointer;
                    min-height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .upload-placeholder {
                    text-align: center;
                }

                .qr-preview {
                    max-width: 100%;
                    max-height: 400px;
                    border-radius: 8px;
                }

                .current-qr-display {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    margin-bottom: 1rem;
                }

                .current-qr-display img {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 8px;
                }

                .qr-info {
                    text-align: center;
                    opacity: 0.8;
                }

                .upi-id-section {
                    margin-top: 1.5rem;
                }

                .upi-id-section label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #4ECDC4;
                }

                .upi-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid rgba(78, 205, 196, 0.3);
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    color: inherit;
                    font-size: 1rem;
                    transition: all 0.3s;
                }

                .upi-input:focus {
                    outline: none;
                    border-color: #4ECDC4;
                    background: rgba(255, 255, 255, 0.1);
                }

                .upi-id-display {
                    font-size: 1.2rem;
                    color: #4ECDC4;
                    font-weight: bold;
                    padding: 0.5rem;
                    background: rgba(78, 205, 196, 0.1);
                    border-radius: 8px;
                    margin-top: 0.5rem;
                }

                @media (max-width: 768px) {
                    .qr-management-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default AdminQRManagement;
