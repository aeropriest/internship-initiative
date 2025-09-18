/**
 * Test Resume Upload with Real File
 * This script will create a candidate and upload the resume file
 */

const fs = require('fs');
const path = require('path');

async function testResumeUpload() {
  console.log('📄 Testing Resume Upload with Real File');
  console.log('=' .repeat(60));
  
  const resumePath = path.join(process.env.HOME, 'Downloads', 'Ashok Jaiswal - Web3 Tech Lead.pdf');
  
  // Check if file exists
  if (!fs.existsSync(resumePath)) {
    console.log('❌ Resume file not found at:', resumePath);
    console.log('💡 Please check the file path and name');
    return;
  }
  
  console.log('✅ Resume file found:', resumePath);
  const fileStats = fs.statSync(resumePath);
  console.log(`📊 File size: ${fileStats.size} bytes`);
  console.log(`📅 Last modified: ${fileStats.mtime}`);
  
  try {
    // Step 1: Create candidate in Manatal
    console.log('\n🔄 Step 1: Creating candidate in Manatal...');
    
    const candidateData = {
      firstName: 'Ashok',
      lastName: 'Jaiswal',
      email: 'ashok@novana.io',
      phone: '+91 80502 02190',
      notes: 'Web3 Tech Lead with extensive experience in blockchain technologies, smart contracts, and decentralized applications. Skilled in Solidity, React, Node.js, and various blockchain protocols.',
      positionTitle: 'Admin Internship'
    };
    
    console.log('📝 Candidate data:', JSON.stringify(candidateData, null, 2));
    
    const candidateResponse = await fetch('http://localhost:3000/api/manatal/candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData),
    });
    
    if (!candidateResponse.ok) {
      const errorText = await candidateResponse.text();
      throw new Error(`Failed to create candidate: ${candidateResponse.status} - ${errorText}`);
    }
    
    const candidateResult = await candidateResponse.json();
    console.log('✅ Candidate created successfully!');
    console.log(`🆔 Candidate ID: ${candidateResult.candidate.id}`);
    console.log(`📧 Email: ${candidateResult.candidate.email}`);
    console.log(`🏷️ Hash: ${candidateResult.candidate.hash}`);
    
    const candidateId = candidateResult.candidate.id;
    
    // Step 2: Upload resume
    console.log('\n🔄 Step 2: Uploading resume...');
    
    const resumeBuffer = fs.readFileSync(resumePath);
    const formData = new FormData();
    
    // Create a File object from the buffer
    const resumeFile = new File([resumeBuffer], 'Ashok_Jaiswal_Web3_Tech_Lead.pdf', {
      type: 'application/pdf'
    });
    
    formData.append('candidateId', candidateId.toString());
    formData.append('resume', resumeFile);
    
    console.log(`📤 Uploading resume for candidate ID: ${candidateId}`);
    console.log(`📄 File name: ${resumeFile.name}`);
    console.log(`📊 File size: ${resumeFile.size} bytes`);
    
    const resumeResponse = await fetch('http://localhost:3000/api/manatal/resume', {
      method: 'POST',
      body: formData,
    });
    
    if (!resumeResponse.ok) {
      const errorText = await resumeResponse.text();
      throw new Error(`Failed to upload resume: ${resumeResponse.status} - ${errorText}`);
    }
    
    const resumeResult = await resumeResponse.json();
    console.log('✅ Resume uploaded successfully!');
    console.log(`📄 Upload ID: ${resumeResult.upload.id}`);
    console.log(`📁 File name: ${resumeResult.upload.file_name}`);
    console.log(`📊 Status: ${resumeResult.upload.upload_status}`);
    
    // Step 3: Create Hireflix interview
    console.log('\n🔄 Step 3: Creating Hireflix interview...');
    
    const interviewData = {
      position_id: '68ca69a6f26846e399d1e1af', // Admin Internship ID from Hireflix
      candidate_email: candidateData.email,
      candidate_name: `${candidateData.firstName} ${candidateData.lastName}`,
      manatal_candidate_id: candidateId.toString()
    };
    
    console.log('📝 Interview data:', JSON.stringify(interviewData, null, 2));
    
    const interviewResponse = await fetch('http://localhost:3000/api/hireflix/interviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interviewData),
    });
    
    if (!interviewResponse.ok) {
      const errorText = await interviewResponse.text();
      console.log('⚠️ Interview creation failed (this is optional):', errorText);
    } else {
      const interviewResult = await interviewResponse.json();
      console.log('✅ Interview created successfully!');
      console.log(`🎬 Interview ID: ${interviewResult.interview.id}`);
      console.log(`🔗 Interview URL: ${interviewResult.interview.interview_url}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETE APPLICATION TEST SUCCESSFUL!');
    console.log('📋 Summary:');
    console.log(`   👤 Candidate: ${candidateData.firstName} ${candidateData.lastName}`);
    console.log(`   🆔 Manatal ID: ${candidateId}`);
    console.log(`   📧 Email: ${candidateData.email}`);
    console.log(`   📄 Resume: Uploaded successfully`);
    console.log(`   🎯 Position: ${candidateData.positionTitle}`);
    console.log(`   🔗 Manatal Profile: https://app.manatal.com/candidates/${candidateId}`);
    console.log('');
    console.log('✅ The candidate is now in your Manatal ATS with resume attached!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

// Check if we're in a Node.js environment that supports fetch
if (typeof fetch === 'undefined') {
  console.log('⚠️ This script requires Node.js 18+ with fetch support');
  console.log('💡 Alternatively, you can run this test through the web interface');
} else {
  testResumeUpload();
}
