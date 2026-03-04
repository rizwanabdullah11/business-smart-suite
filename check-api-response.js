/**
 * Quick API Response Checker
 * 
 * This checks what your backend is actually returning
 * 
 * Usage:
 *   node check-api-response.js YOUR_TOKEN_HERE
 */

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function checkAPI(token) {
  console.log('🔍 Checking API Response\n');
  console.log('Backend URL:', API_URL);
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'NOT PROVIDED');
  console.log('\n' + '='.repeat(60) + '\n');

  if (!token) {
    console.log('❌ ERROR: No token provided');
    console.log('\nUsage:');
    console.log('  node check-api-response.js YOUR_TOKEN_HERE');
    console.log('\nGet your token from browser console:');
    console.log('  localStorage.getItem("token")');
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    console.log('📡 Fetching: GET /api/users\n');
    
    const response = await fetch(`${API_URL}/users`, { headers });
    
    if (!response.ok) {
      console.log('❌ API Error:', response.status, response.statusText);
      const text = await response.text();
      console.log('Response:', text);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('📦 Response Type:', Array.isArray(data) ? 'ARRAY ✅' : 'OBJECT ❌');
    console.log('\n' + '='.repeat(60) + '\n');
    
    if (Array.isArray(data)) {
      console.log('✅ CORRECT: Backend returned an array');
      console.log(`✅ Found ${data.length} users\n`);
      
      // Count by role
      const admins = data.filter(u => u.role?.toLowerCase() === 'admin');
      const orgs = data.filter(u => u.role?.toLowerCase() === 'organization');
      const employees = data.filter(u => u.role?.toLowerCase() === 'employee');
      
      console.log('📊 Breakdown:');
      console.log(`   Admins: ${admins.length}`);
      console.log(`   Organizations: ${orgs.length}`);
      console.log(`   Employees: ${employees.length}`);
      
      console.log('\n📋 Users:');
      data.forEach((user, index) => {
        console.log(`\n   ${index + 1}. ${user.name}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      ID: ${user._id}`);
        if (user.organizationId) {
          console.log(`      Organization ID: ${user.organizationId}`);
        }
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ YOUR BACKEND IS WORKING CORRECTLY!');
      console.log('='.repeat(60));
      
      if (employees.length === 0) {
        console.log('\n⚠️  Note: No employees found.');
        console.log('   If you created employees, check:');
        console.log('   1. Are they in MongoDB?');
        console.log('   2. Do they have organizationId field?');
        console.log('   3. Does organizationId match organization\'s _id?');
      }
      
    } else {
      console.log('❌ WRONG: Backend returned a single object');
      console.log('\n📦 Response:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n' + '='.repeat(60));
      console.log('🔧 FIX REQUIRED');
      console.log('='.repeat(60));
      console.log('\nYour backend is using:');
      console.log('  const user = await User.findOne()');
      console.log('  res.json(user)');
      console.log('\nIt should be:');
      console.log('  const users = await User.find(query)');
      console.log('  res.json(users)');
      console.log('\nSee: backend-complete/routes/users.js for correct code');
      console.log('Or: FIX_ORGANIZATION_EMPLOYEES.md for step-by-step fix');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n💡 Make sure your backend is running at:', API_URL);
  }
}

const token = process.argv[2];
checkAPI(token);
