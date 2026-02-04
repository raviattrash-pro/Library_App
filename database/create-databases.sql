-- Create databases for Library Management System
-- Run this script in MySQL Workbench or MySQL Command Line

-- Create Library Service Database
CREATE DATABASE IF NOT EXISTS library_db;

-- Create Auth Service Database
CREATE DATABASE IF NOT EXISTS library_auth_db;

-- Create Booking Service Database
CREATE DATABASE IF NOT EXISTS booking_db;

-- Show created databases
SHOW DATABASES;

-- Grant privileges (if needed)
-- Replace 'root' with your MySQL username if different
GRANT ALL PRIVILEGES ON library_db.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON library_auth_db.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON booking_db.* TO 'root'@'localhost';

FLUSH PRIVILEGES;

SELECT 'Databases created successfully!' AS Status;
