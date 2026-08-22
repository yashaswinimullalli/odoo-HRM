-- ============================================================================
-- Dayflow - Human Resource Management System (HRMS)
-- Database Schema Definition for PostgreSQL 13+ (Target: PostgreSQL 18.6)
-- Target Database: dayflow
-- ============================================================================

-- Ensure required extension for UUID/crypto generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Helper function for updated_at timestamps
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. Users Table (Authentication & RBAC)
-- Maps to: PS Section 2 (Authentication: email, password hash, role, verification)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'HR', 'EMPLOYEE')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. Departments Table (Implementation detail for normalized organization structure)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. Designations Table (Implementation detail for normalized job titles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS designations (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_department_designation UNIQUE (department_id, title)
);

DROP TRIGGER IF EXISTS trg_designations_updated_at ON designations;
CREATE TRIGGER trg_designations_updated_at
BEFORE UPDATE ON designations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 5. Employees Table
-- Maps to: PS Section 2 (Employee Profile: personal details, job details, profile picture)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    date_of_birth DATE,
    phone VARCHAR(30),
    address TEXT,
    department_id INT REFERENCES departments(id) ON DELETE RESTRICT,
    designation_id INT REFERENCES designations(id) ON DELETE RESTRICT,
    joining_date DATE NOT NULL,
    profile_picture_url TEXT,
    employment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE', 'PROBATION', 'RESIGNED', 'TERMINATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. Salary Structures Table
-- Maps to: PS Section 2 (Payroll/Salary Structure - read-only for employee, manageable by admin)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS salary_structures (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    basic_salary NUMERIC(12, 2) NOT NULL CHECK (basic_salary >= 0),
    hra NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (hra >= 0),
    allowances NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (allowances >= 0),
    deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (deductions >= 0),
    net_salary NUMERIC(12, 2) NOT NULL CHECK (net_salary >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_salary_structures_updated_at ON salary_structures;
CREATE TRIGGER trg_salary_structures_updated_at
BEFORE UPDATE ON salary_structures
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 7. Attendances Table
-- Maps to: PS Section 2 (Attendance: check-in, check-out, working hours, daily/weekly views,
-- statuses: PRESENT, ABSENT, HALF_DAY, LEAVE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendances (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    working_hours NUMERIC(4, 2) CHECK (working_hours >= 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_employee_attendance_date UNIQUE (employee_id, date)
);

DROP TRIGGER IF EXISTS trg_attendances_updated_at ON attendances;
CREATE TRIGGER trg_attendances_updated_at
BEFORE UPDATE ON attendances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 8. Leaves Table
-- Maps to: PS Section 2 (Leave/Time-off: PAID, SICK, UNPAID; PENDING, APPROVED, REJECTED;
-- remarks, reviewer comments, reviewed_by)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaves (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('PAID', 'SICK', 'UNPAID')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewer_comment TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

DROP TRIGGER IF EXISTS trg_leaves_updated_at ON leaves;
CREATE TRIGGER trg_leaves_updated_at
BEFORE UPDATE ON leaves
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 9. Payrolls Table
-- Maps to: PS Section 2 (Payroll Visibility & Monthly Reports/Salary Slips)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payrolls (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2000),
    basic_salary NUMERIC(12, 2) NOT NULL CHECK (basic_salary >= 0),
    hra NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (hra >= 0),
    allowances NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (allowances >= 0),
    deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (deductions >= 0),
    net_salary NUMERIC(12, 2) NOT NULL CHECK (net_salary >= 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PROCESSED', 'PAID', 'FAILED')),
    payment_date DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_employee_payroll_month_year UNIQUE (employee_id, month, year)
);

DROP TRIGGER IF EXISTS trg_payrolls_updated_at ON payrolls;
CREATE TRIGGER trg_payrolls_updated_at
BEFORE UPDATE ON payrolls
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 10. Documents Table
-- Maps to: PS Section 2 (Employee Profile Documents: Offer letter, Resume, Contract, ID proof)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- e.g. OFFER_LETTER, ID_PROOF, RESUME, CONTRACT, SALARY_SLIP
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 11. Notifications Table
-- Maps to: PS Section 2 (Email & Notification alerts, Dashboard alerts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 12. Audit / Activity Logs Table
-- Maps to: PS Section 2 (Dashboard Recent Activity & System Auditing)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- e.g. USER_LOGIN, CREATE_EMPLOYEE, APPROVE_LEAVE, REJECT_LEAVE, PROCESS_PAYROLL, UPDATE_SALARY
    entity_type VARCHAR(50) NOT NULL, -- e.g. USER, EMPLOYEE, LEAVE, ATTENDANCE, PAYROLL, DOCUMENT
    entity_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Performance Indexes (Optimized for PS queries: employee views, daily/weekly attendance,
-- leave status filters, payroll lookups, and unread notifications)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation_id);

CREATE INDEX IF NOT EXISTS idx_attendances_employee_date ON attendances(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_status ON attendances(status);
CREATE INDEX IF NOT EXISTS idx_attendances_date_range ON attendances(date);

CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_payrolls_employee_period ON payrolls(employee_id, year, month);
CREATE INDEX IF NOT EXISTS idx_payrolls_status ON payrolls(payment_status);

CREATE INDEX IF NOT EXISTS idx_documents_employee_id ON documents(employee_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
