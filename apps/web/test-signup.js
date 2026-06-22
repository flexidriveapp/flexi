const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  console.log("Signing up user...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@flexi-demo.com',
    password: 'FlexiPassword123!',
    options: {
      data: { full_name: 'Test User', phone: '1234567890' + Date.now(), role: 'host' }
    }
  });
  console.log("Signup error:", error);
  console.log("Signup data user id:", data?.user?.id);
}
run();
