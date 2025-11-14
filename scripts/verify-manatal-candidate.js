const https = require('https');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';
const API_VERSION = 'open/v3'; // Changed back to original endpoint format

// Get candidate ID from command line argument or use default test ID
const CANDIDATE_ID = process.argv[2] || '127835665';

// Function to make API request
function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/${API_VERSION}${path}`,
      method: method,
      headers: {
        'Authorization': `Token ${API_TOKEN}`
      }
    };
    
    console.log(`Making ${method} request to ${options.path}`);
    
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
          console.log('Raw response:', responseData);
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
    
    req.end();
  });
}

// Main function to verify candidate data
async function verifyCandidate() {
  try {
    console.log(`=== Verifying Candidate ID: ${CANDIDATE_ID} ===`);
    
    // Step 1: Get candidate data
    console.log('\n=== Step 1: Getting Candidate Data ===');
    const candidateResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/`);
    
    if (candidateResponse.statusCode !== 200) {
      console.error('Failed to get candidate data:', candidateResponse);
      return;
    }
    
    const candidate = candidateResponse.data;
    console.log('\nCandidate Basic Info:');
    console.log(`Name: ${candidate.first_name} ${candidate.last_name}`);
    console.log(`Email: ${candidate.email}`);
    console.log(`Position: ${candidate.position}`);
    
    // Step 2: Check custom fields
    console.log('\n=== Step 2: Checking Custom Fields ===');
    if (candidate.custom_fields && Object.keys(candidate.custom_fields).length > 0) {
      console.log('\nCustom Fields:');
      console.log(`Found ${Object.keys(candidate.custom_fields).length} custom fields`);
      
      // Get custom field definitions to map IDs to names
      const fieldsResponse = await makeRequest('GET', '/custom-fields/?entity_type=candidate');
      
      if (fieldsResponse.statusCode === 200) {
        const fieldDefinitions = fieldsResponse.data;
        const fieldMap = {};
        
        // Create a map of field IDs to names
        fieldDefinitions.forEach(field => {
          fieldMap[field.id] = field.name;
        });
        
        // Display custom fields with their names
        Object.entries(candidate.custom_fields).forEach(([key, value]) => {
          const fieldName = fieldMap[key] || 'Unknown Field';
          console.log(`${fieldName} (${key}): ${value}`);
        });
        
        // Look for personality-related fields
        console.log('\nPersonality-Related Fields:');
        const personalityFields = Object.entries(candidate.custom_fields).filter(([key, _]) => {
          const name = fieldMap[key] || '';
          return name.toLowerCase().includes('personality') || 
                 name.toLowerCase().includes('quiz') || 
                 /q\d+/i.test(name) || 
                 name.toLowerCase().includes('question');
        });
        
        if (personalityFields.length > 0) {
          personalityFields.forEach(([key, value]) => {
            const fieldName = fieldMap[key] || 'Unknown Field';
            console.log(`${fieldName} (${key}): ${value}`);
          });
        } else {
          console.log('No personality-related fields found');
        }
      } else {
        // Fallback if we can't get field definitions
        Object.entries(candidate.custom_fields).forEach(([key, value]) => {
          console.log(`${key}: ${value}`);
        });
      }
    } else {
      console.log('No custom fields found');
    }
    
    // Step 3: Check attachments
    console.log('\n=== Step 3: Checking Attachments ===');
    const attachmentsResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/attachments/`);
    
    if (attachmentsResponse.statusCode !== 200) {
      console.error('Failed to get attachments:', attachmentsResponse);
    } else {
      const attachments = attachmentsResponse.data;
      if (attachments.length > 0) {
        console.log(`\nFound ${attachments.length} attachments:`);
        attachments.forEach((attachment, index) => {
          console.log(`${index + 1}. ${attachment.name || 'Unnamed'} (${attachment.file_type || 'Unknown type'})`);
          console.log(`   ID: ${attachment.id}`);
          console.log(`   Created: ${attachment.created_at}`);
          console.log(`   File URL: ${attachment.file || 'No URL provided'}`);
          
          // Check if this is likely the resume
          const isResume = 
            (attachment.name && (
              attachment.name.toLowerCase().includes('resume') || 
              attachment.name.toLowerCase().includes('cv') ||
              attachment.name.toLowerCase().includes('miller')
            )) ||
            (attachment.file_type && (
              attachment.file_type.toLowerCase().includes('pdf') ||
              attachment.file_type.toLowerCase().includes('doc')
            ));
          
          if (isResume) {
            console.log(`   ✓ This appears to be the resume`);
            
            // Try to get more details about this attachment
            console.log(`\n   Attempting to get more details about this attachment...`);
            makeRequest('GET', `/candidates/${CANDIDATE_ID}/attachments/${attachment.id}/`)
              .then(detailResponse => {
                if (detailResponse.statusCode === 200) {
                  console.log(`   Additional details:`);
                  console.log(`   - Size: ${detailResponse.data.size || 'Unknown'} bytes`);
                  console.log(`   - Content type: ${detailResponse.data.content_type || 'Unknown'}`);
                  console.log(`   - Download URL: ${detailResponse.data.file || 'No URL'}`);
                } else {
                  console.log(`   Could not get additional details: ${detailResponse.statusCode}`);
                }
              })
              .catch(err => console.error(`   Error getting attachment details: ${err.message}`));
          }
        });
      } else {
        console.log('\nNo attachments found - RESUME UPLOAD FAILED');
        console.log('This is a critical issue as resume uploads are not working.');
      }
    }
    
    // Step 4: Check notes
    console.log('\n=== Step 4: Checking Notes ===');
    const notesResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/notes/`);
    
    if (notesResponse.statusCode !== 200) {
      console.error('Failed to get notes:', notesResponse);
    } else {
      const notes = notesResponse.data;
      if (notes.length > 0) {
        console.log(`\nFound ${notes.length} notes:`);
        notes.forEach((note, index) => {
          console.log(`${index + 1}. Note ID: ${note.id}`);
          console.log(`   Created: ${note.created_at}`);
          console.log(`   Created by: ${note.created_by_name || 'Unknown'} (ID: ${note.created_by || 'Unknown'})`);
          console.log(`   Content: ${note.note.substring(0, 100)}${note.note.length > 100 ? '...' : ''}`);
          
          // Check if this note contains personality quiz results
          const hasPersonalityData = note.note.includes('personality questionnaire') || 
                                    note.note.includes('Extraversion:') || 
                                    note.note.includes('Conscientiousness:') || 
                                    note.note.includes('Agreeableness:') || 
                                    note.note.includes('Openness:') || 
                                    note.note.includes('Emotional Stability:');
          
          if (hasPersonalityData) {
            console.log(`   ✓ This note contains personality quiz results`);
            console.log(`\n   Full note content:`);
            console.log(`   ${note.note.replace(/\n/g, '\n   ')}`);
            
            // Try to get more details about this note
            console.log(`\n   Attempting to get more details about this note...`);
            makeRequest('GET', `/candidates/${CANDIDATE_ID}/notes/${note.id}/`)
              .then(detailResponse => {
                if (detailResponse.statusCode === 200) {
                  console.log(`   Additional details:`);
                  console.log(`   - Last modified: ${detailResponse.data.modified_at || 'Unknown'}`);
                  console.log(`   - Is visible in UI: ${detailResponse.data.is_visible !== false ? 'Yes' : 'No'}`);
                } else {
                  console.log(`   Could not get additional details: ${detailResponse.statusCode}`);
                }
              })
              .catch(err => console.error(`   Error getting note details: ${err.message}`));
          }
        });
      } else {
        console.log('\nNo notes found - NOTES CREATION FAILED');
        console.log('This is a critical issue as notes are not being saved.');
      }
    }
    
    console.log('\n=== Verification Complete ===');
    console.log(`Candidate ID: ${CANDIDATE_ID}`);
    console.log(`Manatal UI URL: https://app.manatal.com/candidates/${CANDIDATE_ID}`);
    
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

// Run the function
verifyCandidate();
