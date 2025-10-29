const https = require('https');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';
const API_PATH = '/open/v3/candidates/';

// Generate unique identifier for test candidate
const timestamp = Date.now();
const testCandidate = {
  full_name: `Test Support Request ${timestamp}`,
  email: `test.support.${timestamp}@example.com`,
  phone_number: '+1234567890',
  candidate_location: 'Hong Kong',
  description: 'This is a test candidate created for Manatal support request',
  current_position: 'Internship Applicant',
  custom_fields: {
    application_flow: 'API Test',
    position_applied: 'Golf Internship',
    application_source: 'Website',
    application_notes: 'Created for testing the questionnaire integration with Manatal support'
  }
};

// Function to make API request
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: '/open/v3' + path,
      method: method,
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.headers['Content-Length'] = JSON.stringify(data).length;
    }
    
    console.log(`Making ${method} request to ${options.path}`);
    if (data) {
      console.log('Request data:', JSON.stringify(data, null, 2));
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode} ${res.statusMessage}`);
        
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Response data (truncated):', JSON.stringify(jsonData).substring(0, 300) + '...');
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          console.log('Response is not valid JSON');
          console.log('Raw response (truncated):', responseData.substring(0, 300) + '...');
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Main function to run the test
async function runTest() {
  try {
    console.log('=== Creating Test Candidate ===');
    console.log(`Name: ${testCandidate.full_name}`);
    console.log(`Email: ${testCandidate.email}`);
    
    // Step 1: Create a candidate
    const createResponse = await makeRequest('POST', '/candidates/', testCandidate);
    
    if (createResponse.statusCode !== 201 || !createResponse.data.id) {
      console.error('Failed to create candidate:', createResponse);
      return;
    }
    
    const candidateId = createResponse.data.id;
    console.log(`\nCandidate created successfully with ID: ${candidateId}`);
    
    // Step 2: Add questionnaire answers
    console.log('\n=== Adding Questionnaire Answers ===');
    
    const quizData = {
      custom_fields: {
        personality_extraversion: '4.00',
        personality_conscientiousness: '4.50',
        personality_agreeableness: '4.50',
        personality_openness: '4.50',
        personality_emotionalstability: '3.50',
        quiz_completed: true,
        quiz_completed_at: new Date().toISOString()
      }
    };
    
    const updateResponse = await makeRequest('PATCH', `/candidates/${candidateId}/`, quizData);
    
    if (updateResponse.statusCode !== 200) {
      console.error('Failed to add questionnaire answers:', updateResponse);
      return;
    }
    
    console.log('\nQuestionnaire answers added successfully');
    
    // Step 3: Verify the candidate data
    console.log('\n=== Verifying Candidate Data ===');
    
    const verifyResponse = await makeRequest('GET', `/candidates/${candidateId}/`);
    
    console.log('\nFinal candidate data (full):');
    console.log(JSON.stringify(verifyResponse.data, null, 2));
    
    console.log('\n=== Test Complete ===');
    console.log(`Candidate ID: ${candidateId}`);
    console.log(`Candidate Name: ${testCandidate.full_name}`);
    console.log(`Candidate Email: ${testCandidate.email}`);
    console.log(`\nPlease check app.manatal.com/candidates/${candidateId} to verify the data`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
