import axios from 'axios';
import config from '../config';

const MENU_API_URL = `${config.API_BASE_URL}/menu`;
const ORDER_API_URL = `${config.API_BASE_URL}/orders`;

// Menu
const getAvailableMenu = async () => {
    const response = await axios.get(`${MENU_API_URL}/available`);
    return response.data;
};

const getAllMenu = async () => {
    const response = await axios.get(MENU_API_URL);
    return response.data;
};

const addMenuItem = async (item) => {
    const response = await axios.post(MENU_API_URL, item);
    return response.data;
};

const updateItemAvailability = async (id, available) => {
    const response = await axios.put(`${MENU_API_URL}/${id}/availability`, null, {
        params: { available }
    });
    return response.data;
};

const updateMenuItem = async (id, item) => {
    const response = await axios.put(`${MENU_API_URL}/${id}`, item);
    return response.data;
};

const deleteMenuItem = async (id) => {
    await axios.delete(`${MENU_API_URL}/${id}`);
};

// Orders
const placeOrder = async (userId, userName, userEmail, userPhone, seatNumber, items, totalAmount, screenshotFile) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('userName', userName || '');
    formData.append('userEmail', userEmail || '');
    formData.append('userPhone', userPhone || '');
    formData.append('seatNumber', seatNumber);
    formData.append('itemsJson', JSON.stringify(items));
    formData.append('totalAmount', totalAmount);
    if (screenshotFile) {
        formData.append('paymentScreenshot', screenshotFile);
    }

    const response = await axios.post(ORDER_API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const getAllOrders = async () => {
    const response = await axios.get(ORDER_API_URL);
    return response.data;
};

const getOrdersByUser = async (userId) => {
    const response = await axios.get(`${ORDER_API_URL}/user/${userId}`);
    return response.data;
};

const updateOrderStatus = async (id, status) => {
    const response = await axios.put(`${ORDER_API_URL}/${id}/status`, null, {
        params: { status },
    });
    return response.data;
};

export default {
    getAvailableMenu,
    getAllMenu,
    addMenuItem,
    updateItemAvailability,
    updateMenuItem,
    deleteMenuItem,
    placeOrder,
    getAllOrders,
    getOrdersByUser,
    updateOrderStatus,
};
