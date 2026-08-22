# Dayflow HRMS - Complete Backend API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require the following header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 1. Authentication & Session (`/api/auth`)

### `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticate using work email and password.
- **Request Body**:
```json
{
  "email": "priya.menon@dayflow.demo",
  "password": "Password@123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": 2,
    "email": "priya.menon@dayflow.demo",
    "role": "ADMIN",
    "employee": {
      "id": 2,
      "employee_code": "EMP002",
      "first_name": "Priya",
      "last_name": "Menon",
      "department_name": "Human Resources"
    }
  }
}
```

### `GET /api/auth/me`
- **Access**: Authenticated
- **Description**: Fetch current logged-in user profile, permissions, and employee info.

---

## 2. Dashboard & Action Items (`/api/dashboard`)

### `GET /api/dashboard/employee`
- **Access**: Employee
- **Description**: Employee personalized dashboard cards: today's check-in status, attendance statistics for the month, recent leaves, latest payroll status, unread alerts, recent activity.

### `GET /api/dashboard/admin`
- **Access**: Admin / HR
- **Description**: Company-wide executive summary: active headcount, department counts, pending leave requests count, today's present/absent summary, recent employees preview, recent audit log.

### `GET /api/dashboard/admin/action-items`
- **Access**: Admin / HR
- **Description**: Live actionable alerts requiring urgent review:
  - Pending leave approvals
  - Unexplained absences today
  - Incomplete employee profiles (missing bank/PAN details)
  - Unconfigured salary structures

### `GET /api/dashboard/activity`
- **Access**: Authenticated
- **Description**: Chronological stream of system audit events with actor emails, actions, and timestamps.

---

## 3. Dynamic Analytics (`/api/analytics`)

### `GET /api/analytics/attendance`
- **Access**: Role-aware (Employee: self stats; Admin/HR: organization-wide)
- **Query Parameters**:
  - `start_date` (YYYY-MM-DD)
  - `end_date` (YYYY-MM-DD)
  - `year` (YYYY)
  - `department_id` (Number, Admin/HR only)
- **Response (Admin/HR)**:
  - `summary`: Total records, present count, half-day count, leave count, absent count, overall attendance percentage.
  - `department_breakdown`: Per-department attendance rates and counts.
  - `daily_trend`: 14-day chronological attendance distribution.

### `GET /api/analytics/leaves`
- **Access**: Role-aware (Employee: personal balances; Admin/HR: organization-wide)
- **Query Parameters**: `year`, `department_id`
- **Response**: Total requests, approval rate %, breakdown by type (`PAID`, `SICK`, `UNPAID`), monthly trends, remaining leave balances.

### `GET /api/analytics/payroll`
- **Access**: Admin / HR Only
- **Query Parameters**: `year`, `month`
- **Response**: Total payroll outlay, average net salary, min/max salary, status breakdown (`PAID`, `PROCESSED`, `PENDING`), department salary distribution, monthly payout trajectory.

### `GET /api/analytics/overview`
- **Access**: Admin / HR Only
- **Description**: High-level counters for dashboard header metrics.

---

## 4. Reports, Salary Slips & CSV Exports (`/api/reports`)

### `GET /api/reports/attendance`
- **Access**: Role-aware (Employee: self records; Admin/HR: company records)
- **Query Parameters**:
  - `start_date`, `end_date`
  - `department_id`, `employee_id`, `status`
  - `format`: `'json'` (default) or `'csv'`
- **CSV Download**: Returns `Content-Type: text/csv` with `Content-Disposition: attachment; filename="attendance_report_<date>.csv"`.

### `GET /api/reports/leaves`
- **Access**: Role-aware (Employee: self; Admin/HR: all)
- **Query Parameters**:
  - `start_date`, `end_date`, `department_id`, `employee_id`, `leave_type`, `status`
  - `format`: `'json'` or `'csv'`

### `GET /api/reports/payroll`
- **Access**: Admin / HR Only
- **Query Parameters**: `month`, `year`, `department_id`, `payment_status`, `format`
- **Description**: Financial payroll report with basic salary, HRA, allowances, deductions, net salary, and payment status.

