import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import SeatBooking from './pages/SeatBooking';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import authService from './services/authService';
import AdminSeatManagement from './pages/admin/AdminSeatManagement';
import FeeConfiguration from './pages/admin/FeeConfiguration';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import AdminBookingManagement from './pages/admin/AdminBookingManagement';
import AdminQRManagement from './pages/admin/AdminQRManagement';
import AdminLockerManagement from './pages/admin/AdminLockerManagement';
import LockerDashboard from './pages/user/LockerDashboard';
import MaintenancePage from './pages/user/MaintenancePage';
import AdminMaintenance from './pages/admin/AdminMaintenance';
import OrderingPage from './pages/user/OrderingPage';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import LostFoundPage from './pages/user/LostFoundPage';
import AdminLostFound from './pages/admin/AdminLostFound';
import AttendanceScanner from './pages/user/AttendanceScanner';
import PrintServicePage from './pages/user/PrintServicePage';
import AdminPrintQueue from './pages/admin/AdminPrintQueue';
import ProfitLossDashboard from './pages/admin/ProfitLossDashboard';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
    return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    return user && user.role === 'ADMIN' ? children : <Navigate to="/dashboard" />;
};

function App() {
    return (
        <ThemeProvider>
            <div className="app">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/book-seat"
                        element={
                            <ProtectedRoute>
                                <SeatBooking />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-bookings"
                        element={
                            <ProtectedRoute>
                                <MyBookings />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
                    <Route path="/admin/seats" element={<ProtectedRoute><AdminRoute><AdminSeatManagement /></AdminRoute></ProtectedRoute>} />
                    <Route path="/admin/fees" element={<ProtectedRoute><AdminRoute><FeeConfiguration /></AdminRoute></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><UserManagement /></AdminRoute></ProtectedRoute>} />
                    <Route path="/admin/reports" element={<ProtectedRoute><AdminRoute><Reports /></AdminRoute></ProtectedRoute>} />
                    <Route path="/admin/bookings" element={<ProtectedRoute><AdminRoute><AdminBookingManagement /></AdminRoute></ProtectedRoute>} />
                    <Route path="/admin/qr-management" element={<ProtectedRoute><AdminRoute><AdminQRManagement /></AdminRoute></ProtectedRoute>} />
                    <Route path="/admin/lockers" element={<ProtectedRoute><AdminRoute><AdminLockerManagement /></AdminRoute></ProtectedRoute>} />
                    <Route
                        path="/lockers"
                        element={
                            <ProtectedRoute>
                                <LockerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/maintenance"
                        element={
                            <ProtectedRoute>
                                <MaintenancePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/admin/maintenance" element={<ProtectedRoute><AdminRoute><AdminMaintenance /></AdminRoute></ProtectedRoute>} />
                    <Route path="/order" element={<ProtectedRoute><OrderingPage /></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute><AdminRoute><AdminOrders /></AdminRoute></ProtectedRoute>} />
                    <Route path="/admin/menu" element={<ProtectedRoute><AdminRoute><AdminMenu /></AdminRoute></ProtectedRoute>} />
                    <Route path="/lost-found" element={<ProtectedRoute><LostFoundPage /></ProtectedRoute>} />
                    <Route path="/admin/lost-found" element={<ProtectedRoute><AdminRoute><AdminLostFound /></AdminRoute></ProtectedRoute>} />
                    <Route path="/attendance-scan" element={<ProtectedRoute><AttendanceScanner /></ProtectedRoute>} />
                    <Route path="/print" element={<ProtectedRoute><PrintServicePage /></ProtectedRoute>} />
                    <Route path="/admin/print" element={<ProtectedRoute><AdminRoute><AdminPrintQueue /></AdminRoute></ProtectedRoute>} />
                    <Route path="/admin/finance" element={<ProtectedRoute><AdminRoute><ProfitLossDashboard /></AdminRoute></ProtectedRoute>} />


                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </div>
        </ThemeProvider>
    );
}

export default App;
