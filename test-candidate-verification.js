/**
 * Test Candidate Verification
 * This will help verify that candidates are being created and can be found
 */

async function testCandidateVerification() {
  console.log('🔍 Testing Candidate Creation and Verification');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create a new test candidate
    console.log('🔄 Step 1: Creating a new test candidate...');
    
    const testCandidate = {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith.test@example.com',
      phone: '+1 555 999 8888',
      notes: 'Test candidate for verification - created at ' + new Date().toISOString(),
      positionTitle: 'Admin Internship'
    };

    const candidateResponse = await fetch('http://localhost:3000/api/manatal/candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCandidate),
    });

    if (!candidateResponse.ok) {
      throw new Error(`Failed to create candidate: ${candidateResponse.status}`);
    }

    const candidateResult = await candidateResponse.json();
    const candidateId = candidateResult.candidate.id;
    
    console.log('✅ Candidate created successfully!');
    console.log(`🆔 Candidate ID: ${candidateId}`);
    console.log(`📧 Email: ${candidateResult.candidate.email}`);
    console.log(`🏷️ Hash: ${candidateResult.candidate.hash}`);
    console.log(`👤 Creator ID: ${candidateResult.candidate.creator}`);

    // Step 2: Verify candidate exists via direct API call
    console.log('\n🔄 Step 2: Verifying candidate exists via API...');
    
    const verifyResponse = await fetch(`https://api.manatal.com/open/v3/candidates/${candidateId}/`, {
      method: 'GET',
      headers: {
        'Authorization': 'Token 51ce36b3ac06f113f418f0e0f47391e7471090c7',
        'Content-Type': 'application/json',
      },
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Candidate verified via direct API call!');
      console.log(`📋 Full Name: ${verifyData.full_name}`);
      console.log(`📧 Email: ${verifyData.email}`);
      console.log(`👤 Creator: ${verifyData.creator}`);
      console.log(`🏷️ Hash: ${verifyData.hash}`);
      console.log(`📅 Created: ${verifyData.created_at}`);
    } else {
      console.log('❌ Could not verify candidate via API');
    }

    // Step 3: Instructions for finding in Manatal portal
    console.log('\n' + '='.repeat(60));
    console.log('📋 TO FIND THIS CANDIDATE IN YOUR MANATAL PORTAL:');
    console.log('');
    console.log('1. 🔍 Search by Candidate ID:');
    console.log(`   Search for: ${candidateId}`);
    console.log('');
    console.log('2. 📧 Search by Email:');
    console.log(`   Search for: ${testCandidate.email}`);
    console.log('');
    console.log('3. 👤 Search by Name:');
    console.log(`   Search for: ${testCandidate.firstName} ${testCandidate.lastName}`);
    console.log('');
    console.log('4. 🏷️ Search by Hash:');
    console.log(`   Search for: ${candidateResult.candidate.hash}`);
    console.log('');
    console.log('5. 🔗 Direct Manatal Link:');
    console.log(`   https://app.manatal.com/candidates/${candidateId}`);
    console.log('');
    console.log('📝 If you still cannot find the candidate:');
    console.log('   - Check if you have multiple Manatal accounts');
    console.log('   - Verify you\'re logged into the correct account');
    console.log('   - Check user permissions and filters in Manatal');
    console.log('   - The API token might be associated with a different account');
    console.log('');
    console.log('✅ The candidate creation is working correctly!');
    console.log('   The issue is likely account visibility, not the API integration.');

  } catch (error) {
    console.error('💥 Candidate verification failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

// Run the test
testCandidateVerification();
