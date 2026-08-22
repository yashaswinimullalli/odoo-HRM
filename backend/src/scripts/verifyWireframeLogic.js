const http = require('http');

function postJson(path, data, token = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function verify() {
  console.log('🧪 Testing Login ID / Email Sign In and Auto-ID Generation...\n');

  // 1. Test Login with Email
  const loginEmailRes = await postJson('/api/auth/login', {
    identifier: 'priya.menon@dayflow.demo',
    password: 'Password@123',
  });
  console.log('1. Login with Email:', loginEmailRes.status === 200 ? '✅ SUCCESS' : '❌ FAILED', loginEmailRes.data?.user?.email);
  const adminToken = loginEmailRes.data?.token;

  // 2. Test Login with Login ID
  const loginIdRes = await postJson('/api/auth/login', {
    identifier: 'EMP001',
    password: 'Password@123',
  });
  console.log('2. Login with Login ID (EMP001):', loginIdRes.status === 200 ? '✅ SUCCESS' : '❌ FAILED', loginIdRes.data?.user?.employee?.employee_code);

  // 3. Test Create Employee with Auto Login ID Generation (Formula: [CompanyPrefix][First2First][First2Last][Year][Serial])
  const createEmpRes = await postJson(
    '/api/employees',
    {
      company_name: 'Odoo India',
      first_name: 'John',
      last_name: 'Doe',
      email: `john.doe.${Date.now()}@odoo.demo`,
      phone: '+91 9876543210',
      department_id: 1,
      designation_id: 1,
      joining_date: '2022-06-15',
      basic_salary: 80000,
    },
    adminToken
  );
  console.log('3. Create Employee with Auto ID Generator:', createEmpRes.status === 201 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('   Generated Login ID:', createEmpRes.data?.credentials?.login_id);
  console.log('   Generated Temp Password:', createEmpRes.data?.credentials?.temporary_password);

  // 4. Test Sign In with newly generated Login ID (e.g. OIJODO20220001)
  const newLoginRes = await postJson('/api/auth/login', {
    identifier: createEmpRes.data?.credentials?.login_id,
    password: createEmpRes.data?.credentials?.temporary_password,
  });
  console.log('4. Sign In with New Auto-Generated Login ID:', newLoginRes.status === 200 ? '✅ SUCCESS' : '❌ FAILED', newLoginRes.data?.user?.email);

  // 5. Test Company Sign Up
  const companySignupRes = await postJson('/api/auth/register', {
    company_name: 'Odoo India Pvt Ltd',
    name: 'Jane Smith',
    email: `jane.smith.${Date.now()}@odoo.demo`,
    phone: '+91 9876500000',
    password: 'Password@123',
  });
  console.log('5. Company Sign Up:', companySignupRes.status === 201 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('   Generated Admin Login ID:', companySignupRes.data?.login_id);

  console.log('\n🎉 Verification completed successfully!');
}

verify().catch(console.error);
