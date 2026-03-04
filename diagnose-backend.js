/**
 * Backend Diagnostic Script
 * 
 * This script checks your backend and identifies issues
 * 
 * Usage:
 *   node diagnose-backend.js YOUR_TOKEN_HERE
 * 
 * Get your token from browser console:
 *   localStorage.getItem('token')
 */

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function diagnose(token) {
  console.log('🔍 Backend Diagnostic Tool\n');
  console.log('Backend URL:', API_URL);
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'NOT PROVIDED');
  console.log('\n' + '='.repeat(60) + '\n');

  if (!token) {
    console.log('❌ ERROR: No token provided');
    console.log('\nUsage:');
    console.log('  node diagnose-backend.js YOUR_TOKEN_HERE');
    console.log('\nGet your token from browser console:');
    console.log('  localStorage.getItem("token")');
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test 1: Check if backend is running
  console.log('TEST 1: Backend Connectivity');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(`${API_URL}/auth/me`, { headers });
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Backend is running');
      console.log('✅ Authentication working');
      console.log(`   Current user: ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   User ID: ${user._id || user.id}`);
    } else {
      console.log('❌ Backend responded with error:', response.status);
      const text = await response.text();
      console.log('   Response:', text);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend');
    console.log('   Error:', error.message);
    console.log('\n💡 Make sure your backend is running at:', API_URL);
    process.exit(1);
  }

  console.log('\n');

  // Test 2: Check /users endpoint
  console.log('TEST 2: Users Endpoint');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(`${API_URL}/users`, { headers });
    
    if (!response.ok) {
      console.log('❌ /users endpoint returned error:', response.status);
      const text = await response.text();
      console.log('   Response:', text);
      console.log('\n💡 Your backend may not have a /users endpoint');
      console.log('   Check: backend-complete/routes/users.js for implementation');
      process.exit(1);
    }

    const data = await response.json();
    
    // Check if response is an array
    if (Array.isArray(data)) {
      console.log('✅ Response is an array (CORRECT)');
      console.log(`✅ Found ${data.length} users`);
      
      // Show user breakdown
      const admins = data.filter(u => u.role?.toLowerCase() === 'admin');
      const orgs = data.filter(u => u.role?.toLowerCase() === 'organization');
      const employees = data.filter(u => u.role?.toLowerCase() === 'employee');
      
      console.log(`   - Admins: ${admins.length}`);
      console.log(`   - Organizations: ${orgs.length}`);
      console.log(`   - Employees: ${employees.length}`);
      
      console.log('\n📋 Users List:');
      data.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
        console.log(`      Role: ${user.role}`);
        if (user.organizationId) {
          console.log(`      Organization ID: ${user.organizationId}`);
        }
        console.log('');
      });
      
      if (employees.length === 0) {
        console.log('⚠️  WARNING: No employees found in database');
        console.log('   This could mean:');
        console.log('   1. You haven\'t created any employees yet');
        console.log('   2. Employees were created but not saved to database');
        console.log('   3. Backend is filtering them out incorrectly');
      }
      
    } else {
      console.log('❌ Response is a SINGLE OBJECT (WRONG)');
      console.log('   This is the problem! Backend should return an array.');
      console.log('\n   Received:');
      console.log('   ' + JSON.stringify(data, null, 2).split('\n').join('\n   '));
      console.log('\n🔧 FIX REQUIRED:');
      console.log('   Your backend /users endpoint is using:');
      console.log('     const user = await User.findOne()');
      console.log('     res.json(user)');
      console.log('\n   It should be:');
      console.log('     const users = await User.find(query)');
      console.log('     res.json(users)');
      console.log('\n   See: backend-complete/routes/users.js for correct implementation');
    }
    
  } catch (error) {
    console.log('❌ Error fetching users:', error.message);
  }

  console.log('\n');

  // Test 3: Check /organizations endpoint
  console.log('TEST 3: Organizations Endpoint');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(`${API_URL}/organizations`, { headers });
    
    if (!response.ok) {
      console.log('⚠️  /organizations endpoint not available:', response.status);
      console.log('   This is optional - can use /users?role=Organization instead');
    } else {
      const data = await response.json();
      
      if (Array.isArray(data)) {
        console.log('✅ Organizations endpoint working');
        console.log(`✅ Found ${data.length} organizations`);
        
        if (data.length > 0) {
          console.log('\n📋 Organizations:');
          data.forEach((org, index) => {
            console.log(`   ${index + 1}. ${org.name} (${org.email})`);
            console.log(`      ID: ${org._id}`);
          });
        } else {
          console.log('⚠️  No organizations found');
          console.log('   Create an organization user first');
        }
      } else {
        console.log('⚠️  Organizations endpoint returned single object (should be array)');
      }
    }
  } catch (error) {
    console.log('⚠️  Organizations endpoint error:', error.message);
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('DIAGNOSIS COMPLETE');
  console.log('='.repeat(60));
}

// Get token from command line
const token = process.argv[2];

// Run diagnosis
diagnose(token).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
