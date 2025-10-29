const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';

// Generate unique identifier for test candidate
const timestamp = Date.now();
const candidateName = `AA Test Comprehensive ${timestamp}`;

// Log file setup
const logFile = path.join(__dirname, `manatal-test-${timestamp}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Helper function to log to both console and file
function log(message) {
  const formattedMessage = typeof message === 'object' 
    ? JSON.stringify(message, null, 2) 
    : message;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

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
    
    log(`\n[${new Date().toISOString()}] Making ${method} request to ${options.path}`);
    if (data) {
      log('Request data:');
      log(data);
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        log(`Response status: ${res.statusCode} ${res.statusMessage}`);
        
        try {
          const jsonData = JSON.parse(responseData);
          log('Response data (truncated):');
          log(jsonData);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          log('Response is not valid JSON');
          log(`Raw response: ${responseData.substring(0, 300)}...`);
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      log(`Request error: ${error.message}`);
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Function to upload file (resume, attachment, etc.)
async function uploadFile(candidateId, filePath, endpoint) {
  log(`\n[${new Date().toISOString()}] Uploading file to ${endpoint} for candidate ${candidateId}...`);
  
  try {
    // Read the file
    const fileData = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    // Create form data
    const form = new FormData();
    form.append('file', fileData, {
      filename: fileName,
      contentType: contentType
    });
    
    if (endpoint.includes('resume')) {
      form.append('candidate_id', candidateId.toString());
    }
    
    // Make the request
    return new Promise((resolve, reject) => {
      const options = {
        hostname: BASE_URL,
        path: '/open/v3' + endpoint,
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_TOKEN}`,
          ...form.getHeaders()
        }
      };
      
      log(`Making file upload request to ${options.path}`);
      log(`File: ${fileName}, Content-Type: ${contentType}`);
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          log(`File upload response status: ${res.statusCode} ${res.statusMessage}`);
          
          try {
            const jsonData = JSON.parse(responseData);
            log('File upload response:');
            log(jsonData);
            resolve({
              statusCode: res.statusCode,
              data: jsonData
            });
          } catch (e) {
            log('Response is not valid JSON');
            log(`Raw response: ${responseData}`);
            resolve({
              statusCode: res.statusCode,
              data: responseData
            });
          }
        });
      });
      
      req.on('error', (error) => {
        log(`File upload error: ${error.message}`);
        reject(error);
      });
      
      form.pipe(req);
    });
  } catch (error) {
    log(`Error reading file: ${error.message}`);
    throw error;
  }
}

// Function to add a note to a candidate
async function addNote(candidateId, content) {
  log(`\n[${new Date().toISOString()}] Adding note for candidate ${candidateId}...`);
  
  const noteData = {
    content: content,
    candidate: candidateId
  };
  
  return makeRequest('POST', '/notes/', noteData);
}

