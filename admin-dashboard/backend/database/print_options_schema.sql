-- Print Option Categories Table
CREATE TABLE IF NOT EXISTS print_option_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('print_option', 'production_option') NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Print Options Table
CREATE TABLE IF NOT EXISTS print_options (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    specifications JSON,
    pricing JSON,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES print_option_categories(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id),
    INDEX idx_active (is_active),
    INDEX idx_sort_order (sort_order)
);

-- Insert the exact print option categories specified by the user
INSERT INTO print_option_categories (id, name, type, description, icon, sort_order) VALUES
-- Print Options
('paper', 'Paper', 'print_option', 'Paper types and weights', '📄', 1),
('format', 'Format', 'print_option', 'Paper sizes and dimensions', '📐', 2),
('colors', 'Colors', 'print_option', 'Color printing options', '🎨', 3),
('pages', 'Pages', 'print_option', 'Page printing configurations', '📃', 4),
('binding', 'Binding', 'print_option', 'Binding and assembly options', '📚', 5),
('refinement', 'Refinement', 'print_option', 'Surface treatments and coatings', '✨', 6),
('finishing', 'Finishing', 'print_option', 'Post-processing and finishing', '🎯', 7),
-- Production Options
('production', 'Production', 'production_option', 'Production timing and priority', '🏭', 8),
('quantity', 'Quantity', 'production_option', 'Quantity tiers and pricing', '📊', 9),
('proofing', 'Proofing', 'production_option', 'Proofing and approval options', '🔍', 10)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    description = VALUES(description),
    icon = VALUES(icon),
    sort_order = VALUES(sort_order),
    updated_at = CURRENT_TIMESTAMP;
