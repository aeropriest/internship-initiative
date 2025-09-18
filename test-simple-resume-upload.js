/**
 * Test Simple Resume Upload
 * This will test uploading a very simple PDF to see if the issue is file-related
 */

async function testSimpleResumeUpload() {
  console.log('📄 Testing Simple Resume Upload');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create a new candidate
    console.log('🔄 Step 1: Creating a new test candidate...');
    
    const candidateData = {
      firstName: 'Resume',
      lastName: 'Test',
      email: 'resume.test@example.com',
      phone: '+1234567890',
      notes: 'Testing resume upload with simple PDF',
      positionTitle: 'Admin Internship'
    };

    const candidateResponse = await fetch('http://localhost:3000/api/manatal/candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData),
    });

    if (!candidateResponse.ok) {
      throw new Error(`Failed to create candidate: ${candidateResponse.status}`);
    }

    const candidateResult = await candidateResponse.json();
    const candidateId = candidateResult.candidate.id;
    
    console.log('✅ Candidate created successfully!');
    console.log(`🆔 Candidate ID: ${candidateId}`);

    // Step 2: Create a simple PDF content (minimal valid PDF)
    console.log('\n🔄 Step 2: Creating simple PDF content...');
    
    // This is a minimal valid PDF with "Hello World" text
    const simplePdfBase64 = "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9YUmVmCi9TaXplIDcKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjU3OQolJUVPRgo=";
    
    // Convert base64 to buffer and create File
    const pdfBuffer = Buffer.from(simplePdfBase64, 'base64');
    const formData = new FormData();
    
    const resumeFile = new File([pdfBuffer], 'Simple_Resume_Test.pdf', {
      type: 'application/pdf'
    });
    
    formData.append('candidateId', candidateId.toString());
    formData.append('resume', resumeFile);
    
    console.log(`📤 Uploading simple PDF resume for candidate ID: ${candidateId}`);
    console.log(`📄 File name: ${resumeFile.name}`);
    console.log(`📊 File size: ${resumeFile.size} bytes`);

    // Step 3: Upload the resume
    const resumeResponse = await fetch('http://localhost:3000/api/manatal/resume', {
      method: 'POST',
      body: formData,
    });
    
    if (resumeResponse.ok) {
      const resumeResult = await resumeResponse.json();
      console.log('✅ Simple resume uploaded successfully!');
      console.log(`📄 Upload ID: ${resumeResult.upload.id}`);
      console.log(`📁 File name: ${resumeResult.upload.file_name}`);
      
      // Step 4: Verify the resume via API
      console.log('\n🔄 Step 3: Verifying resume via Manatal API...');
      
      const verifyResponse = await fetch(`https://api.manatal.com/open/v3/candidates/${candidateId}/resume/`, {
        method: 'GET',
        headers: {
          'Authorization': 'Token 51ce36b3ac06f113f418f0e0f47391e7471090c7',
          'Content-Type': 'application/json',
        },
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('📋 Resume verification result:');
        console.log(`   📄 Resume ID: ${verifyData.id}`);
        console.log(`   📁 Resume file: "${verifyData.resume_file}"`);
        console.log(`   📅 Created: ${verifyData.created_at}`);
        
        if (verifyData.resume_file && verifyData.resume_file !== "") {
          console.log('✅ Resume file URL is populated!');
        } else {
          console.log('❌ Resume file URL is empty - this explains the null.html issue');
        }
      } else {
        console.log('❌ Could not verify resume via API');
      }
      
    } else {
      const resumeError = await resumeResponse.text();
      console.log('❌ Simple resume upload failed:', resumeError);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 Test Results Summary:');
    console.log(`   🆔 Candidate ID: ${candidateId}`);
    console.log(`   📧 Email: ${candidateData.email}`);
    console.log(`   🔗 Manatal Profile: https://app.manatal.com/candidates/${candidateId}`);
    console.log('');
    console.log('💡 Check this candidate in your Manatal portal to see if the resume downloads correctly.');

  } catch (error) {
    console.error('💥 Simple resume upload test failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

// Run the test
testSimpleResumeUpload();
