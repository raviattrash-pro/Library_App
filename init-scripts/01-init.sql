-- Create databases
CREATE DATABASE IF NOT EXISTS library_auth_db;
CREATE DATABASE IF NOT EXISTS library_db;
CREATE DATABASE IF NOT EXISTS booking_db;
CREATE DATABASE IF NOT EXISTS fee_db;

USE library_db;

-- Insert default shifts
INSERT INTO shifts (name, start_time, end_time, base_price, description) VALUES
('A', '06:00:00', '12:00:00', 500.00, 'Morning Shift'),
('B', '12:00:00', '18:00:00', 500.00, 'Afternoon Shift'),
('C', '18:00:00', '00:00:00', 500.00, 'Evening Shift');

-- Insert sample seats
INSERT INTO seats (seat_number, status, row_number, column_number, section, is_active) VALUES
('1', 'AVAILABLE', 1, 1, 'A', true),
('2', 'AVAILABLE', 1, 2, 'A', true),
('3', 'AVAILABLE', 1, 3, 'A', true),
('4', 'AVAILABLE', 1, 4, 'A', true),
('5', 'AVAILABLE', 1, 5, 'A', true),
('6', 'AVAILABLE', 2, 1, 'A', true),
('7', 'AVAILABLE', 2, 2, 'A', true),
('8', 'AVAILABLE', 2, 3, 'A', true),
('9', 'AVAILABLE', 2, 4, 'A', true),
('10', 'AVAILABLE', 2, 5, 'A', true);

USE library_auth_db;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, phone, role, active, created_at, updated_at) VALUES
('admin', 'admin@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', '1234567890', 'ADMIN', true, NOW(), NOW()),
('user', 'user@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'User', '9876543210', 'USER', true, NOW(), NOW());
