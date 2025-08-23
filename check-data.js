// Script to check current data in the backend
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function checkCurrentData() {
  try {
    console.log('🔍 Checking current data in backend...');

    // Get the demo user
    const userResponse = await axios.post(`${API_BASE_URL}/users`, {
      username: 'demo_user'
    });
    
    const userId = userResponse.data.data.id;
    console.log('User ID:', userId);

    // Check analytics
    try {
      const analyticsResponse = await axios.get(`${API_BASE_URL}/analytics/user/${userId}`);
      console.log('📊 Analytics overview:', analyticsResponse.data.data.overview);
    } catch (error) {
      console.log('📊 Analytics: No data found');
    }

    // Check problems with different pagination
    try {
      const problemsResponse = await axios.get(`${API_BASE_URL}/problems/user/${userId}`, {
        params: { page: 1, limit: 50 }
      });
      console.log(`📝 Problems found: ${problemsResponse.data.data.problems.length}`);
      
      if (problemsResponse.data.data.problems.length > 0) {
        console.log('Problems list:');
        problemsResponse.data.data.problems.forEach((problem, index) => {
          console.log(`  ${index + 1}. ${problem.title} (${problem.difficulty.level}) - ID: ${problem.id}`);
        });
      }
    } catch (error) {
      console.log('📝 Problems: No data found');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

checkCurrentData();
