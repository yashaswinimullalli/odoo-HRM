# 🌟 Dayflow HRMS — Enterprise Human Resource Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-odoo--hrm.vercel.app-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://odoo-hrm.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render%20Live-46e3b7?style=for-the-badge&logo=render&logoColor=black)](https://odoo-hrm.onrender.com/api/health)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015%20%7C%20React%2019-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> **Every workday, perfectly aligned.**  
> **Dayflow HRMS** is an enterprise-grade Human Resource Management System designed with a high-performance **Next.js 15 + Tailwind CSS v4** frontend and a scalable, secure **Node.js + Express + PostgreSQL** backend.

---

## 🔗 Live Deployment & Quick Links

| Service | URL | Status |
| :--- | :--- | :--- |
| 🚀 **Live Web Application (Frontend)** | [https://odoo-hrm.vercel.app](https://odoo-hrm.vercel.app) | ![Vercel](https://img.shields.io/badge/Vercel-Operational-success) |
| 🔌 **Backend REST API** | [https://odoo-hrm.onrender.com](https://odoo-hrm.onrender.com) | ![Render](https://img.shields.io/badge/Render-Online-success) |
| 🩺 **API Health Check & Status** | [https://odoo-hrm.onrender.com/api/health](https://odoo-hrm.onrender.com/api/health) | ![Database](https://img.shields.io/badge/PostgreSQL-Connected-success) |
| 📂 **GitHub Repository** | [https://github.com/yashaswinimullalli/odoo-HRM](https://github.com/yashaswinimullalli/odoo-HRM) | ![Repo](https://img.shields.io/badge/GitHub-Public-blue) |

---

## 🔑 Demo Access Credentials

You can test all system capabilities immediately using the pre-configured accounts:

| Role | Work Email / ID | Password | Access & Privileges |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `priya.menon@dayflow.demo` | `Password@123` | Full HRMS Organization access, employee management, leave approvals, payroll generation, company analytics. |
| 🛡️ **HR Officer** | `rohit.sharma@dayflow.demo` | `Password@123` | Leave review workflow, employee records, attendance monitoring, payroll processing & reports. |
| 👤 **Employee** | `aarav@dayflow.demo` *(or `EMP001`)* | `Password@123` | Personal dashboard, one-click attendance check-in/out, leave requests, salary slip inspection, profile management. |

> 💡 *A quick-login selector is also embedded directly on the login screen for 1-click credential auto-fill.*

---

## ✨ Core Features & Highlights

### 1. 🛡️ Role-Based Access Control (RBAC) & Authentication
- Secure JWT-based session management with encrypted bcrypt password hashing.
- Strictly guarded role privileges distinguishing **Admin**, **HR Officer**, and **Employee** capabilities.
- Auto-redirect and session persistence across page refreshes.

### 2. ⏱️ Real-time Attendance & Working Hours Tracking
- One-click daily **Check-In** and **Check-Out** with live time-stamps.
- Automated daily status calculation (`Present`, `Half-day`, `Absent`, `Leave`).
- Working hours computation, historical calendar view, and admin organization-wide attendance ledger.

### 3. 🌴 Streamlined Leave Management Workflow
- Employee self-service leave application for **Paid Leave**, **Sick Leave**, and **Unpaid Leave**.
- Admin / HR review portal with instant **Approval** / **Rejection** and audit comments.
- Dynamic balance deductions and leave history logs synchronized with live database records.

### 4. 💰 Automated Enterprise Payroll & Salary Slips
- Flexible salary structure configuration (Basic Salary, HRA, Allowances, Deductions, Net Salary).
- Monthly payroll generation, disbursement status monitoring, and breakdown previews.
- Instant itemized salary slip generation viewable by both employees and administrators.

### 5. 📊 Executive Analytics & Live PostgreSQL Sync
- Organization KPIs: Total Workforce, Active On-Duty Count, Pending Leave Approvals, Total Monthly Payroll Outflow.
- Interactive **Recharts** charts for department distribution, monthly attendance trends, and payroll allocations.
- Real-time aggregation backed by PostgreSQL relational queries.

### 6. 🎨 Modern Glassmorphic UI / UX
- Responsive design tailored for desktops, tablets, and mobile screens.
- Modern dark-mode-first aesthetic with smooth micro-interactions, shimmer effects, and toast notifications.
- Accessible modals, sheet dialogs, and mobile card view adaptations for complex data tables.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components & Icons**: Radix UI primitives, [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Hosting**: [Vercel](https://vercel.com/)

### **Backend**
- **Runtime & Server**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (`pg` connection pool with SSL support)
- **Security & Auth**: JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing, CORS whitelist
- **Hosting**: [Render](https://render.com/)

---

## 🏗️ Project Structure

```
odoo-HRM/
├── frontend/                     # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/                  # Application Routes
│   │   │   ├── dashboard/        # Main Dashboard Layout & Sub-modules
│   │   │   │   ├── attendance/   # Attendance Clock-in & Logs
│   │   │   │   ├── employees/    # Employee Directory & Profiles
│   │   │   │   ├── leaves/       # Leave Applications & Approvals
│   │   │   │   ├── notifications/# Notifications Center
│   │   │   │   ├── payroll/      # Payroll Processing & Payslips
│   │   │   │   ├── profile/      # User Profile Management
│   │   │   │   └── reports/      # Analytics & Executive Reports
│   │   │   ├── login/            # Sign In Page with Quick-Demo access
│   │   │   ├── register/         # Employee Onboarding & Registration
│   │   │   └── layout.tsx        # Root Application Layout & Providers
│   │   ├── components/           # Reusable UI Components & Navigation
│   │   ├── contexts/             # AuthContext & Session State
│   │   └── lib/                  # API Client, Types, and Utilities
│   ├── package.json
│   └── tsconfig.json
├── backend/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/               # PostgreSQL Pool & Environment Config
│   │   ├── controllers/          # Controllers (Auth, Attendance, Leaves, Payroll, Reports, Employees)
│   │   ├── middleware/           # JWT Auth & Role Authorization Guards
│   │   ├── routes/               # Express REST Endpoints
│   │   ├── scripts/              # Migration, Seeding, and Verification Scripts
│   │   └── server.js             # Express App Entrypoint & Healthcheck
│   ├── package.json
│   └── .env.example
├── database/                     # Database Backups & Reference Schemas
├── schema.sql                    # Production PostgreSQL DDL Schema
├── seed.sql                      # Demo Users, Departments & Sample Records
├── API.md                        # Complete Backend REST API Reference
└── README.md                     # Project Documentation
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **PostgreSQL**: `v14.x` or higher (or cloud instance like Neon / Supabase / Render)
- **Git**

---

### 2. Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```
   *Example `.env`:*
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/dayflow
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Initialize & Seed Database**:
   ```bash
   npm run db:setup
   ```

5. **Start the Backend Server**:
   ```bash
   npm run dev
   ```
   - Server running at: `http://localhost:5000`
   - Healthcheck: `http://localhost:5000/api/health`

---

### 3. Frontend Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
   *(For connecting to live cloud backend, set to `https://odoo-hrm.onrender.com/api`)*

4. **Start the Next.js Dev Server**:
   ```bash
   npm run dev
   ```

5. **Open the Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference Overview

The backend provides a full suite of authenticated REST endpoints:

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | User login & JWT issuance |
| **Auth** | `POST` | `/api/auth/register` | Register new employee |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile |
| **Dashboard** | `GET` | `/api/dashboard/admin` | Admin KPI statistics & quick actions |
| **Dashboard** | `GET` | `/api/dashboard/employee` | Employee personalized dashboard & stats |
| **Attendance**| `GET` | `/api/attendance/my` | Current user attendance history |
| **Attendance**| `POST`| `/api/attendance/check-in`| Clock-in for current day |
| **Attendance**| `POST`| `/api/attendance/check-out`| Clock-out for current day |
| **Leaves** | `GET` | `/api/leaves` | List all leave requests *(Admin/HR)* |
| **Leaves** | `POST` | `/api/leaves` | Submit new leave application |
| **Leaves** | `PUT` | `/api/leaves/:id/review` | Approve or reject leave request |
| **Payroll** | `GET` | `/api/payroll` | View company payroll roll *(Admin/HR)* |
| **Payroll** | `GET` | `/api/payroll/my` | View personal payslips & salary structure |
| **Employees** | `GET` | `/api/employees` | List all active employees directory |
| **Employees** | `POST`| `/api/employees` | Create a new employee record *(Admin)* |
| **Reports** | `GET` | `/api/analytics/overview` | Organization analytics & metrics |

📖 *For exhaustive request/response schemas, refer to [`API.md`](./API.md).*

---

## 🗄️ Database Schema Summary

The database is built on relational PostgreSQL tables:
- **`users`**: System login credentials, user roles (`ADMIN`, `HR`, `EMPLOYEE`), and active status.
- **`employees`**: Employee code, contact details, designations, departments, and joining dates.
- **`departments` & `designations`**: Organizational hierarchy structures.
- **`attendance`**: Daily check-in/out timestamps, duration, and attendance status.
- **`leaves`**: Leave types, date ranges, reasons, approval status, and reviewer feedback.
- **`salary_structures` & `payrolls`**: Compensation breakdown, gross earnings, net pay, and payment logs.
- **`notifications`**: Real-time employee and administrative system alerts.
- **`audit_logs`**: System security and record modification history.

---

## 🚀 Deployment Instructions

### Deploy Frontend (Vercel)
1. Push codebase to GitHub.
2. Import repository into [Vercel](https://vercel.com).
3. Set Root Directory to `frontend`.
4. Configure Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://odoo-hrm.onrender.com/api`
5. Deploy.

### Deploy Backend (Render)
1. Create a **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository and set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=5000`).
6. Run migrations & seed data using the Render shell or connected PostgreSQL database.




