// tests/api-test.js
const API_BASE = 'http://localhost:3000/api'

const testEndpoints = [
  // Jobs
  { method: 'GET', path: '/jobs', name: 'Get Jobs' },
  { method: 'POST', path: '/jobs', name: 'Create Job', body: {
    title: 'Test Job',
    description: 'Test Description',
    budget: 1000,
    skills: ['JavaScript']
  }},
  
  // Skills
  { method: 'GET', path: '/skills', name: 'Get Skills' },
  
  // Dashboard Stats (requires auth)
  { method: 'GET', path: '/dashboard/stats', name: 'Dashboard Stats' },
  
  // Payments
  { method: 'GET', path: '/payments', name: 'Get Payments' },
  
  // User Profile
  { method: 'GET', path: '/users/test-user-id/profile', name: 'Get User Profile' },
  
  // Search Freelancers
  { method: 'GET', path: '/skills/search/freelancers?skill=JavaScript', name: 'Search Freelancers' }
]

async function testAPI() {
  console.log('🚀 Starting API Tests...\n')
  
  for (const test of testEndpoints) {
    try {
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      }
      
      if (test.body) {
        options.body = JSON.stringify(test.body)
      }
      
      const response = await fetch(`${API_BASE}${test.path}`, options)
      const status = response.status
      
      if (status >= 200 && status < 300) {
        console.log(`✅ ${test.name}: ${status}`)
      } else if (status === 401) {
        console.log(`🔒 ${test.name}: ${status} (Auth Required)`)
      } else {
        console.log(`❌ ${test.name}: ${status}`)
        const error = await response.text()
        console.log(`   Error: ${error}`)
      }
    } catch (error) {
      console.log(`💥 ${test.name}: Connection Error`)
      console.log(`   ${error.message}`)
    }
  }
}

// Run the test
testAPI()