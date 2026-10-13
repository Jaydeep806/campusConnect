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

  const token = loginRes.data.accessToken;
  console.log('   Club logged in.');

  const testLogo = 'https://images.unsplash.com/photo-1534972195531-a756b1126f24';
  const testBanner = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1';

  console.log('\n2. Updating club profile with logoUrl and bannerUrl...');
  const patchRes = await request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/club/profile',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      logoUrl: testLogo,
      bannerUrl: testBanner,
      tagline: 'Leading Computing Excellence',
    }
  );

  console.log('   Club update status:', patchRes.status);
  console.log('   Club society logoUrl:', patchRes.data.society?.logoUrl);
  console.log('   Club society bannerUrl:', patchRes.data.society?.bannerUrl);
  const societyId = patchRes.data.society?.id;

  console.log('\n3. Verifying Student Public Endpoint (GET /societies)...');
  const publicListRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/societies',
    method: 'GET',
  });

  const matchingClub = (publicListRes.data.societies || []).find((s) => s.id === societyId);
  console.log('   Student society card has logoUrl:', matchingClub?.logoUrl === testLogo);
  console.log('   Student society card has bannerUrl:', matchingClub?.bannerUrl === testBanner);

  console.log('\n4. Verifying Student Society Details Endpoint (GET /societies/:id)...');
  const publicDetailRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: `/societies/${societyId}`,
    method: 'GET',
  });

  console.log('   Student detail page logoUrl:', publicDetailRes.data.society?.logoUrl === testLogo);
  console.log('   Student detail page bannerUrl:', publicDetailRes.data.society?.bannerUrl === testBanner);

  if (
    matchingClub?.logoUrl === testLogo &&
    matchingClub?.bannerUrl === testBanner &&
    publicDetailRes.data.society?.logoUrl === testLogo &&
    publicDetailRes.data.society?.bannerUrl === testBanner
  ) {
    console.log('\nSUCCESS! Club CEO image updates are 100% synchronized to Student screens! 🎉');
  } else {
    console.error('\nMismatch detected in image sync!');
    process.exit(1);
  }
}

run().catch(console.error);
