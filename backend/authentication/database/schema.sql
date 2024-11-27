CREATE DATABASE IF NOT EXISTS authentication_db;

USE authentication_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, pass)
VALUES
('peter', 'peter@gmail.com', 'password'),
('peter2', 'peter2@yahoo.com', '12345'),
('therealpeter', 'realpeter@gmail.com', 'dbacks')