// Main function to run the tests
async function runTests() {
  try {
    log(`\n=== Starting Comprehensive Manatal API Test at ${new Date().toISOString()} ===`);
    log(`Candidate Name: ${candidateName}`);
    
    // TEST 1: Create a basic candidate
    log('\n=== TEST 1: Creating Basic Candidate ===');
    
    const basicCandidate = {
      full_name: candidateName,
      email: `test.${timestamp}@example.com`,
      phone_number: '+1234567890',
      current_position: 'Internship Applicant'
    };
    
    const createResponse = await makeRequest('POST', '/candidates/', basicCandidate);
    
    if (createResponse.statusCode !== 201 || !createResponse.data.id) {
      log('❌ TEST 1 FAILED: Could not create candidate');
      return;
    }
    
    const candidateId = createResponse.data.id;
    log(`✅ TEST 1 PASSED: Candidate created with ID: ${candidateId}`);
    
    // TEST 2: Update candidate with description and notes
    log('\n=== TEST 2: Updating Candidate with Description and Notes ===');
    
    const updateData = {
      description: 'This is a test candidate created for Manatal API testing',
      notes: 'This candidate has completed our personality questionnaire with the following scores:\n- Extraversion: 4.0/5\n- Conscientiousness: 4.5/5\n- Agreeableness: 4.5/5\n- Openness: 4.5/5\n- Emotional Stability: 3.5/5'
    };
    
    const updateResponse = await makeRequest('PATCH', `/candidates/${candidateId}/`, updateData);
    
    if (updateResponse.statusCode !== 200) {
      log('❌ TEST 2 FAILED: Could not update candidate');
    } else {
      log('✅ TEST 2 PASSED: Candidate updated with description and notes');
    }
    
    // TEST 3: Add custom fields
    log('\n=== TEST 3: Adding Custom Fields ===');
    
    const customFieldsData = {
      custom_fields: {
        personality_extraversion: '4.00',
        personality_conscientiousness: '4.50',
        personality_agreeableness: '4.50',
        personality_openness: '4.50',
        personality_emotionalstability: '3.50',
        quiz_completed: true,
        quiz_completed_at: new Date().toISOString(),
        questionnaire_q1: 'I enjoy meeting new people and networking at events.',
        questionnaire_a1: 'Agree (4/5)',
        questionnaire_q2: 'I always plan my tasks and meet deadlines ahead of time.',
        questionnaire_a2: 'Strongly Agree (5/5)',
        questionnaire_q3: 'I prefer collaborating with a team rather than working alone.',
        questionnaire_a3: 'Agree (4/5)',
        questionnaire_q4: 'I like exploring new ideas and learning emerging technologies.',
        questionnaire_a4: 'Strongly Agree (5/5)',
        questionnaire_q5: 'I stay calm and focused during stressful situations.',
        questionnaire_a5: 'Neutral (3/5)'
      }
    };
    
    const customFieldsResponse = await makeRequest('PATCH', `/candidates/${candidateId}/`, customFieldsData);
    
    if (customFieldsResponse.statusCode !== 200) {
      log('❌ TEST 3 FAILED: Could not add custom fields');
    } else {
      log('✅ TEST 3 PASSED: Custom fields added');
    }
    
    // TEST 4: Upload resume
    log('\n=== TEST 4: Uploading Resume ===');
    
    const resumePath = path.resolve(process.env.HOME, 'Downloads/sample-resume.jpg');
    if (fs.existsSync(resumePath)) {
      const resumeResponse = await uploadFile(candidateId, resumePath, `/candidates/${candidateId}/resume/`);
      
      if (resumeResponse.statusCode !== 201) {
        log('❌ TEST 4 FAILED: Could not upload resume');
      } else {
        log('✅ TEST 4 PASSED: Resume uploaded');
      }
    } else {
      log(`⚠️ TEST 4 SKIPPED: Resume file not found at ${resumePath}`);
    }
    
    // TEST 5: Add a note using the notes endpoint
    log('\n=== TEST 5: Adding Note via Notes Endpoint ===');
    
    const noteContent = `Personality Questionnaire Results:\n\nThis candidate completed our personality assessment with the following scores:\n\n- Extraversion: 4.0/5\n- Conscientiousness: 4.5/5\n- Agreeableness: 4.5/5\n- Openness: 4.5/5\n- Emotional Stability: 3.5/5\n\nThe candidate shows strong traits in conscientiousness and openness, which align well with our company values.`;
    
    const noteResponse = await addNote(candidateId, noteContent);
    
    if (noteResponse.statusCode !== 201) {
      log('❌ TEST 5 FAILED: Could not add note');
    } else {
      log('✅ TEST 5 PASSED: Note added');
    }
    
    // TEST 6: Upload attachment
    log('\n=== TEST 6: Uploading Attachment ===');
    
    const attachmentPath = path.resolve(process.env.HOME, 'Downloads/sample-resume.jpg');
    if (fs.existsSync(attachmentPath)) {
      const attachmentResponse = await uploadFile(candidateId, attachmentPath, `/candidates/${candidateId}/attachments/`);
      
      if (attachmentResponse.statusCode !== 201 && attachmentResponse.statusCode !== 200) {
        log('❌ TEST 6 FAILED: Could not upload attachment');
      } else {
        log('✅ TEST 6 PASSED: Attachment uploaded');
      }
    } else {
      log(`⚠️ TEST 6 SKIPPED: Attachment file not found at ${attachmentPath}`);
    }
    
    // TEST 7: Verify all data
    log('\n=== TEST 7: Verifying All Candidate Data ===');
    
    const verifyResponse = await makeRequest('GET', `/candidates/${candidateId}/`);
    
    if (verifyResponse.statusCode !== 200) {
      log('❌ TEST 7 FAILED: Could not verify candidate data');
    } else {
      log('✅ TEST 7 PASSED: Candidate data verified');
      log('\nFinal candidate data:');
      log(verifyResponse.data);
    }
    
    // TEST 8: Get candidate notes
    log('\n=== TEST 8: Getting Candidate Notes ===');
    
    const notesResponse = await makeRequest('GET', `/candidates/${candidateId}/notes/`);
    
    if (notesResponse.statusCode !== 200) {
      log('❌ TEST 8 FAILED: Could not get candidate notes');
    } else {
      log('✅ TEST 8 PASSED: Candidate notes retrieved');
      log('\nCandidate notes:');
      log(notesResponse.data);
    }
    
    // TEST 9: Get candidate attachments
    log('\n=== TEST 9: Getting Candidate Attachments ===');
    
    const attachmentsResponse = await makeRequest('GET', `/candidates/${candidateId}/attachments/`);
    
    if (attachmentsResponse.statusCode !== 200) {
      log('❌ TEST 9 FAILED: Could not get candidate attachments');
    } else {
      log('✅ TEST 9 PASSED: Candidate attachments retrieved');
      log('\nCandidate attachments:');
      log(attachmentsResponse.data);
    }
    
    log('\n=== Test Complete ===');
    log(`Candidate ID: ${candidateId}`);
    log(`Candidate Name: ${candidateName}`);
    log(`\nPlease check app.manatal.com/candidates/${candidateId} to verify the data`);
    log(`Log file saved to: ${logFile}`);
    
  } catch (error) {
    log(`\n❌ Test failed with error: ${error.message}`);
    if (error.stack) {
      log(error.stack);
    }
  } finally {
    logStream.end();
  }
}

// Run the tests
runTests();
