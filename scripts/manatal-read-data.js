const https = require('https');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';

// Candidate ID to check - replace with the ID of the candidate we created earlier
const CANDIDATE_ID = '127835665'; // AA Test Support Request candidate ID

// Function to make API request
function makeRequest(method, path) {
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
    
    console.log(`\nMaking ${method} request to ${options.path}`);
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode} ${res.statusMessage}`);
        
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          console.log('Response is not valid JSON');
          console.log(`Raw response: ${responseData.substring(0, 300)}...`);
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Request error: ${error.message}`);
      reject(error);
    });
    
    req.end();
  });
}

// Main function to run the tests
async function readCandidateData() {
  try {
    console.log(`\n=== Reading Candidate Data for ID: ${CANDIDATE_ID} ===`);
    
    // TEST 1: Get candidate details
    console.log('\n=== TEST 1: Getting Candidate Details ===');
    
    const candidateResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/`);
    
    if (candidateResponse.statusCode !== 200) {
      console.log('❌ TEST 1 FAILED: Could not get candidate details');
      console.log('Error:', candidateResponse.data);
    } else {
      console.log('✅ TEST 1 PASSED: Candidate details retrieved');
      console.log('\nCandidate details:');
      console.log(JSON.stringify(candidateResponse.data, null, 2));
      
      // Check for custom fields
      console.log('\nChecking for custom fields:');
      const customFields = candidateResponse.data.custom_fields || {};
      console.log('Custom fields found:', Object.keys(customFields).length);
      console.log(JSON.stringify(customFields, null, 2));
      
      // Check for personality quiz data
      const quizFields = Object.keys(customFields).filter(key => 
        key.startsWith('personality_') || 
        key === 'quiz_completed' || 
        key === 'quiz_completed_at'
      );
      
      console.log('\nPersonality quiz fields found:', quizFields.length);
      if (quizFields.length > 0) {
        const quizData = {};
        quizFields.forEach(key => {
          quizData[key] = customFields[key];
        });
        console.log(JSON.stringify(quizData, null, 2));
      }
    }
    
    // TEST 2: Get candidate notes
    console.log('\n=== TEST 2: Getting Candidate Notes ===');
    
    const notesResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/notes/`);
    
    if (notesResponse.statusCode !== 200) {
      console.log('❌ TEST 2 FAILED: Could not get candidate notes');
      console.log('Error:', notesResponse.data);
    } else {
      console.log('✅ TEST 2 PASSED: Candidate notes retrieved');
      console.log('\nCandidate notes:');
      console.log(JSON.stringify(notesResponse.data, null, 2));
    }
    
    // TEST 3: Get candidate resume
    console.log('\n=== TEST 3: Getting Candidate Resume ===');
    
    const resumeResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/resume/`);
    
    if (resumeResponse.statusCode !== 200) {
      console.log('❌ TEST 3 FAILED: Could not get candidate resume');
      console.log('Error:', resumeResponse.data);
    } else {
      console.log('✅ TEST 3 PASSED: Candidate resume retrieved');
      console.log('\nCandidate resume:');
      console.log(JSON.stringify(resumeResponse.data, null, 2));
    }
    
    // TEST 4: Get candidate attachments
    console.log('\n=== TEST 4: Getting Candidate Attachments ===');
    
    const attachmentsResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/attachments/`);
    
    if (attachmentsResponse.statusCode !== 200) {
      console.log('❌ TEST 4 FAILED: Could not get candidate attachments');
      console.log('Error:', attachmentsResponse.data);
    } else {
      console.log('✅ TEST 4 PASSED: Candidate attachments retrieved');
      console.log('\nCandidate attachments:');
      console.log(JSON.stringify(attachmentsResponse.data, null, 2));
    }
    
    console.log('\n=== Data Reading Complete ===');
    
  } catch (error) {
    console.log(`\n❌ Test failed with error: ${error.message}`);
    if (error.stack) {
      console.log(error.stack);
    }
  }
}

// Run the tests
readCandidateData();
