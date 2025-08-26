const https = require('https');

const SUPABASE_URL = 'https://ytdhhklpsanghxouspkr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZGhoa2xwc2FuZ2h4b3VzcGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzY0NjYsImV4cCI6MjA3MTgxMjQ2Nn0.PZoeqfctFH9XLfeuhK3TMPKI92JchJfRRSwL8Q4mqkQ';

console.log('Testing signup with valid email format...\n');

const testSignup = () => {
  const randomNum = Math.floor(Math.random() * 100000);
  const email = `testuser${randomNum}@gmail.com`; // Use gmail.com for valid domain
  
  console.log('Testing with email:', email);
  
  const postData = JSON.stringify({
    email: email,
    password: 'SecurePassword123!',
    options: {
      data: {
        free_generations_used: 0,
        has_paid: false,
        subscription_status: 'inactive'
      }
    }
  });

  const options = {
    hostname: 'ytdhhklpsanghxouspkr.supabase.co',
    path: '/auth/v1/signup',
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = https.request(options, (res) => {
    console.log('\nStatus Code:', res.statusCode);
    console.log('Status Message:', res.statusMessage);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('\nResponse:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ SUCCESS! Authentication is working!');
        console.log('User created with email:', email);
        
        if (response.user) {
          console.log('User ID:', response.user.id);
          console.log('Created at:', response.user.created_at);
        }
      } else {
        console.log('\n❌ Signup failed');
        console.log('Error:', response.msg || response.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e);
  });

  req.write(postData);
  req.end();
};

testSignup();