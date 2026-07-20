require('dotenv').config({ path: 'apps/web/.env.local' });

async function testSignUp() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`;
  console.log('Testing signup...', url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'masteradmin@flexi.com',
        password: 'AdminPass123!'
      })
    });
    
    const data = await res.json();
    console.log('Signup Response:', data);
  } catch(e) {
    console.error('Exception:', e);
  }
}

testSignUp();
