# Dayflow HRMS - Human Resource Management System

A full-stack enterprise Human Resource Management System (HRMS) featuring a modern **Next.js + Tailwind CSS** frontend and a robust **Node.js + Express + PostgreSQL** backend.

---

## 🏗️ Project Architecture

```
odoo-HRM/
├── frontend/                # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/             # Routes: /dashboard, /login, /register, /attendance, /leaves, /payroll, /reports, /notifications
│   │   ├── components/      # UI components (Admin & Employee dashboards, cards, tables, dialogs)
│   │   ├── contexts/        # AuthContext & State management
│   │   └── lib/             # Mock Data, Types, Utilities
│   ├── package.json
│   └── tsconfig.json
├── backend/                 # Node.js + Express Backend
│   ├── src/
│   │   ├── config/          # PostgreSQL database connection pool
│   │   ├── controllers/     # Auth, Dashboard, Attendance, Leaves, Payroll, Reports, Notifications, Analytics, Documents, Audit
│   │   ├── middleware/      # JWT Authentication & RBAC role guards
│   │   ├── routes/          # Express REST API endpoints
│   │   ├── services/        # Email service abstraction & templates
│   │   └── utils/           # Notifier engine, Audit logger
│   ├── package.json
│   └── .env
├── schema.sql               # PostgreSQL Database Schema
├── seed.sql                 # Sample Data & Demo Accounts
├── API.md                   # Full REST API Documentation
└── README.md
```

---

## 🚀 Getting Started

### 1. Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Run the Next.js development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) (or the port displayed in the terminal) in your browser.

---

### 2. Backend (Node.js + PostgreSQL)

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Setup database schema & seed data:
   ```bash
   npm run db:setup
   ```

3. Start backend API server:
   ```bash
   npm run dev
   ```
   - Healthcheck: [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - API Reference: See [`API.md`](./API.md)

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `priya.menon@dayflow.demo` | `Password@123` | Full HRMS Organization Access |
| **HR Officer** | `rohit.sharma@dayflow.demo` | `Password@123` | HR Approvals, Analytics, Reports |
| **Employee** | `aarav@dayflow.demo` | `Password@123` | Self Attendance, Leaves, Payslips |

---

## 📄 Documentation

- [Backend API Reference](./API.md)
- [Database Schema (SQL)](./schema.sql)
- [Database Seed Data (SQL)](./seed.sql)
