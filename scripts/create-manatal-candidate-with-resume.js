const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';

// Generate unique identifier for test candidate
const timestamp = Date.now();
const testCandidate = {
  full_name: `Jason Miller`,
  email: `jason.miller.${timestamp}@example.com`,
  phone_number: '+13868683442',
  candidate_location: 'Los Angeles, CA',
  description: 'Experienced Amazon Associate with five years tenure in a shipping yard setting, maintaining an average picking/packing speed of 98%. Holds a zero error% score in adhering to packing specs and 97% error-free ratio on packing records.',
  current_position: 'Amazon Warehouse Associate',
  notes: 'This candidate has completed our personality questionnaire with the following scores:\n- Extraversion: 3.8/5\n- Conscientiousness: 4.2/5\n- Agreeableness: 4.3/5\n- Openness: 3.8/5\n- Emotional Stability: 3.5/5',
  custom_fields: {
    application_flow: 'Website Application',
    position_applied: 'Warehouse Manager',
    application_source: 'Indeed',
    application_notes: 'Strong candidate with excellent warehouse experience',
    personality_extraversion: '3.80',
    personality_conscientiousness: '4.20',
    personality_agreeableness: '4.30',
    personality_openness: '3.80',
    personality_emotionalstability: '3.50',
    quiz_completed: true,
    quiz_completed_at: new Date().toISOString()
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

// Function to upload resume
async function uploadResume(candidateId, resumePath) {
  console.log(`\nUploading resume for candidate ${candidateId}...`);
  
  try {
    // Read the resume file
    const resumeData = fs.readFileSync(resumePath);
    const fileName = path.basename(resumePath);
    
    // Determine content type based on file extension
    const ext = path.extname(resumePath).toLowerCase();
    let contentType = 'application/pdf';
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    // Create form data
    const form = new FormData();
    form.append('resume', resumeData, {
      filename: fileName,
      contentType: contentType
    });
    form.append('candidate_id', candidateId.toString());
    
    // Make the request
    return new Promise((resolve, reject) => {
      const options = {
        hostname: BASE_URL,
        path: '/open/v3/candidates/' + candidateId + '/resume/',
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_TOKEN}`,
          ...form.getHeaders()
        }
      };
      
      console.log(`Making resume upload request to ${options.path}`);
      console.log(`File: ${fileName}, Content-Type: ${contentType}`);
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          console.log(`Resume upload response status: ${res.statusCode} ${res.statusMessage}`);
          
          try {
            const jsonData = JSON.parse(responseData);
            console.log('Resume upload response:', JSON.stringify(jsonData, null, 2));
            resolve({
              statusCode: res.statusCode,
              data: jsonData
            });
          } catch (e) {
            console.log('Response is not valid JSON');
            console.log('Raw response:', responseData);
            resolve({
              statusCode: res.statusCode,
              data: responseData
            });
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Resume upload error:', error);
        reject(error);
      });
      
      form.pipe(req);
    });
  } catch (error) {
    console.error('Error reading resume file:', error);
    throw error;
  }
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
    
    // Step 2: Upload resume
    const resumePath = path.resolve(process.env.HOME, 'Downloads/json-miller-resume.pdf');
    if (fs.existsSync(resumePath)) {
      await uploadResume(candidateId, resumePath);
    } else {
      console.log(`Resume file not found at ${resumePath}`);
    }
    
    // Step 3: Add additional data if needed
    console.log('\n=== Adding Additional Data ===');
    
    // We already included the quiz data in the initial creation
    // But we could update with additional fields if needed
    const additionalData = {
      notes: `Updated notes for candidate ${candidateId}:\n\nJason Miller has completed our 30-question personality questionnaire with good results. The candidate shows strong traits in conscientiousness (4.2/5) and agreeableness (4.3/5), which align well with the Warehouse Manager position requirements.\n\nHis experience at Amazon with 98% picking/packing speed and near-perfect error rates demonstrates his attention to detail and efficiency. Recommended for interview.`
    };
    
    const updateResponse = await makeRequest('PATCH', `/candidates/${candidateId}/`, additionalData);
    
    if (updateResponse.statusCode !== 200) {
      console.error('Failed to add questionnaire answers:', updateResponse);
      return;
    }
    
    console.log('\nQuestionnaire answers added successfully');
    
    // Step 4: Verify the candidate data
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
