const http = require('http');
const app = require('../server');

let server;
const PORT = 5001;

function makeRequest({ path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
      ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
    };

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Dayflow HRMS Backend Automated Verification');
  console.log('======================================================\n');

  server = app.listen(PORT);
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  try {
    let adminToken = '';
    let employeeToken = '';

    // 1. Healthcheck
    await test('Health Check (GET /api/health)', async () => {
      const res = await makeRequest({ path: '/api/health' });
      if (res.status !== 200 || res.data.status !== 'UP') {
        throw new Error(`Unexpected response: ${JSON.stringify(res)}`);
      }
    });

    // 2. Admin Login
    await test('Admin Login (POST /api/auth/login)', async () => {
      const res = await makeRequest({
        path: '/api/auth/login',
        method: 'POST',
        body: { email: 'priya.menon@dayflow.demo', password: 'Password@123' },
      });
      if (res.status !== 200 || !res.data.token || res.data.user.role !== 'ADMIN') {
        throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
      }
      adminToken = res.data.token;
    });

    // 3. Employee Login
    await test('Employee Login (POST /api/auth/login)', async () => {
      const res = await makeRequest({
        path: '/api/auth/login',
        method: 'POST',
        body: { email: 'aarav@dayflow.demo', password: 'Password@123' },
      });
      if (res.status !== 200 || !res.data.token || res.data.user.role !== 'EMPLOYEE') {
        throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
      }
      employeeToken = res.data.token;
    });

    // 4. Session Profile
    await test('Get Authenticated Session Profile (GET /api/auth/me)', async () => {
      const res = await makeRequest({
        path: '/api/auth/me',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || res.data.user.employee.employee_code !== 'EMP001') {
        throw new Error(`Invalid profile data: ${JSON.stringify(res.data)}`);
      }
    });

    // 5. Employee Dashboard
    await test('Employee Dashboard (GET /api/dashboard/employee)', async () => {
      const res = await makeRequest({
        path: '/api/dashboard/employee',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || !res.data.data.attendance_stats) {
        throw new Error(`Failed to load employee dashboard: ${JSON.stringify(res.data)}`);
      }
    });

    // 6. Admin Dashboard
    await test('Admin Dashboard (GET /api/dashboard/admin)', async () => {
      const res = await makeRequest({
        path: '/api/dashboard/admin',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.data.summary) {
        throw new Error(`Failed to load admin dashboard: ${JSON.stringify(res.data)}`);
      }
    });

    // 7. RBAC Check (Employee forbidden from Admin dashboard)
    await test('RBAC Guard: Employee forbidden from Admin Dashboard', async () => {
      const res = await makeRequest({
        path: '/api/dashboard/admin',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 8. List Employees (Admin)
    await test('List All Employees (GET /api/employees)', async () => {
      const res = await makeRequest({
        path: '/api/employees',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || res.data.employees.length === 0) {
        throw new Error(`Failed to list employees: ${JSON.stringify(res.data)}`);
      }
    });

    // 9. Employee Self Attendance History
    await test('Get Employee Attendance History (GET /api/attendance/my)', async () => {
      const res = await makeRequest({
        path: '/api/attendance/my?view=daily',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || !Array.isArray(res.data.attendance)) {
        throw new Error(`Failed to fetch attendance: ${JSON.stringify(res.data)}`);
      }
    });

    // 10. Leave Application Workflow
    let newLeaveId = null;
    await test('Apply for Leave (POST /api/leaves)', async () => {
      const res = await makeRequest({
        path: '/api/leaves',
        method: 'POST',
        headers: { Authorization: `Bearer ${employeeToken}` },
        body: {
          leave_type: 'PAID',
          start_date: '2026-09-15',
          end_date: '2026-09-16',
          reason: 'Automated API Verification Leave Request',
        },
      });
      if (res.status !== 201 || !res.data.leave.id) {
        throw new Error(`Failed to apply leave: ${JSON.stringify(res.data)}`);
      }
      newLeaveId = res.data.leave.id;
    });

    // 11. Admin Review Leave Request
    await test('Admin Review Leave (PUT /api/leaves/:id/review)', async () => {
      const res = await makeRequest({
        path: `/api/leaves/${newLeaveId}/review`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          status: 'APPROVED',
          reviewer_comment: 'Approved during automated verification test.',
        },
      });
      if (res.status !== 200 || res.data.leave.status !== 'APPROVED') {
        throw new Error(`Failed to approve leave: ${JSON.stringify(res.data)}`);
      }
    });

    // 12. Employee View Payroll (Read-only)
    await test('Employee View Payroll (GET /api/payroll/my)', async () => {
      const res = await makeRequest({
        path: '/api/payroll/my',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || !Array.isArray(res.data.payrolls)) {
        throw new Error(`Failed to get payrolls: ${JSON.stringify(res.data)}`);
      }
    });

    // 13. Employee Notifications
    await test('Get Notifications (GET /api/notifications)', async () => {
      const res = await makeRequest({
        path: '/api/notifications',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || !Array.isArray(res.data.notifications)) {
        throw new Error(`Failed to get notifications: ${JSON.stringify(res.data)}`);
      }
    });

    // 14. Departments & Designations
    await test('Get Departments & Designations (GET /api/departments)', async () => {
      const res = await makeRequest({
        path: '/api/departments',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || res.data.departments.length === 0) {
        throw new Error(`Failed to get departments: ${JSON.stringify(res.data)}`);
      }
    });

    console.log('\n------------------------------------------------------');
    console.log(`Results: ${passed} passed, ${failed} failed.`);
    console.log('------------------------------------------------------\n');
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
