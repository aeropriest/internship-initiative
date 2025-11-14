const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';
const API_VERSION = 'open/v3'; // Changed back to original endpoint format

// Generate unique identifier for test candidate
const timestamp = Date.now();
const candidateData = {
  full_name: 'Aaron Jason Miller',
  email: `aaron.miller.${timestamp}@example.com`,
  phone_number: '+13868683442',
  candidate_location: 'Los Angeles, CA 90291',
  description: 'Experienced Amazon Associate with five years tenure in a shipping yard setting, maintaining an average picking/packing speed of 98%. Holds a zero error% score in adhering to packing specs and 97% error-free ratio on packing records. Completed a certificate in Warehouse Sanitation and has a valid commercial drivers license.',
  current_position: 'Amazon Warehouse Associate',
  notes: 'This candidate has completed our personality questionnaire with the following scores:\n- Extraversion: 3.8/5\n- Conscientiousness: 4.2/5\n- Agreeableness: 4.3/5\n- Openness: 3.8/5\n- Emotional Stability: 3.5/5',
  // Custom fields
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

// Sample answers for the 30 questions (1-5 scale)
const questionAnswers = {
  // Extraversion (1-6)
  1: 4, // I enjoy meeting new people
  2: 3, // I feel comfortable leading a group
  3: 4, // I gain energy from social interactions
  4: 5, // I like to share my ideas with others
  5: 3, // I find it easy to start conversations
  6: 4, // I prefer being busy and surrounded by people
  // Agreeableness (7-12)
  7: 5, // I try to see things from others' perspectives
  8: 4, // I am quick to forgive others
  9: 5, // I enjoy helping people solve problems
  10: 3, // I value harmony over competition
  11: 4, // I'm compassionate toward others' feelings
  12: 5, // I find it easy to cooperate in teams
  // Conscientiousness (13-18)
  13: 4, // I plan my tasks before I start them
  14: 5, // I often set personal goals
  15: 3, // I like maintaining order and routine
  16: 4, // I fulfill my promises on time
  17: 5, // I pay attention to details
  18: 4, // I keep going until a task is fully completed
  // Openness (19-24)
  19: 3, // I enjoy exploring new ideas or hobbies
  20: 4, // I adapt easily to new situations
  21: 5, // I am curious about how things work
  22: 4, // I enjoy learning from experiences
  23: 3, // I try new approaches when solving problems
  24: 4, // I like diverse perspectives on issues
  // Emotional Stability (25-30)
  25: 3, // I remain calm under pressure
  26: 4, // I handle unexpected challenges well
  27: 3, // I recover quickly after setbacks
  28: 4, // I stay positive even in stressful situations
  29: 3, // I control my emotions in disagreements
  30: 4  // I rarely feel anxious or irritated
};

// Function to make API request
function makeRequest(method, path, data = null, isFormData = false) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/${API_VERSION}${path}`,
      method: method,
      headers: {
        'Authorization': `Token ${API_TOKEN}`
      }
    };
    
    if (data && !isFormData) {
      options.headers['Content-Type'] = 'application/json';
    }
    
    console.log(`Making ${method} request to ${options.path}`);
    if (data && !isFormData) {
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
      if (isFormData) {
        data.pipe(req);
      } else {
        req.write(JSON.stringify(data));
        req.end();
      }
    } else {
      req.end();
    }
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
        path: `/${API_VERSION}/candidates/${candidateId}/resume/`,
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_TOKEN}`,
          ...form.getHeaders()
        }
      };
      
      console.log(`Making resume upload request to ${options.path}`);
      console.log(`File: ${fileName}, Content-Type: ${contentType}`);
      console.log(`File size: ${(resumeData.length / 1024).toFixed(2)} KB`);
      
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
    console.log('=== Step 1: Creating Candidate with Custom Fields ===');
    console.log(`Name: ${candidateData.full_name}`);
    console.log(`Email: ${candidateData.email}`);
    
    // Create candidate
    const createResponse = await makeRequest('POST', '/candidates/', candidateData);
    
    if (createResponse.statusCode !== 201 || !createResponse.data.id) {
      console.error('Failed to create candidate:', createResponse);
      return;
    }
    
    const candidateId = createResponse.data.id;
    console.log(`\nCandidate created successfully with ID: ${candidateId}`);
    
    console.log('\n=== Step 3: Uploading Resume ===');
    
    // Upload resume
    const resumePath = path.resolve(process.env.HOME, 'Downloads/json-miller-resume.pdf');
    console.log(`Looking for resume at: ${resumePath}`);
    
    if (fs.existsSync(resumePath)) {
      console.log(`Resume file found: ${resumePath}`);
      console.log(`File size: ${(fs.statSync(resumePath).size / 1024).toFixed(2)} KB`);
      
      try {
        const uploadResponse = await uploadResume(candidateId, resumePath);
        
        if (uploadResponse.statusCode !== 201) {
          console.error('Failed to upload resume:', uploadResponse);
        } else {
          console.log('Resume uploaded successfully');
        }
      } catch (error) {
        console.error('Error during resume upload:', error);
      }
    } else {
      console.log(`Resume file not found at ${resumePath}`);
      console.log('Checking parent directories...');
      
      // Try to find the file in the Downloads directory
      const downloadsDir = path.resolve(process.env.HOME, 'Downloads');
      if (fs.existsSync(downloadsDir)) {
        console.log(`Listing files in ${downloadsDir}:`);
        const files = fs.readdirSync(downloadsDir);
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
        console.log(`Found ${pdfFiles.length} PDF files:`);
        pdfFiles.forEach(file => console.log(`- ${file}`));
        
        // Try to find a file that might match
        const possibleMatch = pdfFiles.find(file => 
          file.toLowerCase().includes('miller') || 
          file.toLowerCase().includes('jason') || 
          file.toLowerCase().includes('resume')
        );
        
        if (possibleMatch) {
          const altPath = path.join(downloadsDir, possibleMatch);
          console.log(`Found possible match: ${altPath}`);
          console.log('Attempting to upload this file instead...');
          
          try {
            const uploadResponse = await uploadResume(candidateId, altPath);
            
            if (uploadResponse.statusCode !== 201) {
              console.error('Failed to upload alternate file:', uploadResponse);
            } else {
              console.log('Alternate file uploaded successfully');
            }
          } catch (error) {
            console.error('Error during alternate file upload:', error);
          }
        }
      }
    }
    
    console.log('\n=== Step 4: Adding Notes ===');
    
    // Add notes by updating the candidate
    const notesData = {
      notes: `${candidateData.notes}\n\nADDITIONAL NOTE: Aaron Jason Miller has completed our 30-question personality questionnaire with good results. The candidate shows strong traits in conscientiousness (4.2/5) and agreeableness (4.3/5), which align well with the Warehouse Manager position requirements.\n\nHis experience at Amazon with 98% picking/packing speed and near-perfect error rates demonstrates his attention to detail and efficiency. Recommended for interview.`
    };
    
    const addNotesResponse = await makeRequest('PATCH', `/candidates/${candidateId}/`, notesData);
    
    if (addNotesResponse.statusCode !== 200) {
      console.error('Failed to add notes:', addNotesResponse);
    } else {
      console.log('Notes added successfully');
    }
    
    console.log('\n=== Step 5: Verifying Candidate Data ===');
    
    // Verify candidate data
    const verifyResponse = await makeRequest('GET', `/candidates/${candidateId}/`);
    
    if (verifyResponse.statusCode !== 200) {
      console.error('Failed to verify candidate data:', verifyResponse);
      return;
    }
    
    const retrievedData = verifyResponse.data;
    console.log('\nFinal candidate data retrieved successfully');
    
    // Compare submitted data with retrieved data
    console.log('\n=== Data Comparison ===');
    
    // Basic fields
    console.log('\nBasic Fields:');
    console.log(`Name: ${candidateData.full_name} => ${retrievedData.full_name} [${candidateData.full_name === retrievedData.full_name ? 'MATCH' : 'MISMATCH'}]`);
    console.log(`Email: ${candidateData.email} => ${retrievedData.email} [${candidateData.email === retrievedData.email ? 'MATCH' : 'MISMATCH'}]`);
    console.log(`Phone: ${candidateData.phone_number} => ${retrievedData.phone_number} [${candidateData.phone_number === retrievedData.phone_number ? 'MATCH' : 'MISMATCH'}]`);
    console.log(`Location: ${candidateData.candidate_location} => ${retrievedData.candidate_location} [${candidateData.candidate_location === retrievedData.candidate_location ? 'MATCH' : 'MISMATCH'}]`);
    console.log(`Position: ${candidateData.current_position} => ${retrievedData.current_position} [${candidateData.current_position === retrievedData.current_position ? 'MATCH' : 'MISMATCH'}]`);
    
    // Summary/description
    console.log('\nSummary:');
    const summaryMatch = retrievedData.description && retrievedData.description.includes(candidateData.description.substring(0, 50));
    console.log(`Submitted: ${candidateData.description.substring(0, 100)}...`);
    console.log(`Retrieved: ${retrievedData.description ? retrievedData.description.substring(0, 100) + '...' : 'NOT FOUND'}`);
    console.log(`Summary comparison: [${summaryMatch ? 'MATCH' : 'MISMATCH'}]`);
    
    // Check custom fields
    console.log('\nCustom Fields:');
    if (retrievedData.custom_fields && Object.keys(retrievedData.custom_fields).length > 0) {
      Object.entries(retrievedData.custom_fields).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    } else {
      console.log('No custom fields found in retrieved data');
    }
    
    // Check for attachments
    console.log('\nChecking for resume attachment...');
    const attachmentsResponse = await makeRequest('GET', `/candidates/${candidateId}/attachments/`);
    
    if (attachmentsResponse.statusCode !== 200) {
      console.error('Failed to get attachments:', attachmentsResponse);
    } else {
      const attachments = attachmentsResponse.data;
      if (attachments.length > 0) {
        console.log(`Found ${attachments.length} attachments:`);
        attachments.forEach((attachment, index) => {
          console.log(`${index + 1}. ${attachment.name} (${attachment.file_type})`);
          console.log(`   URL: ${attachment.file}`);
        });
      } else {
        console.log('No attachments found - RESUME UPLOAD FAILED');
      }
    }
    
    // Check for notes
    console.log('\nChecking for notes...');
    const notesResponse = await makeRequest('GET', `/candidates/${candidateId}/notes/`);
    
    if (notesResponse.statusCode !== 200) {
      console.error('Failed to get notes:', notesResponse);
    } else {
      const notes = notesResponse.data;
      if (notes.length > 0) {
        console.log(`Found ${notes.length} notes:`);
        notes.forEach((note, index) => {
          console.log(`${index + 1}. Created: ${note.created_at}`);
          console.log(`   Content: ${note.note.substring(0, 100)}${note.note.length > 100 ? '...' : ''}`);
        });
      } else {
        console.log('No notes found - NOTES CREATION FAILED');
      }
    }
    
    console.log('\n=== Test Complete ===');
    console.log(`Candidate ID: ${candidateId}`);
    console.log(`Candidate Name: ${candidateData.first_name} ${candidateData.last_name}`);
    console.log(`Candidate Email: ${candidateData.email}`);
    console.log(`\nPlease check app.manatal.com/candidates/${candidateId} to verify the data`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
