#!/usr/bin/env node

/**
 * Test script for updating Manatal custom fields
 * 
 * Usage:
 *   node test-manatal-custom-fields.js <candidate_id>
 * 
 * Example:
 *   node test-manatal-custom-fields.js 129054407
 */

const https = require('https');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';
const API_VERSION = 'open/v3';

// Get candidate ID from command line argument or use default test ID
const CANDIDATE_ID = process.argv[2] || '129054407';

// Function to make API request
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/${API_VERSION}${path}`,
      method: method,
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
    
    if (data) {
      const jsonData = JSON.stringify(data);
      console.log('Request body:', jsonData);
      req.write(jsonData);
    }
    
    req.end();
  });
}

// Generate random personality scores for testing
function generateRandomScores() {
  return {
    openness: (3 + Math.random() * 2).toFixed(2),
    extraversion: (3 + Math.random() * 2).toFixed(2),
    agreeableness: (3 + Math.random() * 2).toFixed(2),
    conscientiousness: (3 + Math.random() * 2).toFixed(2),
    emotionalstability: (3 + Math.random() * 2).toFixed(2)
  };
}

// Main function to test updating custom fields
async function testCustomFieldsUpdate() {
  try {
    console.log(`=== Testing Custom Fields Update for Candidate ID: ${CANDIDATE_ID} ===`);
    
    // Step 1: Get current candidate data
    console.log('\n=== Step 1: Getting Current Candidate Data ===');
    const candidateResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/`);
    
    if (candidateResponse.statusCode !== 200) {
      console.error('Failed to get candidate data:', candidateResponse);
      return;
    }
    
    const candidate = candidateResponse.data;
    console.log('\nCandidate Basic Info:');
    console.log(`ID: ${candidate.id}`);
    console.log(`Name: ${candidate.full_name}`);
    console.log(`Email: ${candidate.email}`);
    
    // Step 2: Check current custom fields
    console.log('\n=== Step 2: Checking Current Custom Fields ===');
    if (candidate.custom_fields && Object.keys(candidate.custom_fields).length > 0) {
      console.log('\nCurrent Custom Fields:');
      console.log(JSON.stringify(candidate.custom_fields, null, 2));
    } else {
      console.log('No custom fields found');
    }
    
    // Step 3: Generate new personality scores
    console.log('\n=== Step 3: Generating New Personality Scores ===');
    const scores = generateRandomScores();
    console.log('New personality scores:');
    console.log(JSON.stringify(scores, null, 2));
    
    // Step 4: Prepare custom fields update
    console.log('\n=== Step 4: Preparing Custom Fields Update ===');
    const customFields = {
      personality_openness: scores.openness,
      personality_extraversion: scores.extraversion,
      personality_agreeableness: scores.agreeableness,
      personality_conscientiousness: scores.conscientiousness,
      personality_emotionalstability: scores.emotionalstability,
      quiz_completed: true,
      application_flow: 'API Test',
      application_source: 'Website'
    };
    
    console.log('Custom fields to update:');
    console.log(JSON.stringify(customFields, null, 2));
    
    // Step 5: Update candidate with new custom fields
    console.log('\n=== Step 5: Updating Candidate with New Custom Fields ===');
    const updateResponse = await makeRequest('PATCH', `/candidates/${CANDIDATE_ID}/`, {
      custom_fields: customFields
    });
    
    if (updateResponse.statusCode !== 200) {
      console.error('Failed to update candidate:', updateResponse);
      return;
    }
    
    console.log('\nUpdate successful!');
    
    // Step 6: Verify the update
    console.log('\n=== Step 6: Verifying Update ===');
    const verifyResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/`);
    
    if (verifyResponse.statusCode !== 200) {
      console.error('Failed to verify update:', verifyResponse);
      return;
    }
    
    const updatedCandidate = verifyResponse.data;
    console.log('\nUpdated Custom Fields:');
    console.log(JSON.stringify(updatedCandidate.custom_fields, null, 2));
    
    // Step 7: Check if all fields were updated correctly
    console.log('\n=== Step 7: Checking Update Accuracy ===');
    let allFieldsCorrect = true;
    
    for (const [key, value] of Object.entries(customFields)) {
      if (updatedCandidate.custom_fields[key] !== value) {
        console.error(`❌ Field ${key} was not updated correctly:`);
        console.error(`  Expected: ${value}`);
        console.error(`  Actual: ${updatedCandidate.custom_fields[key]}`);
        allFieldsCorrect = false;
      }
    }
    
    if (allFieldsCorrect) {
      console.log('✅ All custom fields were updated correctly!');
    } else {
      console.error('❌ Some custom fields were not updated correctly.');
    }
    
    console.log('\n=== Test Complete ===');
    console.log(`Candidate ID: ${CANDIDATE_ID}`);
    console.log(`Manatal UI URL: https://app.manatal.com/candidates/${CANDIDATE_ID}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the function
testCustomFieldsUpdate();
