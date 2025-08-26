const https = require('https');

// Test the ACTUAL key from Vercel (as mentioned by user)
const SUPABASE_URL = 'https://ytdhhklpsanghxouspkr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZGhoa2xwc2FuZ2h4b3VzcGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzY0NjYsImV4cCI6MjA3MTgxMjQ2Nn0.PZoeqfctFH9XLfeuhK3TMPKI92JchJfRRSwL8Q4mqkQ';

console.log('Testing the VERCEL key (different from what user initially gave)...\n');

// Test auth endpoint
const testAuth = () => {
  const options = {
    hostname: 'ytdhhklpsanghxouspkr.supabase.co',
    path: '/auth/v1/health',
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log('Health Check Response:');
    console.log('Status Code:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('\n✅ This key WORKS!');
        console.log('The issue is that the deployed app might not be using this key correctly.\n');
        testSignup();
      } else {
        console.log('\n❌ This key is INVALID');
        console.log('Need to get the correct anon key from Supabase dashboard');
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e);
  });

  req.end();
};

// Test signup
const testSignup = () => {
  console.log('Testing signup endpoint...');
  
  const email = `testuser${Date.now()}@gmail.com`;
  const postData = JSON.stringify({
    email: email,
    password: 'Test123456!',
    options: {
      data: {
        free_generations_used: 0,
        has_paid: false
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
    console.log('Signup Status Code:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ SIGNUP WORKS with this key!');
        console.log('Created user:', email);
        console.log('\nThe key is VALID but the web app might have issues with:');
        console.log('1. How the key is loaded from environment variables');
        console.log('2. Client-side vs server-side key usage');
        console.log('3. Middleware or routing issues');
      } else {
        console.log('\n❌ Signup failed:', response.message || response.msg);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e);
  });

  req.write(postData);
  req.end();
};

testAuth();