-- ============================================================================
-- Dayflow - Human Resource Management System (HRMS)
-- Seed Data Script for PostgreSQL 13+ (Target: PostgreSQL 18.6)
-- Target Database: dayflow
-- ============================================================================

-- Clean up existing data safely in reverse dependency order
TRUNCATE TABLE 
    audit_logs,
    notifications,
    documents,
    payrolls,
    leaves,
    attendances,
    salary_structures,
    employees,
    designations,
    departments,
    users
RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- 1. Insert Departments (Implementation Detail for Organization Structure)
-- ----------------------------------------------------------------------------
INSERT INTO departments (id, name, description) VALUES
(1, 'Human Resources', 'People operations, talent acquisition, culture, and employee relations'),
(2, 'Engineering', 'Core software development, architecture, infrastructure, and DevOps'),
(3, 'Design', 'Product design, UI/UX, user research, and brand creative systems'),
(4, 'Marketing', 'Brand marketing, digital campaigns, content, and growth operations'),
(5, 'Finance', 'Financial planning, accounting, auditing, and payroll compliance'),
(6, 'Sales', 'Business development, client acquisition, and enterprise sales');

SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- ----------------------------------------------------------------------------
-- 2. Insert Designations (Implementation Detail for Job Titles)
-- ----------------------------------------------------------------------------
INSERT INTO designations (id, department_id, title, description) VALUES
(1, 1, 'HR Manager', 'Leads human resource strategies and oversees employee lifecycle'),
(2, 1, 'HR Executive', 'Handles day-to-day HR operations, attendance, and onboarding'),
(3, 2, 'Software Engineer', 'Builds full-stack features and maintains scalable services'),
(4, 2, 'Backend Developer', 'Designs REST APIs, database schemas, and microservices'),
(5, 2, 'DevOps Engineer', 'Manages CI/CD pipelines, container orchestration, and cloud infrastructure'),
(6, 2, 'Frontend Developer', 'Crafts modern, accessible, and responsive user interfaces'),
(7, 3, 'UI/UX Designer', 'Designs user flows, wireframes, prototypes, and visual design systems'),
(8, 3, 'Product Designer', 'Leads end-to-end product design from concept to delivery'),
(9, 4, 'Marketing Executive', 'Drives organic campaigns, content marketing, and brand outreach'),
(10, 5, 'Financial Analyst', 'Monitors corporate budgets, financial reporting, and payroll audits'),
(11, 6, 'Sales Executive', 'Manages sales pipelines, client relationships, and revenue targets');

SELECT setval('designations_id_seq', (SELECT MAX(id) FROM designations));

