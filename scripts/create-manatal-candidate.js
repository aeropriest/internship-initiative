// Script to create a test candidate in Manatal
const https = require('https');

// Use the API token from command line or default
const API_TOKEN = process.argv[2] || '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';
const API_PATH = '/open/v3/candidates/';

// Generate a unique email for testing
const timestamp = Date.now();
const testCandidate = {
  full_name: `Test Candidate ${timestamp}`,
  email: `test.candidate.${timestamp}@example.com`,
  phone_number: '+1234567890',
  candidate_location: 'Test Location',
  description: 'This is a test candidate created via API',
  current_position: 'Test Position',
  custom_fields: {
    application_flow: 'API Test',
    position_applied: 'Golf Internship',
    application_source: 'API Script',
    application_notes: 'Created for testing the questionnaire integration',
    candidate_score: 75
  }
};

// Function to create a candidate
function createCandidate() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testCandidate);
    
    const options = {
      hostname: BASE_URL,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    console.log(`\n🔍 Creating test candidate with email: ${testCandidate.email}`);
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
        
        try {
          const jsonData = JSON.parse(responseData);
          console.log('✅ Response is valid JSON');
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`📋 Candidate created with ID: ${jsonData.id}`);
            console.log(`📄 Candidate details: ${JSON.stringify(jsonData).substring(0, 200)}...`);
            
            // Print useful information for testing
            console.log('\n🧪 Test commands:');
            console.log(`- Take questionnaire: http://localhost:3000/prefilled-questionnaire?candidateId=${jsonData.id}`);
            console.log(`- Auto-submit: http://localhost:3000/prefilled-questionnaire?candidateId=${jsonData.id}&autoSubmit=true`);
            console.log(`- View status: http://localhost:3000/status/${jsonData.id}`);
          } else {
            console.log(`❌ Failed to create candidate: ${JSON.stringify(jsonData)}`);
          }
          
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          console.log('❌ Response is not valid JSON');
          console.log(`📝 Raw response: ${responseData.substring(0, 200)}...`);
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Error: ${error.message}`);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Run the function
console.log('🔑 Using API Token:', API_TOKEN.substring(0, 5) + '...');
createCandidate()
  .then(() => console.log('\n✨ Candidate creation test completed'))
  .catch(error => console.error('❌ Failed:', error));
