const http = require('http');

// Test the redirect endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/shorturl/1',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  if (res.statusCode === 302 || res.statusCode === 301) {
    console.log(`✅ REDIRECT WORKING! Redirects to: ${res.headers.location}`);
  } else if (res.statusCode === 404) {
    console.log('❌ Short URL not found');
  } else {
    console.log('Response:', res);
  }
});

req.on('error', (e) => {
  console.error(`Problem: ${e.message}`);
});

req.end();
