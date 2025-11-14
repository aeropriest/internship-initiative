const https = require('https');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';
const API_VERSION = 'v1';

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

// Main function to get custom fields
async function getCustomFields() {
  try {
    console.log('=== Getting Manatal Custom Fields ===');
    
    // Get all custom fields for candidates
    const fieldsResponse = await makeRequest('GET', '/custom-fields/?entity_type=candidate');
    
    if (fieldsResponse.statusCode !== 200) {
      console.error('Failed to get custom fields:', fieldsResponse);
      return;
    }
    
    const customFields = fieldsResponse.data;
    console.log(`Found ${customFields.length} custom fields`);
    
    // Print all fields with their IDs
    console.log('\n=== Custom Field IDs ===');
    customFields.forEach(field => {
      console.log(`${field.name}: ${field.id}`);
    });
    
    // Look for specific fields related to personality quiz
    console.log('\n=== Personality Quiz Fields ===');
    const quizFields = customFields.filter(field => 
      field.name.includes('personality') || 
      field.name.includes('quiz') || 
      field.name.includes('question') ||
      /Q\d+/.test(field.name)
    );
    
    quizFields.forEach(field => {
      console.log(`${field.name}: ${field.id}`);
    });
    
    // Generate JavaScript code for mapping question IDs
    console.log('\n=== JavaScript Code for Question Field Mapping ===');
    console.log('const questionFieldIds = {');
    
    for (let i = 1; i <= 30; i++) {
      const questionField = customFields.find(field => 
        field.name.includes(`Q${i}`) || 
        field.name.includes(`question_${i}`) ||
        field.name.includes(`question${i}`)
      );
      
      if (questionField) {
        console.log(`  ${i}: "${questionField.id}", // ${questionField.name}`);
      } else {
        console.log(`  ${i}: null, // Not found`);
      }
    }
    
    console.log('};');
    
  } catch (error) {
    console.error('Failed to get custom fields:', error);
  }
}

// Run the function
getCustomFields();