-- ----------------------------------------------------------------------------
-- 3. Insert Users (Authentication & RBAC)
-- Demo Password for all accounts: 'Password@123'
-- Bcrypt Hash: $2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, is_active, is_verified) VALUES
-- 1 Management/Admin Account
(1, 'priya.menon@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'ADMIN', TRUE, TRUE),
-- 1 HR Account
(2, 'meera.joshi@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'HR', TRUE, TRUE),
-- 10 Employee Accounts
(3, 'aarav@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE),
(4, 'ananya@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE),
(5, 'rohan@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE),
(6, 'diya@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE),
(7, 'arjun@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE),
(8, 'sneha@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE),
(9, 'kabir@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE),
(10, 'kavya@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE),
(11, 'rahul@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE),
(12, 'ishita@dayflow.demo', '$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO', 'EMPLOYEE', TRUE, TRUE);

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ----------------------------------------------------------------------------
-- 4. Insert Employee Profiles
-- Covers: Employee ID, Name, Phone, Address, Department, Designation, Joining date, 
-- Profile pic placeholder, Employment status
-- ----------------------------------------------------------------------------
INSERT INTO employees (
    id, user_id, employee_code, first_name, last_name, gender, 
    date_of_birth, phone, address, department_id, designation_id, 
    joining_date, profile_picture_url, employment_status
) VALUES
-- Admin Profile (Priya Menon)
(1, 1, 'ADM001', 'Priya', 'Menon', 'FEMALE', '1988-04-12', '+91-9876543201', 'Flat 402, Green Glen Heights, HSR Layout, Bengaluru, KA', 1, 1, '2021-01-15', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 'ACTIVE'),
-- HR Profile (Meera Joshi)
(2, 2, 'HR001', 'Meera', 'Joshi', 'FEMALE', '1992-09-24', '+91-9876543202', 'Tower 3, Apt 11B, Indiranagar, Bengaluru, KA', 1, 2, '2022-03-01', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'ACTIVE'),
-- 10 Employees
(3, 3, 'EMP001', 'Aarav', 'Sharma', 'MALE', '1995-06-18', '+91-9876543203', '14/B, Koramangala 4th Block, Bengaluru, KA', 2, 3, '2023-01-10', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', 'ACTIVE'),
(4, 4, 'EMP002', 'Ananya', 'Rao', 'FEMALE', '1996-11-05', '+91-9876543204', '88, Palm Meadows, Whitefield, Bengaluru, KA', 3, 7, '2023-02-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'ACTIVE'),
(5, 5, 'EMP003', 'Rohan', 'Mehta', 'MALE', '1993-08-30', '+91-9876543205', 'Villa 7, Prestige Ozone, Whitefield, Bengaluru, KA', 2, 4, '2022-06-01', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'ACTIVE'),
(6, 6, 'EMP004', 'Diya', 'Nair', 'FEMALE', '1997-02-14', '+91-9876543206', '204, Sunset Enclave, Bellandur, Bengaluru, KA', 4, 9, '2023-05-02', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'ACTIVE'),
(7, 7, 'EMP005', 'Arjun', 'Patel', 'MALE', '1994-12-20', '+91-9876543207', '512, Brigade Gateway, Malleshwaram, Bengaluru, KA', 5, 10, '2022-11-15', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'ACTIVE'),
(8, 8, 'EMP006', 'Sneha', 'Iyer', 'FEMALE', '1992-07-09', '+91-9876543208', '45, Lake View Residency, Electronic City, Bengaluru, KA', 2, 5, '2021-08-20', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'ACTIVE'),
(9, 9, 'EMP007', 'Kabir', 'Singh', 'MALE', '1995-03-27', '+91-9876543209', '701, Sobha Iris, Outer Ring Road, Bengaluru, KA', 6, 11, '2023-04-10', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'ACTIVE'),
(10, 10, 'EMP008', 'Kavya', 'Reddy', 'FEMALE', '1996-01-19', '+91-9876543210', '12/A, RMV 2nd Stage, Bengaluru, KA', 2, 6, '2023-03-01', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', 'ACTIVE'),
(11, 11, 'EMP009', 'Rahul', 'Verma', 'MALE', '1998-05-12', '+91-9876543211', '33, Windmills of Your Mind, Whitefield, Bengaluru, KA', 6, 11, '2023-07-15', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400', 'ACTIVE'),
(12, 12, 'EMP010', 'Ishita', 'Kapoor', 'FEMALE', '1995-10-08', '+91-9876543212', '902, Salarpuria Sattva, Marathahalli, Bengaluru, KA', 3, 8, '2022-09-01', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400', 'ACTIVE');

SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));

-- ----------------------------------------------------------------------------
-- 5. Insert Salary Structures (Salary Structure Info required by PS)
-- Fictional Monthly Salaries (Basic + HRA + Allowances - Deductions = Net Salary)
-- ----------------------------------------------------------------------------
INSERT INTO salary_structures (
    employee_id, basic_salary, hra, allowances, deductions, net_salary, currency
) VALUES
-- Admin (Priya Menon): Net 95,000
(1, 50000.00, 25000.00, 25000.00, 5000.00, 95000.00, 'INR'),
-- HR (Meera Joshi): Net 58,000
(2, 30000.00, 15000.00, 16000.00, 3000.00, 58000.00, 'INR'),
-- EMP001 (Aarav Sharma): 65,000
(3, 32500.00, 16250.00, 19500.00, 3250.00, 65000.00, 'INR'),
-- EMP002 (Ananya Rao): 58,000
(4, 29000.00, 14500.00, 17400.00, 2900.00, 58000.00, 'INR'),
-- EMP003 (Rohan Mehta): 72,000
(5, 36000.00, 18000.00, 21600.00, 3600.00, 72000.00, 'INR'),
-- EMP004 (Diya Nair): 45,000
(6, 22500.00, 11250.00, 13500.00, 2250.00, 45000.00, 'INR'),
-- EMP005 (Arjun Patel): 55,000
(7, 27500.00, 13750.00, 16500.00, 2750.00, 55000.00, 'INR'),
-- EMP006 (Sneha Iyer): 78,000
(8, 39000.00, 19500.00, 23400.00, 3900.00, 78000.00, 'INR'),
-- EMP007 (Kabir Singh): 42,000
(9, 21000.00, 10500.00, 12600.00, 2100.00, 42000.00, 'INR'),
-- EMP008 (Kavya Reddy): 62,000
(10, 31000.00, 15500.00, 18600.00, 3100.00, 62000.00, 'INR'),
-- EMP009 (Rahul Verma): 44,000
(11, 22000.00, 11000.00, 13200.00, 2200.00, 44000.00, 'INR'),
-- EMP010 (Ishita Kapoor): 60,000
(12, 30000.00, 15000.00, 18000.00, 3000.00, 60000.00, 'INR');

-- ----------------------------------------------------------------------------
-- 6. Insert 30-Day Attendance Records (Daily & Weekly Views)
-- Realistic distribution of PRESENT, ABSENT, HALF_DAY, and LEAVE
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    emp_rec RECORD;
    d DATE;
    dow INT;
    status_val VARCHAR(20);
    cin TIMESTAMPTZ;
    cout TIMESTAMPTZ;
    whours NUMERIC(4, 2);
    rand_val FLOAT;
BEGIN
    FOR emp_rec IN SELECT id, employee_code FROM employees WHERE id >= 3 AND id <= 12 ORDER BY id LOOP
        FOR d IN SELECT generate_series('2026-07-15'::date, '2026-08-13'::date, '1 day'::interval)::date LOOP
            dow := EXTRACT(DOW FROM d);
            rand_val := random();

            -- Skip weekends (0 = Sunday, 6 = Saturday)
            IF dow = 0 OR dow = 6 THEN
                CONTINUE;
            END IF;

            -- Leave and absence variations
            IF emp_rec.employee_code = 'EMP004' AND d IN ('2026-08-10', '2026-08-11') THEN
                -- Diya Nair approved Sick Leave
                status_val := 'LEAVE';
                cin := NULL;
                cout := NULL;
                whours := 0.00;
            ELSIF emp_rec.employee_code = 'EMP002' AND d IN ('2026-07-22') THEN
                -- Ananya Rao approved Paid Leave
                status_val := 'LEAVE';
                cin := NULL;
                cout := NULL;
                whours := 0.00;
            ELSIF emp_rec.employee_code = 'EMP008' AND d = '2026-08-05' THEN
                -- Kavya Reddy approved Sick Leave
                status_val := 'LEAVE';
                cin := NULL;
                cout := NULL;
                whours := 0.00;
            ELSIF emp_rec.employee_code = 'EMP007' AND d = '2026-07-28' THEN
                -- Kabir Singh Unplanned Absence
                status_val := 'ABSENT';
                cin := NULL;
                cout := NULL;
                whours := 0.00;
            ELSIF rand_val < 0.07 THEN
                -- Half Day
                status_val := 'HALF_DAY';
                cin := (d || ' 09:15:00+05:30')::timestamptz;
                cout := (d || ' 13:45:00+05:30')::timestamptz;
                whours := 4.50;
            ELSIF rand_val < 0.20 THEN
                -- Late Arrival Full Day
                status_val := 'PRESENT';
                cin := (d || ' 10:15:00+05:30')::timestamptz;
                cout := (d || ' 19:15:00+05:30')::timestamptz;
                whours := 9.00;
            ELSE
                -- Standard Full Day Present
                status_val := 'PRESENT';
                cin := (d || ' 09:05:00+05:30')::timestamptz;
                cout := (d || ' 18:15:00+05:30')::timestamptz;
                whours := 9.16;
            END IF;

            INSERT INTO attendances (employee_id, date, check_in, check_out, working_hours, status)
            VALUES (emp_rec.id, d, cin, cout, whours, status_val)
            ON CONFLICT (employee_id, date) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 7. Insert Leave Requests
-- Covers: PAID, SICK, UNPAID | PENDING, APPROVED, REJECTED | Remarks & Reviewer comments
-- ----------------------------------------------------------------------------
INSERT INTO leaves (
    id, employee_id, leave_type, start_date, end_date, reason, 
    status, reviewed_by, reviewer_comment, reviewed_at
) VALUES
-- 1. Rohan Mehta (EMP003): Paid Leave -> PENDING
(1, 5, 'PAID', '2026-09-01', '2026-09-03', 'Attending cousin wedding out of town', 'PENDING', NULL, NULL, NULL),

-- 2. Diya Nair (EMP004): Sick Leave -> APPROVED (Reviewed by HR Meera Joshi)
(2, 6, 'SICK', '2026-08-10', '2026-08-11', 'Severe viral infection and fever', 'APPROVED', 2, 'Approved. Rest well and submit doctor prescription upon return.', '2026-08-09 16:30:00+05:30'),

-- 3. Ananya Rao (EMP002): Paid Leave -> APPROVED (Reviewed by Admin Priya Menon)
(3, 4, 'PAID', '2026-07-22', '2026-07-23', 'Personal family function and travel', 'APPROVED', 1, 'Approved. Ensure design handover is completed with Ishita.', '2026-07-20 11:15:00+05:30'),

-- 4. Kabir Singh (EMP007): Unpaid Leave -> REJECTED (Reviewed by HR Meera Joshi)
(4, 9, 'UNPAID', '2026-08-25', '2026-08-28', 'Extended leisure road trip with college friends', 'REJECTED', 2, 'Rejected due to critical quarter-end sales drive and target reviews.', '2026-08-15 14:00:00+05:30'),

-- 5. Sneha Iyer (EMP006): Sick Leave -> PENDING
(5, 8, 'SICK', '2026-08-24', '2026-08-25', 'Severe dental surgery recovery', 'PENDING', NULL, NULL, NULL),

-- 6. Aarav Sharma (EMP001): Paid Leave -> APPROVED (Reviewed by Admin Priya Menon)
(6, 3, 'PAID', '2026-07-16', '2026-07-17', 'Annual family vacation', 'APPROVED', 1, 'Approved. Enjoy your time off!', '2026-07-14 10:00:00+05:30'),

-- 7. Arjun Patel (EMP005): Paid Leave -> APPROVED (Reviewed by Admin Priya Menon)
(7, 7, 'PAID', '2026-08-04', '2026-08-04', 'Attending certified financial auditor licensing exam', 'APPROVED', 1, 'Approved. Best wishes for the exam.', '2026-08-02 09:45:00+05:30'),

-- 8. Kavya Reddy (EMP008): Sick Leave -> APPROVED (Reviewed by HR Meera Joshi)
(8, 10, 'SICK', '2026-08-05', '2026-08-05', 'Acute food poisoning and doctor consultation', 'APPROVED', 2, 'Approved. Take care.', '2026-08-05 08:30:00+05:30'),

-- 9. Rahul Verma (EMP009): Unpaid Leave -> REJECTED (Reviewed by HR Meera Joshi)
(9, 11, 'UNPAID', '2026-08-18', '2026-08-20', 'Personal side project conference', 'REJECTED', 2, 'Rejected. Clashes with mandatory enterprise client onboarding demos.', '2026-08-14 17:10:00+05:30'),

-- 10. Ishita Kapoor (EMP010): Paid Leave -> PENDING
(10, 12, 'PAID', '2026-09-08', '2026-09-10', 'Attending National Design Conclave 2026', 'PENDING', NULL, NULL, NULL),

-- 11. Aarav Sharma (EMP001): Sick Leave -> APPROVED (Reviewed by HR Meera Joshi)
(11, 3, 'SICK', '2026-07-30', '2026-07-30', 'Seasonal cold and migraine', 'APPROVED', 2, 'Approved. Feel better soon.', '2026-07-30 08:15:00+05:30'),

-- 12. Kabir Singh (EMP007): Paid Leave -> APPROVED (Reviewed by Admin Priya Menon)
(12, 9, 'PAID', '2026-07-10', '2026-07-10', 'Home shifting and lease documentation', 'APPROVED', 1, 'Approved.', '2026-07-08 15:20:00+05:30');

SELECT setval('leaves_id_seq', (SELECT MAX(id) FROM leaves));

-- ----------------------------------------------------------------------------
-- 8. Insert Payrolls (Monthly Salary Slips / Read-only Payroll Records)
-- July 2026 (PAID) and August 2026 (PROCESSED / PENDING)
-- ----------------------------------------------------------------------------
INSERT INTO payrolls (
    employee_id, month, year, basic_salary, hra, allowances, 
    deductions, net_salary, payment_status, payment_date, remarks
) VALUES
-- July 2026 (PAID)
(3, 7, 2026, 32500.00, 16250.00, 19500.00, 3250.00, 65000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073101'),
(4, 7, 2026, 29000.00, 14500.00, 17400.00, 2900.00, 58000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073102'),
(5, 7, 2026, 36000.00, 18000.00, 21600.00, 3600.00, 72000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073103'),
(6, 7, 2026, 22500.00, 11250.00, 13500.00, 2250.00, 45000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073104'),
(7, 7, 2026, 27500.00, 13750.00, 16500.00, 2750.00, 55000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073105'),
(8, 7, 2026, 39000.00, 19500.00, 23400.00, 3900.00, 78000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073106'),
(9, 7, 2026, 21000.00, 10500.00, 12600.00, 2100.00, 42000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073107'),
(10, 7, 2026, 31000.00, 15500.00, 18600.00, 3100.00, 62000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073108'),
(11, 7, 2026, 22000.00, 11000.00, 13200.00, 2200.00, 44000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073109'),
(12, 7, 2026, 30000.00, 15000.00, 18000.00, 3000.00, 60000.00, 'PAID', '2026-07-31', 'Direct bank transfer reference #NEFT2026073110'),

-- August 2026 (PROCESSED / PENDING)
(3, 8, 2026, 32500.00, 16250.00, 19500.00, 3250.00, 65000.00, 'PROCESSED', NULL, 'Payroll computed, awaiting bank batch release'),
(4, 8, 2026, 29000.00, 14500.00, 17400.00, 2900.00, 58000.00, 'PROCESSED', NULL, 'Payroll computed, awaiting bank batch release'),
(5, 8, 2026, 36000.00, 18000.00, 21600.00, 3600.00, 72000.00, 'PROCESSED', NULL, 'Payroll computed, awaiting bank batch release'),
(6, 8, 2026, 22500.00, 11250.00, 13500.00, 2250.00, 45000.00, 'PROCESSED', NULL, 'Payroll computed, awaiting bank batch release'),
(7, 8, 2026, 27500.00, 13750.00, 16500.00, 2750.00, 55000.00, 'PROCESSED', NULL, 'Payroll computed, awaiting bank batch release'),
(8, 8, 2026, 39000.00, 19500.00, 23400.00, 3900.00, 78000.00, 'PENDING', NULL, 'Pending overtime allowance audit'),
(9, 8, 2026, 21000.00, 10500.00, 12600.00, 2100.00, 42000.00, 'PROCESSED', NULL, 'Payroll computed, awaiting bank batch release'),
(10, 8, 2026, 31000.00, 15500.00, 18600.00, 3100.00, 62000.00, 'PROCESSED', NULL, 'Payroll computed, awaiting bank batch release'),
(11, 8, 2026, 22000.00, 11000.00, 13200.00, 2200.00, 44000.00, 'PROCESSED', NULL, 'Payroll computed, awaiting bank batch release'),
(12, 8, 2026, 30000.00, 15000.00, 18000.00, 3000.00, 60000.00, 'PROCESSED', NULL, 'Payroll computed, awaiting bank batch release');

-- ----------------------------------------------------------------------------
-- 9. Insert Documents (Profile Documents)
-- Fictional paths for Offer Letter, ID Proof, Resume, Contract, Salary Slip
-- ----------------------------------------------------------------------------
INSERT INTO documents (employee_id, document_name, document_type, document_url, uploaded_at) VALUES
(3, 'Aarav_Sharma_Offer_Letter.pdf', 'OFFER_LETTER', 'https://storage.dayflow.demo/docs/EMP001/offer_letter.pdf', '2023-01-05 10:00:00+05:30'),
(3, 'Aarav_Sharma_Aadhar_Card.pdf', 'ID_PROOF', 'https://storage.dayflow.demo/docs/EMP001/id_proof.pdf', '2023-01-08 14:30:00+05:30'),
(3, 'Aarav_Sharma_Resume.pdf', 'RESUME', 'https://storage.dayflow.demo/docs/EMP001/resume.pdf', '2023-01-04 11:20:00+05:30'),

(4, 'Ananya_Rao_Offer_Letter.pdf', 'OFFER_LETTER', 'https://storage.dayflow.demo/docs/EMP002/offer_letter.pdf', '2023-02-10 11:00:00+05:30'),
(4, 'Ananya_Rao_Passport.pdf', 'ID_PROOF', 'https://storage.dayflow.demo/docs/EMP002/passport.pdf', '2023-02-12 16:15:00+05:30'),
(4, 'Ananya_Rao_Portfolio.pdf', 'RESUME', 'https://storage.dayflow.demo/docs/EMP002/portfolio.pdf', '2023-02-08 15:00:00+05:30'),

(5, 'Rohan_Mehta_Employment_Contract.pdf', 'CONTRACT', 'https://storage.dayflow.demo/docs/EMP003/contract.pdf', '2022-05-25 12:00:00+05:30'),
(5, 'Rohan_Mehta_Salary_Slip_July2026.pdf', 'SALARY_SLIP', 'https://storage.dayflow.demo/docs/EMP003/payslip_jul2026.pdf', '2026-07-31 18:30:00+05:30'),

(6, 'Diya_Nair_Offer_Letter.pdf', 'OFFER_LETTER', 'https://storage.dayflow.demo/docs/EMP004/offer_letter.pdf', '2023-04-28 10:45:00+05:30'),
(7, 'Arjun_Patel_Professional_Cert.pdf', 'RESUME', 'https://storage.dayflow.demo/docs/EMP005/certifications.pdf', '2022-11-10 13:20:00+05:30'),
(8, 'Sneha_Iyer_Offer_Letter.pdf', 'OFFER_LETTER', 'https://storage.dayflow.demo/docs/EMP006/offer_letter.pdf', '2021-08-15 09:30:00+05:30'),
(9, 'Kabir_Singh_ID_Proof.pdf', 'ID_PROOF', 'https://storage.dayflow.demo/docs/EMP007/id_proof.pdf', '2023-04-05 14:00:00+05:30'),
(10, 'Kavya_Reddy_Degree_Cert.pdf', 'RESUME', 'https://storage.dayflow.demo/docs/EMP008/degree.pdf', '2023-02-25 11:30:00+05:30'),
(11, 'Rahul_Verma_Contract.pdf', 'CONTRACT', 'https://storage.dayflow.demo/docs/EMP009/contract.pdf', '2023-07-10 16:45:00+05:30'),
(12, 'Ishita_Kapoor_Offer_Letter.pdf', 'OFFER_LETTER', 'https://storage.dayflow.demo/docs/EMP010/offer_letter.pdf', '2022-08-25 10:15:00+05:30');

-- ----------------------------------------------------------------------------
-- 10. Insert Notifications (Email & Notification Alerts)
-- ----------------------------------------------------------------------------
INSERT INTO notifications (
    user_id, title, message, notification_type, related_entity_type, related_entity_id, is_read, created_at
) VALUES
-- HR/Admin notifications
(2, 'Leave Request Awaiting Review', 'Rohan Mehta (EMP003) submitted a Paid Leave request for Sep 1 - Sep 3.', 'LEAVE_SUBMITTED', 'LEAVE', '1', FALSE, '2026-08-20 10:15:00+05:30'),
(2, 'Leave Request Awaiting Review', 'Sneha Iyer (EMP006) submitted a Sick Leave request for Aug 24 - Aug 25.', 'LEAVE_SUBMITTED', 'LEAVE', '5', FALSE, '2026-08-21 09:30:00+05:30'),
(2, 'August Payroll Batch Ready', 'August 2026 payroll batch calculation completed. 9 records processed, 1 pending review.', 'PAYROLL_UPDATED', 'PAYROLL', '2026_8', TRUE, '2026-08-21 17:45:00+05:30'),
(1, 'System Audit Alert', 'New employee profile and salary structure configured for EMP010.', 'GENERAL', 'EMPLOYEE', '12', TRUE, '2026-08-18 11:20:00+05:30'),

-- Employee notifications
(3, 'Leave Approved', 'Your Paid Leave for Jul 16 - Jul 17 has been approved by Priya Menon.', 'LEAVE_APPROVED', 'LEAVE', '6', TRUE, '2026-07-14 10:00:00+05:30'),
(3, 'Salary Credited', 'Your salary for the month of July 2026 (INR 65,000) has been processed.', 'PAYROLL_UPDATED', 'PAYROLL', '1', TRUE, '2026-07-31 18:00:00+05:30'),
(4, 'Leave Approved', 'Your Paid Leave for Jul 22 - Jul 23 has been approved.', 'LEAVE_APPROVED', 'LEAVE', '3', TRUE, '2026-07-20 11:15:00+05:30'),
(4, 'Attendance Reminder', 'Please remember to punch in before 09:30 AM to maintain punctuality.', 'ATTENDANCE', 'ATTENDANCE', NULL, FALSE, '2026-08-22 08:30:00+05:30'),
(5, 'Attendance Marked', 'You checked in today at 09:05 AM. Have a productive day!', 'ATTENDANCE', 'ATTENDANCE', NULL, TRUE, '2026-08-12 09:05:00+05:30'),
(6, 'Leave Approved', 'Your Sick Leave for Aug 10 - Aug 11 has been approved by Meera Joshi.', 'LEAVE_APPROVED', 'LEAVE', '2', TRUE, '2026-08-09 16:30:00+05:30'),
(9, 'Leave Request Rejected', 'Your Unpaid Leave for Aug 25 - Aug 28 was rejected. Comment: Critical quarter-end sales drive.', 'LEAVE_REJECTED', 'LEAVE', '4', FALSE, '2026-08-15 14:05:00+05:30'),
(10, 'Leave Approved', 'Your Sick Leave for Aug 5 has been approved.', 'LEAVE_APPROVED', 'LEAVE', '8', TRUE, '2026-08-05 08:30:00+05:30'),
(11, 'Leave Request Rejected', 'Your Unpaid Leave for Aug 18 - Aug 20 was rejected due to client demos.', 'LEAVE_REJECTED', 'LEAVE', '9', TRUE, '2026-08-14 17:10:00+05:30'),
(12, 'Salary Structure Updated', 'Your revised annual CTC and monthly salary breakdown has been updated in the portal.', 'PAYROLL_UPDATED', 'SALARY_STRUCTURE', '12', TRUE, '2026-08-01 10:00:00+05:30');

-- ----------------------------------------------------------------------------
-- 11. Insert Audit / Activity Logs (Dashboard Recent Activities & System Audit)
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(1, 'USER_LOGIN', 'USER', '1', '{"browser": "Chrome 128 on Windows 11", "status": "SUCCESS"}', '192.168.1.10', '2026-08-22 08:30:00+05:30'),
(2, 'USER_LOGIN', 'USER', '2', '{"browser": "Firefox 129 on macOS", "status": "SUCCESS"}', '192.168.1.15', '2026-08-22 08:45:00+05:30'),
(1, 'CREATE_EMPLOYEE', 'EMPLOYEE', '12', '{"employee_code": "EMP010", "name": "Ishita Kapoor", "role": "Product Designer"}', '192.168.1.10', '2026-08-01 09:30:00+05:30'),
(1, 'UPDATE_SALARY', 'SALARY_STRUCTURE', '12', '{"employee_id": 12, "net_salary": 60000.00, "currency": "INR"}', '192.168.1.10', '2026-08-01 10:00:00+05:30'),
(1, 'APPROVE_LEAVE', 'LEAVE', '3', '{"leave_id": 3, "employee_code": "EMP002", "days": 2}', '192.168.1.10', '2026-07-20 11:15:00+05:30'),
(2, 'APPROVE_LEAVE', 'LEAVE', '2', '{"leave_id": 2, "employee_code": "EMP004", "type": "SICK"}', '192.168.1.15', '2026-08-09 16:30:00+05:30'),
(2, 'REJECT_LEAVE', 'LEAVE', '4', '{"leave_id": 4, "employee_code": "EMP007", "reason": "Quarter-end sales push"}', '192.168.1.15', '2026-08-15 14:00:00+05:30'),
(1, 'PROCESS_PAYROLL', 'PAYROLL', 'JULY_2026', '{"total_employees": 10, "total_disbursement": 581000.00, "status": "PAID"}', '192.168.1.10', '2026-07-31 18:00:00+05:30'),
(2, 'MODIFY_ATTENDANCE', 'ATTENDANCE', 'EMP007_20260728', '{"employee_id": 9, "date": "2026-07-28", "status": "ABSENT"}', '192.168.1.15', '2026-07-29 10:00:00+05:30'),
(2, 'UPLOAD_DOCUMENT', 'DOCUMENT', '15', '{"employee_code": "EMP010", "document_type": "OFFER_LETTER"}', '192.168.1.15', '2026-08-01 10:15:00+05:30');