### `GET /api/reports/payroll/:employeeId/slip`
- **Access**: Role-aware (Employee: only own `employeeId`; Admin/HR: any `employeeId`)
- **Query Parameters**:
  - `month` (1-12, required)
  - `year` (YYYY, required)
- **Response**:
```json
{
  "success": true,
  "data": {
    "slip_number": "SLIP-2026-08-EMP001",
    "pay_period": "August 2026",
    "company": {
      "name": "Dayflow HRMS Technologies Pvt. Ltd.",
      "address": "Tower 4, Embassy TechVillage, Bangalore - 560103",
      "tax_id": "GSTIN29AABCT1332L1ZV"
    },
    "employee": {
      "code": "EMP001",
      "name": "Aarav Sharma",
      "department": "Engineering",
      "designation": "Lead Software Engineer",
      "bank_details": {
        "account_number": "XXXX-XXXX-8921",
        "ifsc": "HDFC0001234"
      }
    },
    "earnings": [
      { "item": "Basic Salary", "amount": 60000 },
      { "item": "House Rent Allowance (HRA)", "amount": 25000 },
      { "item": "Special & Conveyance Allowances", "amount": 10000 }
    ],
    "total_gross_earnings": 95000,
    "deductions": [
      { "item": "Provident Fund / Statutory Deductions", "amount": 7500 }
    ],
    "total_deductions": 7500,
    "net_salary": 87500,
    "net_salary_in_words": "Eighty-Seven Thousand Five Hundred Rupees Only",
    "payment_status": "PAID",
    "payment_date": "2026-08-31"
  }
}
```

---

## 5. Notifications & Alerts (`/api/notifications`)

### `GET /api/notifications`
- **Access**: Authenticated
- **Query Parameters**: `unread_only=true|false`, `type`, `limit`, `offset`
- **Response**: List of notifications, total count, and unread count.

### `GET /api/notifications/unread-count`
- **Access**: Authenticated
- **Response**: `{ "success": true, "unread_count": 3 }`

### `PUT /api/notifications/:id/read`
- **Access**: Authenticated
- **Description**: Mark a single notification as read.

### `PUT /api/notifications/read-all` (or `/mark-all-read`)
- **Access**: Authenticated
- **Description**: Mark all notifications for the active user as read.

### `DELETE /api/notifications/:id`
- **Access**: Authenticated
- **Description**: Delete a notification.

---

## 6. Leaves Management (`/api/leaves`)

- `POST /api/leaves`: Apply for leave (Employee). Triggers `LEAVE_SUBMITTED` notification + email to HR/Admin.
- `GET /api/leaves/my`: View leave history (Employee).
- `GET /api/leaves`: View all leave requests with filters (Admin/HR).
- `PUT /api/leaves/:id/review`: Approve/Reject leave (Admin/HR). Triggers `LEAVE_APPROVED` / `LEAVE_REJECTED` notification + HTML email to applicant.

---

## 7. Attendance Tracking (`/api/attendance`)

- `POST /api/attendance/check-in`: Clock in for the current day.
- `POST /api/attendance/check-out`: Clock out for the day (computes hours & status).
- `GET /api/attendance/my`: View personal daily/weekly attendance logs.
- `GET /api/attendance/all`: View organization attendance records with filters (Admin/HR).
- `PUT /api/attendance/:id`: Regularize or correct attendance record (Admin/HR).

---

## 8. Payroll Management (`/api/payroll`)

- `GET /api/payroll/my`: View personal monthly paysheets (Employee).
- `GET /api/payroll/my/structure`: View base salary compensation package (Employee).
- `GET /api/payroll`: View all payroll records (Admin/HR).
- `PUT /api/payroll/structure/:employeeId`: Update base salary components (Admin). Triggers `PAYROLL_UPDATED` notification.
- `POST /api/payroll/process-batch`: Generate batch monthly payrolls for all active employees (Admin).
- `PUT /api/payroll/:id/status`: Update payment status (e.g. mark as `PAID`). Triggers `SALARY_CREDITED` notification + HTML email alert.
