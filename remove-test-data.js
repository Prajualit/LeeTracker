// Script to remove test data from the backend
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function removeTestData() {
  try {
    console.log('🧹 Starting to remove test data...');

    // First, get the demo user
    const userResponse = await axios.post(`${API_BASE_URL}/users`, {
      username: 'demo_user'
    });
    console.log('✅ Found user:', userResponse.data.data.username);
    
    const userId = userResponse.data.data.id;

    // Get all problems for this user
    const problemsResponse = await axios.get(`${API_BASE_URL}/problems/user/${userId}`, {
      params: { page: 1, limit: 100 } // Get all problems
    });
    
    const problems = problemsResponse.data.data.problems;
    console.log(`📊 Found ${problems.length} problems to remove`);

    // Delete each problem
    for (const problem of problems) {
      try {
        await axios.delete(`${API_BASE_URL}/problems/${problem.id}`);
        console.log(`🗑️  Deleted problem: ${problem.title}`);
      } catch (error) {
        console.error(`❌ Error deleting ${problem.title}:`, error.response?.data?.message || error.message);
      }
    }

    console.log('🎉 Test data removed successfully!');
    console.log('Your dashboard will now show empty state.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on http://localhost:5000');
    }
  }
}

removeTestData();
