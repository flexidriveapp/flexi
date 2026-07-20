require('dotenv').config({ path: 'apps/web/.env.local' });

async function testLogin() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`;
  console.log('Testing login...', url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'systemadmin@flexi.com',
        password: 'AdminPass123!'
      })
    });
    
    const data = await res.json().catch(() => null);
    console.log('Status:', res.status);
    console.log('Response Body:', data);
  } catch(e) {
    console.error('Exception:', e);
  }
}

testLogin();
