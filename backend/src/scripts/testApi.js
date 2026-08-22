const http = require('http');
const app = require('../server');

let server;
const PORT = 5002;

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
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('text/csv')) {
            resolve({ status: res.statusCode, raw: responseBody, headers: res.headers });
          } else {
            try {
              const parsed = JSON.parse(responseBody);
              resolve({ status: res.statusCode, data: parsed, headers: res.headers });
            } catch (e) {
              resolve({ status: res.statusCode, raw: responseBody, headers: res.headers });
            }
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
  console.log('\n================================================================');
  console.log('🧪 Starting Dayflow HRMS Backend Extended Automated Verification');
  console.log('================================================================\n');

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
    let employeeId = null;

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
      employeeId = res.data.user.employee.id;
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

    // 6. Admin Dashboard & Action Items
    await test('Admin Dashboard (GET /api/dashboard/admin)', async () => {
      const res = await makeRequest({
        path: '/api/dashboard/admin',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.data.summary) {
        throw new Error(`Failed to load admin dashboard: ${JSON.stringify(res.data)}`);
      }
    });

    await test('Admin Action Items (GET /api/dashboard/admin/action-items)', async () => {
      const res = await makeRequest({
        path: '/api/dashboard/admin/action-items',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.action_items) {
        throw new Error(`Failed to load action items: ${JSON.stringify(res.data)}`);
      }
    });

    // 7. Dynamic Analytics - Attendance
    await test('Attendance Analytics (Admin View: GET /api/analytics/attendance)', async () => {
      const res = await makeRequest({
        path: '/api/analytics/attendance',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.summary || !res.data.department_breakdown) {
        throw new Error(`Failed to load admin attendance analytics: ${JSON.stringify(res.data)}`);
      }
    });

    await test('Attendance Analytics (Employee View: GET /api/analytics/attendance)', async () => {
      const res = await makeRequest({
        path: '/api/analytics/attendance',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || res.data.role !== 'EMPLOYEE' || !res.data.summary) {
        throw new Error(`Failed to load employee attendance analytics: ${JSON.stringify(res.data)}`);
      }
    });

    // 8. Dynamic Analytics - Leaves
    await test('Leaves Analytics (Admin View: GET /api/analytics/leaves)', async () => {
      const res = await makeRequest({
        path: '/api/analytics/leaves',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.summary || !res.data.type_breakdown) {
        throw new Error(`Failed to load leave analytics: ${JSON.stringify(res.data)}`);
      }
    });

    await test('Leaves Analytics (Employee View: GET /api/analytics/leaves)', async () => {
      const res = await makeRequest({
        path: '/api/analytics/leaves',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || !res.data.leave_balances) {
        throw new Error(`Failed to load employee leave balances: ${JSON.stringify(res.data)}`);
      }
    });

    // 9. Dynamic Analytics - Payroll
    await test('Payroll Analytics (Admin View: GET /api/analytics/payroll)', async () => {
      const res = await makeRequest({
        path: '/api/analytics/payroll',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.summary || !res.data.department_distribution) {
        throw new Error(`Failed to load payroll analytics: ${JSON.stringify(res.data)}`);
      }
    });

    await test('RBAC Guard: Employee forbidden from Payroll Analytics', async () => {
      const res = await makeRequest({
        path: '/api/analytics/payroll',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 10. Reports & CSV Exports
    await test('Attendance Report JSON (GET /api/reports/attendance)', async () => {
      const res = await makeRequest({
        path: '/api/reports/attendance',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !Array.isArray(res.data.attendance)) {
        throw new Error(`Failed to load attendance report: ${JSON.stringify(res.data)}`);
      }
    });

    await test('Attendance Report CSV Export (GET /api/reports/attendance?format=csv)', async () => {
      const res = await makeRequest({
        path: '/api/reports/attendance?format=csv',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.raw.includes('Employee Code') || !res.raw.includes('Working Hours')) {
        throw new Error(`Failed to generate attendance CSV: ${res.raw}`);
      }
    });

    await test('Leaves Report CSV Export (GET /api/reports/leaves?format=csv)', async () => {
      const res = await makeRequest({
        path: '/api/reports/leaves?format=csv',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.raw.includes('Leave Type') || !res.raw.includes('Start Date')) {
        throw new Error(`Failed to generate leaves CSV: ${res.raw}`);
      }
    });

    await test('Payroll Report CSV Export (GET /api/reports/payroll?format=csv)', async () => {
      const res = await makeRequest({
        path: '/api/reports/payroll?format=csv',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.raw.includes('Basic Salary') || !res.raw.includes('Net Salary')) {
        throw new Error(`Failed to generate payroll CSV: ${res.raw}`);
      }
    });

    // 11. Salary Slip Generation & Ownership Verification
    await test('Employee Download Own Salary Slip (GET /api/reports/payroll/:id/slip)', async () => {
      const res = await makeRequest({
        path: `/api/reports/payroll/${employeeId}/slip?month=8&year=2026`,
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || !res.data.data.slip_number || !res.data.data.net_salary_in_words) {
        throw new Error(`Failed to generate salary slip: ${JSON.stringify(res.data)}`);
      }
    });

    await test('RBAC Guard: Employee forbidden from viewing other employee salary slip', async () => {
      const res = await makeRequest({
        path: `/api/reports/payroll/2/slip?month=8&year=2026`,
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 12. Notification Center Workflows
    await test('Get Unread Notifications Count (GET /api/notifications/unread-count)', async () => {
      const res = await makeRequest({
        path: '/api/notifications/unread-count',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || typeof res.data.unread_count !== 'number') {
        throw new Error(`Failed to get unread count: ${JSON.stringify(res.data)}`);
      }
    });

    await test('Mark All Notifications as Read (PUT /api/notifications/read-all)', async () => {
      const res = await makeRequest({
        path: '/api/notifications/read-all',
        method: 'PUT',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (res.status !== 200 || !res.data.success) {
        throw new Error(`Failed to mark notifications read: ${JSON.stringify(res.data)}`);
      }
    });

    // 13. Recent Activity Stream
    await test('System Activity Feed (GET /api/dashboard/activity)', async () => {
      const res = await makeRequest({
        path: '/api/dashboard/activity',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !Array.isArray(res.data.activities)) {
        throw new Error(`Failed to load activity feed: ${JSON.stringify(res.data)}`);
      }
    });

    console.log('\n----------------------------------------------------------------');
    console.log(`🎉 All Tests Complete: ${passed} passed, ${failed} failed.`);
    console.log('----------------------------------------------------------------\n');
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
