// Simple script to test Manatal API connectivity
const https = require('https');

// Use the API token from command line or default
const API_TOKEN = process.argv[2] || '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';
const API_PATH = '/open/v3';

// Endpoints to test
const endpoints = [
  '/candidates/',
  '/positions/',
  '/status/'
];

// Function to make API request
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: API_PATH + path,
      method: 'GET',
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    console.log(`\n🔍 Testing endpoint: ${options.path}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
        
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ Response is valid JSON');
          
          if (jsonData.count !== undefined) {
            console.log(`📋 Found ${jsonData.count} items`);
          }
          
          if (jsonData.results && jsonData.results.length > 0) {
            console.log(`📄 First item preview: ${JSON.stringify(jsonData.results[0]).substring(0, 100)}...`);
          }
          
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          console.log('❌ Response is not valid JSON');
          console.log(`📝 Raw response: ${data.substring(0, 200)}...`);
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Error: ${error.message}`);
      reject(error);
    });
    
    req.end();
  });
}

// Main function to test all endpoints
async function testAllEndpoints() {
  console.log('🔑 Using API Token:', API_TOKEN.substring(0, 5) + '...');
  
  for (const endpoint of endpoints) {
    try {
      await makeRequest(endpoint);
    } catch (error) {
      console.error(`❌ Failed to test ${endpoint}:`, error);
    }
  }
  
  console.log('\n✨ API testing completed');
}

// Run the tests
testAllEndpoints();
