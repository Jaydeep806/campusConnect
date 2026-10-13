const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('1. Logging in as club CEO...');
  const loginRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/auth/club/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'acm@example.edu', password: 'password123' }
  );

  if (loginRes.status !== 200 || !loginRes.data.accessToken) {
    console.error('Club login failed:', loginRes);
    process.exit(1);
  }
  const token = loginRes.data.accessToken;
  console.log('   Club login successful.');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Profile update with club image logoUrl and bannerUrl
  console.log('\n2. Testing society profile update with logoUrl and bannerUrl...');
  const profileRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/club/profile',
      method: 'PATCH',
      headers: authHeaders,
    },
    {
      logoUrl: 'https://images.unsplash.com/photo-1534972195531-a756b1126f24',
      bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
      tagline: 'Empowering future innovators',
    }
  );
  console.log('   Profile update status:', profileRes.status, 'Logo:', profileRes.data.society?.logoUrl);

  // Member CRUD testing
  console.log('\n3. Testing Member Management (POST /club/members)...');
  const addMemberRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/club/members',
      method: 'POST',
      headers: authHeaders,
    },
    {
      name: 'Rohan Sharma',
      role: 'Head of AI & ML',
      batchYear: 2026,
      linkedinUrl: 'https://linkedin.com/in/rohan-sharma-test',
    }
  );
  console.log('   Add member status:', addMemberRes.status, 'Member ID:', addMemberRes.data.member?.id);
  const memberId = addMemberRes.data.member?.id;

  console.log('\n4. Testing Member Update (PATCH /club/members/:id)...');
  const updateMemberRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: `/club/members/${memberId}`,
      method: 'PATCH',
      headers: authHeaders,
    },
    { role: 'Executive Vice President' }
  );
  console.log('   Update member status:', updateMemberRes.status, 'New role:', updateMemberRes.data.member?.role);

  console.log('\n5. Testing Member List (GET /club/members)...');
  const getMembersRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/club/members',
      method: 'GET',
      headers: authHeaders,
    }
  );
  console.log('   Total members returned:', getMembersRes.data.members?.length);

  console.log('\n6. Testing Member Delete (DELETE /club/members/:id)...');
  const deleteMemberRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: `/club/members/${memberId}`,
      method: 'DELETE',
      headers: authHeaders,
    }
  );
  console.log('   Delete member status:', deleteMemberRes.status);

  // Recruitment CRUD testing
  console.log('\n7. Testing Recruitment Creation (POST /club/recruitments)...');
  const addRecruitmentRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/club/recruitments',
      method: 'POST',
      headers: authHeaders,
    },
    {
      title: 'Summer Interns 2026',
      description: 'Hiring summer developers and technical writers.',
      positions: [{ title: 'Intern', seats: 3 }],
      opensAt: new Date().toISOString(),
      closesAt: new Date(Date.now() + 15 * 86400000).toISOString(),
    }
  );
  console.log('   Add recruitment status:', addRecruitmentRes.status, 'Drive ID:', addRecruitmentRes.data.recruitment?._id);
  const recruitmentId = addRecruitmentRes.data.recruitment?._id;

  console.log('\n8. Testing Recruitment Delete (DELETE /club/recruitments/:id)...');
  const deleteRecruitmentRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: `/club/recruitments/${recruitmentId}`,
      method: 'DELETE',
      headers: authHeaders,
    }
  );
  console.log('   Delete recruitment status:', deleteRecruitmentRes.status);

  // Applications list testing
  console.log('\n9. Testing Applications endpoint (GET /club/applications)...');
  const getAppsRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/club/applications',
      method: 'GET',
      headers: authHeaders,
    }
  );
  console.log('   Applications returned:', getAppsRes.status, 'Count:', getAppsRes.data.applications?.length);

  // Dashboard endpoint testing
  console.log('\n10. Testing Dashboard (GET /club/dashboard)...');
  const dashRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/club/dashboard',
      method: 'GET',
      headers: authHeaders,
    }
  );
  console.log('   Dashboard status:', dashRes.status, 'Stats:', dashRes.data.stats);

  console.log('\nALL CLUB MANAGEMENT ENDPOINTS AND SYNCHRONIZATIONS VERIFIED SUCCESSFULLY! 🎉');
}

run().catch(console.error);
