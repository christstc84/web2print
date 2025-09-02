-- PrintMe Database Schema
-- Run this script in your MariaDB container to create the necessary tables

USE PrintMe;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Items table (for production items)
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    customer_name VARCHAR(100) NOT NULL,
    status ENUM('pending', 'processing', 'printing', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    order_date DATE NOT NULL,
    due_date DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    specifications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Templates table (for print templates)
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    thumbnail_path VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Fonts table (for custom font uploads)
CREATE TABLE IF NOT EXISTS fonts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    font_format ENUM('ttf', 'otf', 'woff', 'woff2') NOT NULL,
    font_family VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Colors table (for color mapping)
CREATE TABLE IF NOT EXISTS colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    rgb_r DECIMAL(5,2) NOT NULL CHECK (rgb_r >= 0 AND rgb_r <= 255),
    rgb_g DECIMAL(5,2) NOT NULL CHECK (rgb_g >= 0 AND rgb_g <= 255),
    rgb_b DECIMAL(5,2) NOT NULL CHECK (rgb_b >= 0 AND rgb_b <= 255),
    cmyk_c DECIMAL(5,2) NOT NULL CHECK (cmyk_c >= 0 AND cmyk_c <= 100),
    cmyk_m DECIMAL(5,2) NOT NULL CHECK (cmyk_m >= 0 AND cmyk_m <= 100),
    cmyk_y DECIMAL(5,2) NOT NULL CHECK (cmyk_y >= 0 AND cmyk_y <= 100),
    cmyk_k DECIMAL(5,2) NOT NULL CHECK (cmyk_k >= 0 AND cmyk_k <= 100),
    spot_color VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO items (name, category, price, stock, description) VALUES
('Business Cards', 'Print', 25.00, 150, 'Standard business cards - 3.5" x 2"'),
('Flyers', 'Marketing', 15.00, 200, 'Single-sided flyers - 8.5" x 11"'),
('Brochures', 'Marketing', 35.00, 75, 'Tri-fold brochures - full color'),
('Banners', 'Display', 85.00, 25, 'Vinyl banners - various sizes'),
('Postcards', 'Print', 18.00, 300, 'Standard postcards - 4" x 6"'),
('Stickers', 'Print', 12.00, 500, 'Custom stickers - various sizes'),
('Posters', 'Display', 45.00, 50, 'Large format posters - 18" x 24"');

INSERT INTO customers (name, email, phone, address, city, state, zip_code) VALUES
('ABC Company', 'contact@abccompany.com', '555-0101', '123 Business St', 'Springfield', 'IL', '62701'),
('XYZ Marketing', 'info@xyzmarketing.com', '555-0102', '456 Commerce Ave', 'Springfield', 'IL', '62702'),
('Local Restaurant', 'orders@localrest.com', '555-0103', '789 Main St', 'Springfield', 'IL', '62703');

INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@printme.com', '$2b$10$dummy.hash.for.admin', 'Admin', 'User', 'admin'),
('chris', 'chris@printme.com', '$2b$10$dummy.hash.for.chris', 'Chris', 'Manager', 'manager');

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_users_role ON users(role);
