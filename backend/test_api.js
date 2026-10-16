// Comprehensive automated test suite for all Healthcare API endpoints
const http = require('http');

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING COMPREHENSIVE BACKEND API TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extraInfo = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${extraInfo}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.body.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Register user 1
    const testEmail1 = `alice_${Date.now()}@example.com`;
    const regRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Dr. Alice Roberts', email: testEmail1, password: 'password123' }
    );
    assert(regRes.status === 201 && regRes.body.token, 'POST /api/auth/register succeeds with token');
    const token1 = regRes.body.token;

    // 3. Prevent duplicate email registration
    const dupRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Alice Duplicate', email: testEmail1, password: 'password123' }
    );
    assert(dupRes.status === 400, 'POST /api/auth/register prevents duplicate email');

    // 4. Login user 1
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail1, password: 'password123' }
    );
    assert(loginRes.status === 200 && loginRes.body.token, 'POST /api/auth/login succeeds with valid credentials');

    // 5. Invalid login credentials
    const badLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail1, password: 'wrongpassword' }
    );
    assert(badLogin.status === 401, 'POST /api/auth/login rejects incorrect password');

    // 6. Protected routes reject missing token
    const noAuth = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/patients',
      method: 'GET',
    });
    assert(noAuth.status === 401, 'GET /api/patients without token returns 401');

    // 7. Register user 2 for multi-tenant ownership testing
    const testEmail2 = `bob_${Date.now()}@example.com`;
    const reg2Res = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Bob Johnson', email: testEmail2, password: 'password456' }
    );
    const token2 = reg2Res.body.token;

    // 8. Create Patient for User 1
    const createPatientRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/patients',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
      },
      {
        name: 'Eleanor Vance',
        age: 42,
        gender: 'Female',
        address: '742 Evergreen Terrace, Springfield',
        medicalDetails: 'Hypertension, seasonal allergies. Prescribed Lisinopril.',
      }
    );
    assert(createPatientRes.status === 201 && createPatientRes.body.data.id, 'POST /api/patients creates patient');
    const patient1Id = createPatientRes.body.data.id;

    // 9. Input validation on patient creation
    const badPatient = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/patients',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
      },
      {
        name: '',
        age: -5,
        gender: 'InvalidGender',
        address: '',
      }
    );
    assert(badPatient.status === 400, 'POST /api/patients fails validation for invalid inputs');

    // 10. User 1 retrieves their patient list
    const getPatients1 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/patients',
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(
      getPatients1.status === 200 && getPatients1.body.data.some((p) => p.id === patient1Id),
      'GET /api/patients returns user 1 patient'
    );

    // 11. User 2 retrieves their patient list (should NOT see User 1 patient)
    const getPatients2 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/patients',
      method: 'GET',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(
      getPatients2.status === 200 && !getPatients2.body.data.some((p) => p.id === patient1Id),
      'GET /api/patients enforces isolation: User 2 cannot see User 1 patient'
    );

    // 12. User 2 tries to GET User 1 patient by ID (should be 404/forbidden)
    const getPatientUnauthorized = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/patients/${patient1Id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(
      getPatientUnauthorized.status === 404,
      'GET /api/patients/:id returns 404 for unauthorized access by another user'
    );

    // 13. User 1 updates patient
    const updatePatientRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/patients/${patient1Id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
      },
      {
        name: 'Eleanor Vance-Updated',
        age: 43,
      }
    );
    assert(
      updatePatientRes.status === 200 && updatePatientRes.body.data.name === 'Eleanor Vance-Updated',
      'PUT /api/patients/:id updates patient record'
    );

    // 14. Doctor APIs: Get all doctors (from seed)
    const getDocsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/doctors',
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(
      getDocsRes.status === 200 && getDocsRes.body.data.length >= 8,
      'GET /api/doctors returns available doctors list'
    );
    const doctor1Id = getDocsRes.body.data[0].id;
    const doctor2Id = getDocsRes.body.data[1].id;

    // 15. Create a new doctor
    const createDocRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/doctors',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
      },
      {
        name: 'Dr. Gregory House',
        specialization: 'Diagnostic Medicine',
        email: `house_${Date.now()}@hospital.org`,
        phone: '9890123456',
      }
    );
    assert(createDocRes.status === 201 && createDocRes.body.data.id, 'POST /api/doctors creates new doctor record');
    const createdDocId = createDocRes.body.data.id;

    // 16. Update doctor
    const updateDocRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/doctors/${createdDocId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
      },
      {
        specialization: 'Infectious Disease & Diagnostics',
      }
    );
    assert(
      updateDocRes.status === 200 &&
        updateDocRes.body.data.specialization === 'Infectious Disease & Diagnostics',
      'PUT /api/doctors/:id updates doctor record'
    );

    // 17. User 2 tries to assign a doctor to User 1 patient (should fail ownership check)
    const unauthAssign = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/mappings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token2}`,
        },
      },
      {
        patientId: patient1Id,
        doctorId: doctor1Id,
      }
    );
    assert(
      unauthAssign.status === 404,
      'POST /api/mappings prevents assigning doctor to another user’s patient'
    );

    // 18. User 1 assigns Doctor 1 to Patient 1
    const assignRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/mappings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
      },
      {
        patientId: patient1Id,
        doctorId: doctor1Id,
      }
    );
    assert(assignRes.status === 201 && assignRes.body.data.id, 'POST /api/mappings assigns doctor to patient');
    const mappingId = assignRes.body.data.id;

    // 19. Prevent duplicate assignment
    const dupAssign = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/mappings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
      },
      {
        patientId: patient1Id,
        doctorId: doctor1Id,
      }
    );
    assert(dupAssign.status === 400, 'POST /api/mappings prevents duplicate doctor-patient assignment');

    // 20. Assign a second doctor to Patient 1
    const assign2Res = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/mappings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
      },
      {
        patientId: patient1Id,
        doctorId: doctor2Id,
      }
    );
    assert(assign2Res.status === 201, 'POST /api/mappings assigns second doctor to patient');
    const mapping2Id = assign2Res.body.data.id;

    // 21. Get mappings for User 1's patients
    const getMappings = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/mappings',
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(
      getMappings.status === 200 && getMappings.body.data.length >= 2,
      'GET /api/mappings retrieves authenticated user’s patient mappings'
    );

    // 22. Get assigned doctors for specific patient
    const getPatientDoctors = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/mappings/${patient1Id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(
      getPatientDoctors.status === 200 && getPatientDoctors.body.data.length >= 2,
      'GET /api/mappings/:patientId retrieves doctors assigned to patient'
    );

    // 23. User 2 tries to delete User 1 mapping (should return 403 or 404)
    const unauthDeleteMap = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/mappings/${mappingId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(
      unauthDeleteMap.status === 403 || unauthDeleteMap.status === 404,
      'DELETE /api/mappings/:id prevents unauthorized user from deleting assignment'
    );

    // 24. User 1 deletes mapping 1
    const deleteMapRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/mappings/${mappingId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(deleteMapRes.status === 200, 'DELETE /api/mappings/:id removes assignment successfully');

    // 25. Delete doctor
    const deleteDocRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/doctors/${createdDocId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(deleteDocRes.status === 200, 'DELETE /api/doctors/:id removes doctor successfully');

    // 26. Delete patient
    const deletePatRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/patients/${patient1Id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(deletePatRes.status === 200, 'DELETE /api/patients/:id removes patient successfully');

    console.log(`\n=============================================`);
    console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log(`=============================================`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  }
};

runTests();
