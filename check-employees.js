/**
 * Employee Diagnostic Script
 * Run this to check why employees are not showing
 * 
 * Usage: node check-employees.js YOUR_ORG_TOKEN
 */

const http = require('http');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const token = process.argv[2];

if (!token) {
  console.log('❌ Please provide organization token');
  console.log('Usage: node check-employees.js YOUR_TOKEN');
  console.log('\nTo get token:');
  console.log('1. Login as organization');
  console.log('2. Open browser console');
  console.log('3. Run: localStorage.getItem("token")');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('🔍 EMPLOYEE DIAGNOSTIC');
console.log('='.repeat(60) + '\n');

// Test 1: Check current user
function checkCurrentUser() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const user = JSON.parse(data);
          console.log('✅ Current User:');
          console.log(`   Name: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   ID: ${user._id}`);
          resolve(user);
        } catch (e) {
          console.log('❌ Failed to parse user data');
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Failed to get current user:', e.message);
      resolve(null);
    });

    req.end();
  });
}

// Test 2: Check users list
function checkUsers() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const users = JSON.parse(data);
          console.log('\n✅ Users List:');
          console.log(`   Total users: ${Array.isArray(users) ? users.length : 'Not an array!'}`);
          
          if (Array.isArray(users)) {
            users.forEach((user, index) => {
              console.log(`\n   User ${index + 1}:`);
              console.log(`   - Name: ${user.name}`);
              console.log(`   - Email: ${user.email}`);
              console.log(`   - Role: ${user.role}`);
              console.log(`   - OrgID: ${user.organizationId || 'none'}`);
            });
            
            const employees = users.filter(u => u.role === 'Employee');
            console.log(`\n   📊 Summary:`);
            console.log(`   - Total: ${users.length}`);
            console.log(`   - Employees: ${employees.length}`);
            console.log(`   - Organizations: ${users.filter(u => u.role === 'Organization').length}`);
            console.log(`   - Admins: ${users.filter(u => u.role === 'Admin').length}`);
          }
          
          resolve(users);
        } catch (e) {
          console.log('❌ Failed to parse users data');
          console.log('   Response:', data);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Failed to get users:', e.message);
      resolve(null);
    });

    req.end();
  });
}

// Main
async function main() {
  const user = await checkCurrentUser();
  
  if (!user) {
    console.log('\n❌ Cannot proceed without user data');
    console.log('   Check if backend is running and token is valid');
    return;
  }
  
  if (user.role !== 'Organization') {
    console.log(`\n⚠️  Warning: Current user role is "${user.role}", not "Organization"`);
    console.log('   This script is designed for organization accounts');
  }
  
  const users = await checkUsers();
  
  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSIS:');
  console.log('='.repeat(60));
  
  if (!users) {
    console.log('\n❌ ISSUE: Cannot get users from API');
    console.log('   Possible causes:');
    console.log('   1. Backend not running');
    console.log('   2. Token expired or invalid');
    console.log('   3. API endpoint not working');
    console.log('\n   Fix: Start backend with: cd backend && npm start');
  } else if (!Array.isArray(users)) {
    console.log('\n❌ ISSUE: API returned single object instead of array');
    console.log('   Backend is using wrong method (findOne instead of find)');
    console.log('\n   Fix: Use backend from backend-complete/ folder');
  } else if (users.length === 0) {
    console.log('\n❌ ISSUE: No users returned');
    console.log('   Backend filter is too restrictive or database is empty');
    console.log('\n   Fix: Check backend filtering logic');
  } else if (users.length === 1 && users[0].role === 'Organization') {
    console.log('\n⚠️  ISSUE: Only organization returned, no employees');
    console.log('   Possible causes:');
    console.log('   1. No employees created yet');
    console.log('   2. Employees have wrong organizationId');
    console.log('   3. Backend filter not working correctly');
    console.log('\n   Check MongoDB:');
    console.log(`   db.users.find({ organizationId: ObjectId("${user._id}") })`);
  } else {
    const employees = users.filter(u => u.role === 'Employee');
    if (employees.length === 0) {
      console.log('\n⚠️  No employees found');
      console.log('   Users returned but none are employees');
      console.log('   Create employees through the UI');
    } else {
      console.log('\n✅ SUCCESS: Everything is working!');
      console.log(`   Found ${employees.length} employee(s)`);
      employees.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.email})`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

main();
