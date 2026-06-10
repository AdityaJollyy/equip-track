-- 1. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Asset Models Table (Templates/Categories)
CREATE TABLE IF NOT EXISTS asset_models (
    id SERIAL PRIMARY KEY,
    asset_type VARCHAR(50) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_type, brand, model_name)
);

-- 3. Physical Assets Table (Individual Devices)
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(50) UNIQUE NOT NULL,
    model_id INTEGER REFERENCES asset_models(id) ON DELETE RESTRICT,
    serial_number VARCHAR(100) NOT NULL,
    supports_sim BOOLEAN DEFAULT FALSE,
    imei_number VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'In Stock',
    purchase_date DATE,
    vendor VARCHAR(100),
    invoice_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Assignments & Audit History Table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    assigned_by INTEGER,
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_date TIMESTAMP,
    device_condition VARCHAR(100),
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'Active'
);