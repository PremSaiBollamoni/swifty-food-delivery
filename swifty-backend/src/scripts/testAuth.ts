import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow\n');

  const testUser = {
    name: 'Test User',
    email: 'testuser@gmail.com',
    password: 'Test@1234',
    phone: '9876543210'
  };

  try {
    // Test 1: Try to login with non-existent user
    console.log('1️⃣ Test: Login with non-existent user');
    try {
      await axios.post(`${API_URL}/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('❌ Should have failed - user does not exist yet\n');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ Correct: User not found');
        console.log('   Message:', error.response.data.error);
        console.log('');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
        console.log('');
      }
    }

    // Test 2: Register new user
    console.log('2️⃣ Test: Register new user');
    try {
      const response = await axios.post(`${API_URL}/register`, testUser);
      console.log('✅ Registration successful!');
      console.log('   User ID:', response.data.user.id);
      console.log('   Email:', response.data.user.email);
      console.log('   Token received:', response.data.token ? 'Yes' : 'No');
      console.log('');
    } catch (error: any) {
      console.log('❌ Registration failed:', error.response?.data || error.message);
      console.log('');
    }

    // Test 3: Try to register same user again
    console.log('3️⃣ Test: Try to register same email again');
    try {
      await axios.post(`${API_URL}/register`, testUser);
      console.log('❌ Should have failed - email already exists\n');
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('✅ Correct: Email already registered');
        console.log('   Message:', error.response.data.error);
        console.log('');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
        console.log('');
      }
    }

    // Test 4: Login with wrong password
    console.log('4️⃣ Test: Login with incorrect password');
    try {
      await axios.post(`${API_URL}/login`, {
        email: testUser.email,
        password: 'WrongPassword123!'
      });
      console.log('❌ Should have failed - wrong password\n');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Correct: Password incorrect');
        console.log('   Message:', error.response.data.error);
        console.log('');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
        console.log('');
      }
    }

    // Test 5: Login with correct credentials
    console.log('5️⃣ Test: Login with correct credentials');
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful!');
      console.log('   User ID:', response.data.user.id);
      console.log('   Name:', response.data.user.name);
      console.log('   Email:', response.data.user.email);
      console.log('   Token received:', response.data.token ? 'Yes' : 'No');
      console.log('');
    } catch (error: any) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      console.log('');
    }

    console.log('✅ All authentication tests completed!\n');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

testAuthFlow();
