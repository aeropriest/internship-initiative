/**
 * Manatal Custom Fields Verification Script
 * 
 * This script focuses specifically on testing Manatal's custom fields:
 * 1. Creates a candidate with specific custom field values
 * 2. Fetches the candidate to verify the custom fields were saved correctly
 * 3. Updates the custom fields with new values
 * 4. Fetches again to verify the updates were applied
 * 
 * Usage: node verify-manatal-custom-fields.js
 */

const { execSync } = require('child_process');

// Use global fetch if available (Node.js 18+), or try to use node-fetch as fallback
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
  console.log('Using built-in fetch API');
} else {
  try {
    fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    console.log('Using node-fetch package');
  } catch (e) {
    console.error('Error: fetch is not available. Please use Node.js 18+ or install node-fetch');
    process.exit(1);
  }
}

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  candidateData: {
    firstName: 'Custom',
    lastName: 'Fields Test',
    email: `custom.fields.test${Date.now()}@example.com`,
    phone: '555-987-6543',
    location: 'Remote',
    passportCountry: 'United States',
    golfHandicap: '18.5',
    notes: 'Testing custom fields specifically'
  },
  // Initial custom field values
  initialCustomFields: {
    extraversion: '3.5',
    agreeableness: '4.0',
    conscientiousness: '3.8',
    openness: '4.2',
    emotional_stability: '3.9',
    passport_country: 'United States',
    golf_handicap: '18.5',
    quiz_completed: true
  },
  // Updated custom field values for second test
  updatedCustomFields: {
    extraversion: '4.5',
    agreeableness: '4.8',
    conscientiousness: '4.6',
    openness: '4.9',
    emotional_stability: '4.7',
    passport_country: 'Canada',
    golf_handicap: '15.2',
    quiz_completed: true
  }
};

// Main test function
async function runTest() {
  console.log('🚀 Starting Manatal Custom Fields Verification Test');
  
  try {
    // Step 1: Create a candidate
    console.log('\n📝 Step 1: Creating candidate with initial custom fields...');
    const candidate = await createCandidate();
    console.log(`✅ Candidate created with ID: ${candidate.id}`);
    
    // Step 2: Verify initial custom fields
    console.log('\n🔍 Step 2: Verifying initial custom fields...');
    const initialVerification = await verifyCustomFields(candidate.id, config.initialCustomFields);
    console.log('✅ Initial verification complete');
    
    // Step 3: Update custom fields
    console.log('\n🔄 Step 3: Updating custom fields...');
    await updateCustomFields(candidate.id, config.updatedCustomFields);
    console.log('✅ Custom fields updated');
    
    // Step 4: Verify updated custom fields
    console.log('\n🔍 Step 4: Verifying updated custom fields...');
    const updatedVerification = await verifyCustomFields(candidate.id, config.updatedCustomFields);
    console.log('✅ Update verification complete');
    
    // Print summary
    console.log('\n📊 Test Results Summary:');
    console.log('------------------------');
    console.log(`Candidate ID: ${candidate.id}`);
    console.log(`Name: ${candidate.full_name}`);
    console.log(`Email: ${candidate.email}`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Step 1: Create a candidate with custom fields
async function createCandidate() {
  // Add custom fields to candidate data
  const candidateData = {
    ...config.candidateData,
    customFields: config.initialCustomFields
  };
  
  const response = await fetch(`${config.baseUrl}/api/manatal/candidates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(candidateData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create candidate: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  return data.candidate;
}

// Step 2 & 4: Verify custom fields
async function verifyCustomFields(candidateId, expectedFields) {
  // Wait a moment to ensure data is processed
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const response = await fetch(`${config.baseUrl}/api/applications/${candidateId}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch candidate: ${response.status} ${errorText}`);
  }
  
  const candidate = await response.json();
  
  // Verify custom fields
  console.log('\nVerifying custom fields:');
  
  if (candidate.custom_fields) {
    let allFieldsCorrect = true;
    
    for (const [field, expectedValue] of Object.entries(expectedFields)) {
      const actualValue = candidate.custom_fields[field];
      
      if (String(expectedValue) === String(actualValue)) {
        console.log(`✅ ${field}: ${actualValue}`);
      } else {
        console.log(`❌ ${field}: Expected "${expectedValue}", got "${actualValue}"`);
        allFieldsCorrect = false;
      }
    }
    
    if (allFieldsCorrect) {
      console.log('\n✅ All custom fields match expected values');
    } else {
      console.log('\n⚠️ Some custom fields do not match expected values');
    }
  } else {
    console.log('⚠️ No custom fields found in candidate data');
  }
  
  return candidate;
}

// Step 3: Update custom fields
async function updateCustomFields(candidateId, newCustomFields) {
  const response = await fetch(`${config.baseUrl}/api/applications/${candidateId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      custom_fields: newCustomFields
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update custom fields: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

// Check Node.js version for compatibility
function checkEnvironment() {
  console.log('🔍 Checking environment...');
  const nodeVersion = process.version;
  console.log(`Node.js version: ${nodeVersion}`);
  
  // Check if Node.js version is 18.0.0 or higher (for built-in fetch)
  const major = parseInt(nodeVersion.substring(1).split('.')[0], 10);
  if (major >= 18) {
    console.log('✅ Node.js version supports built-in fetch API');
  } else {
    console.log('⚠️ Node.js version may not support built-in fetch API');
    console.log('   Using fallback mechanisms if available');
  }
}

// Run the test
(async () => {
  try {
    checkEnvironment();
    await runTest();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
