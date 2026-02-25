/**
 * Backend Health Check Script
 * Run this to verify your backend server is running and accessible
 * 
 * Usage: node check-backend.js
 */

const http = require('http');

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const HOST = 'localhost';
const PORT = 5000;

console.log('\n' + '='.repeat(60));
console.log('🔍 BACKEND HEALTH CHECK');
console.log('='.repeat(60) + '\n');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Checking: http://${HOST}:${PORT}\n`);

// Check if port 5000 is listening
function checkPort() {
  return new Promise((resolve) => {
    const options = {
      host: HOST,
      port: PORT,
      method: 'GET',
      path: '/api/health',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      console.log('✅ Backend server is RUNNING');
      console.log(`   Status Code: ${res.statusCode}`);
      console.log(`   Port: ${PORT}`);
      console.log(`   Response: Server is responding`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log('❌ Backend server is NOT RUNNING');
      console.log(`   Error: ${err.message}`);
      console.log(`   Code: ${err.code}`);
      console.log(`   Port: ${PORT}`);
      
      if (err.code === 'ECONNREFUSED') {
        console.log('\n   This is the same error your frontend is getting!');
      }
      
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⏱️  Backend server TIMEOUT');
      console.log(`   Port ${PORT} is not responding within 3 seconds`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Check specific endpoints
async function checkEndpoints(token) {
  console.log('\n📡 Checking Endpoints...\n');
  
  const endpoints = [
    { name: 'Health', path: '/api/health', auth: false },
    { name: 'Auth Me', path: '/api/auth/me', auth: true },
    { name: 'Users List', path: '/api/users', auth: true },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const options = {
        host: HOST,
        port: PORT,
        method: 'GET',
        path: endpoint.path,
        timeout: 2000,
        headers: {}
      };
      
      if (endpoint.auth && token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      await new Promise((resolve) => {
        const req = http.request(options, (res) => {
          const status = res.statusCode === 200 || res.statusCode === 201 ? '✅' : 
                        res.statusCode === 404 ? '❌' : '⚠️';
          console.log(`${status} ${endpoint.name.padEnd(15)} ${endpoint.path.padEnd(25)} [${res.statusCode}]`);
          resolve();
        });
        
        req.on('error', () => {
          console.log(`❌ ${endpoint.name.padEnd(15)} ${endpoint.path.padEnd(25)} [FAILED]`);
          resolve();
        });
        
        req.on('timeout', () => {
          console.log(`⏱️  ${endpoint.name.padEnd(15)} ${endpoint.path.padEnd(25)} [TIMEOUT]`);
          req.destroy();
          resolve();
        });
        
        req.end();
      });
    } catch (error) {
      console.log(`❌ ${endpoint.name.padEnd(15)} ${endpoint.path.padEnd(25)} [ERROR]`);
    }
  }
}

// Main check
async function main() {
  const isRunning = await checkPort();

  if (isRunning) {
    // Try to check endpoints
    await checkEndpoints();
  }

  console.log('\n' + '='.repeat(60));
  
  if (isRunning) {
    console.log('\n✅ SUCCESS - Backend is running!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Go to: http://localhost:3000/admin/diagnostics');
    console.log('   2. Check which endpoints are available');
    console.log('   3. Go to: http://localhost:3000/admin/users');
    console.log('   4. You should see all users from database');
    console.log('\n💡 If you see ❌ for /users endpoint:');
    console.log('   - See START_BACKEND_SERVER.md for setup');
    console.log('   - Copy files from backend-files/ folder');
  } else {
    console.log('\n❌ BACKEND NOT RUNNING - This is why you see only 1 user!');
    console.log('\n🔧 To Fix:');
    console.log('   1. Find your backend folder:');
    console.log('      cd path/to/your/backend');
    console.log('');
    console.log('   2. Start the server:');
    console.log('      npm start');
    console.log('      (or: node server.js)');
    console.log('');
    console.log('   3. Verify MongoDB is running');
    console.log('');
    console.log('   4. Check .env file has correct config');
    console.log('');
    console.log('📚 See START_BACKEND_SERVER.md for detailed instructions');
    console.log('📚 See QUICK_START.md for quick fix guide');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

main();
