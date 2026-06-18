-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    supabase_uid UUID UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Sales', 'Warehouse', 'Accounts', 'Compliance', 'Customer', 'Operations', 'Supervisor', 'Distributor', 'admin', 'client', 'operations', 'supervisor', 'distributor', 'partner', 'Customer', 'Manager', 'Supervisor', 'Partner')),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    institution_name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    number_of_floors INTEGER,
    staff_count INTEGER,
    cleaning_frequency VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_customers_updated_at 
BEFORE UPDATE ON customers 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    unit_price NUMERIC(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    reorder_level INTEGER DEFAULT 10 NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS quotations (
    id BIGSERIAL PRIMARY KEY,
    quotation_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    generated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    monthly_cost NUMERIC(12, 2) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL,
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_quotations_updated_at 
BEFORE UPDATE ON quotations 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. QUOTATION_ITEMS TABLE
CREATE TABLE IF NOT EXISTS quotation_items (
    id BIGSERIAL PRIMARY KEY,
    quotation_id BIGINT REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- 6. WORKFLOW_HISTORY TABLE
CREATE TABLE IF NOT EXISTS workflow_history (
    id BIGSERIAL PRIMARY KEY,
    quotation_id BIGINT REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL CHECK (status IN ('Pending', 'Sent', 'Failed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. WAREHOUSES TABLE
CREATE TABLE IF NOT EXISTS warehouses (
    id BIGSERIAL PRIMARY KEY,
    warehouse_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    manager_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. STOCK_BATCHES TABLE
CREATE TABLE IF NOT EXISTS stock_batches (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE CASCADE NOT NULL,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. SALESMAN_VISITS TABLE
CREATE TABLE IF NOT EXISTS salesman_visits (
    id BIGSERIAL PRIMARY KEY,
    salesman_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    visit_date DATE NOT NULL,
    notes TEXT,
    next_followup_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. REORDER_REMINDERS TABLE
CREATE TABLE IF NOT EXISTS reorder_reminders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    quotation_id BIGINT REFERENCES quotations(id) ON DELETE SET NULL,
    reminder_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 12. COMPLIANCE_DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS compliance_documents (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_url VARCHAR(512) NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_customers_institution_name ON customers(institution_name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_stock_batches_warehouse_product ON stock_batches(warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_salesman_visits_salesman_customer ON salesman_visits(salesman_id, customer_id);

-- SAMPLE SEED INSERTS

-- 5 Users (Admin, Sales, Warehouse, Accounts, Customer)
INSERT INTO users (full_name, email, password_hash, role, phone, status) VALUES
('Ganga Admin', 'admin@cleanbundle.ai', 'pbkdf2_sha256$mocked_hash_value_1', 'Admin', '+91 9988776655', 'Active'),
('Rajesh Kumar', 'sales@cleanbundle.ai', 'pbkdf2_sha256$mocked_hash_value_2', 'Sales', '+91 8877665544', 'Active'),
('Vikram Singh', 'warehouse@cleanbundle.ai', 'pbkdf2_sha256$mocked_hash_value_3', 'Warehouse', '+91 7766554433', 'Active'),
('Ananya Sen', 'accounts@cleanbundle.ai', 'pbkdf2_sha256$mocked_hash_value_4', 'Accounts', '+91 6655443322', 'Active'),
('John Doe', 'client@cleanbundle.ai', 'pbkdf2_sha256$mocked_hash_value_5', 'Customer', '+91 5544332211', 'Active');

-- 10 Products
INSERT INTO products (product_name, category, sku, description, unit_price, stock_quantity, reorder_level, status) VALUES
('Toilet Bowl Cleaner 1L', 'Chemicals', 'TR-005', 'Highly concentrated toilet disinfection liquid.', 120.00, 150, 10, 'Active'),
('Floor Cleaner Disinfectant 5L', 'Chemicals', 'FL-012', 'Disinfectant floor cleaning agent for marble and tiles.', 450.00, 80, 8, 'Active'),
('Glass & Multi-Surface Cleaner 500ml', 'Chemicals', 'GL-002', 'Streak-free cleaner for windows, mirrors and glass panes.', 80.00, 200, 15, 'Active'),
('Microfiber Cloths 4-Pack', 'Accessories', 'MC-022', 'Ultra soft non-abrasive microfiber towels.', 250.00, 120, 20, 'Active'),
('Heavy Duty Trash Bags (Large)', 'Consumables', 'TB-105', 'Large eco-friendly biodegradable refuse sacks.', 180.00, 300, 25, 'Active'),
('Liquid Hand Soap 5L', 'Consumables', 'HS-045', 'Mild moisturizing hand wash formulation.', 380.00, 50, 10, 'Active'),
('Multi-Purpose Cleaner 5L', 'Chemicals', 'MP-088', 'Degreaser and surface sanitizer cleaner concentrate.', 420.00, 60, 10, 'Active'),
('Air Freshener Spray 300ml', 'Consumables', 'AF-011', 'Long lasting jasmine scent odor neutralizer.', 150.00, 100, 15, 'Active'),
('Nitrile Disposable Gloves (Box of 100)', 'Consumables', 'NG-099', 'Powder-free safety gloves for cleaning operations.', 600.00, 90, 15, 'Active'),
('Wet Mop Refill (Cotton)', 'Accessories', 'WM-033', 'Super absorbent loop-ended cotton mop head.', 160.00, 75, 10, 'Active');

-- 3 Customers
INSERT INTO customers (institution_name, institution_type, contact_person, email, phone, address, number_of_floors, staff_count, cleaning_frequency) VALUES
('Aurora Deemed University', 'School', 'Dr. Ramesh Rao', 'procurement@aurora.edu.in', '+91 8877665544', 'Bhongir campus, Hyderabad', 4, 100, 'Daily'),
('St. Mary Hospital', 'Hospital', 'Sister Clara', 'procurement@stmarys.org', '+91 9876543210', 'Bandra West, Mumbai', 6, 420, 'Hourly'),
('Sunrise Hotel & Suites', 'Hotel', 'Housekeeping Manager', 'housekeeping@sunrisehotels.com', '+91 7766554433', 'Calangute, Goa', 8, 240, 'Daily');

-- 2 Quotations
-- Quotation 1 (For Customer ID 1: Aurora Deemed University, Generated by User ID 2: Rajesh Kumar)
INSERT INTO quotations (quotation_number, customer_id, generated_by, monthly_cost, total_cost, status, ai_summary) VALUES
('QTN-2026-1001', 1, 2, 3393.83, 3393.83, 'Generated', 'AI Summary: Recommendation set configured for school building. Prioritizes floor disinfectant and daily consumables.'),
('QTN-2026-1002', 2, 2, 101072.16, 101072.16, 'Approved', 'AI Summary: High-frequency healthcare sanitization package including hospital-grade disinfectants and gloves.');

-- Quotation 1 Items
INSERT INTO quotation_items (quotation_id, product_id, quantity, unit_price, total_price) VALUES
(1, 2, 2, 450.00, 900.00),    -- Floor Cleaner Disinfectant (qty 2)
(1, 3, 1, 80.00, 80.00),      -- Glass Cleaner (qty 1)
(1, 4, 1, 250.00, 250.00),    -- Microfiber Cloths (qty 1)
(1, 5, 2, 180.00, 360.00),    -- Trash Bags (qty 2)
(1, 6, 1, 380.00, 380.00);    -- Hand Soap (qty 1)

-- Quotation 2 Items
INSERT INTO quotation_items (quotation_id, product_id, quantity, unit_price, total_price) VALUES
(2, 9, 10, 600.00, 6000.00),  -- Nitrile Gloves (qty 10)
(2, 2, 12, 450.00, 5400.00),  -- Floor Cleaner (qty 12)
(2, 1, 20, 120.00, 2400.00);  -- Toilet Cleaner (qty 20)
