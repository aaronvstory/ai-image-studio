// Test Supabase keys locally
const https = require('https');

// Keys from user's message
const SUPABASE_URL = 'https://ytdhhklpsanghxouspkr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZGhoa2xwc2FuZ2h4b3VzcGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzY0NjYsImV4cCI6MjA3MTgxMjQ2Nn0.PZoeqfctFH9XLfeuhK3TMPKI92JchJfRRSwL8Q4mqkQ';

console.log('Testing Supabase connection...\n');
console.log('URL:', SUPABASE_URL);
console.log('Key prefix:', SUPABASE_ANON_KEY.substring(0, 50) + '...');

// Test the key by making a request to Supabase
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
    console.log('\nHealth Check Response:');
    console.log('Status Code:', res.statusCode);
    console.log('Status Message:', res.statusMessage);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('\n✅ Supabase connection is healthy!');
        testSignup();
      } else {
        console.log('\n❌ Health check failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e);
  });

  req.end();
};

// Test signup endpoint
const testSignup = () => {
  console.log('\nTesting signup endpoint...');
  
  const postData = JSON.stringify({
    email: 'test' + Date.now() + '@example.com',
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
      console.log('Signup Response:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ API Key is VALID - Signup works!');
      } else if (response.message?.includes('Invalid API key')) {
        console.log('\n❌ API Key is INVALID');
        console.log('Error:', response.message);
        console.log('\nYou need to:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Settings > API');
        console.log('4. Copy the "anon public" key');
        console.log('5. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel');
      } else {
        console.log('\nOther error:', response);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e);
  });

  req.write(postData);
  req.end();
};

// Run tests
testAuth();