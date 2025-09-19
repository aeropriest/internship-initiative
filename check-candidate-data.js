// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MANATAL_API_TOKEN = process.env.NEXT_PUBLIC_MANATAL_API_TOKEN || '51ce36b3ac06f113f418f0e0f47391e7471090c7';

async function checkSpecificCandidate(candidateId) {
  try {
    console.log(`🎯 Checking specific candidate ID: ${candidateId}`);
    const detailResponse = await fetch(`https://api.manatal.com/open/v3/candidates/${candidateId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!detailResponse.ok) {
      console.error(`❌ Failed to fetch candidate ${candidateId}: ${detailResponse.status}`);
      return null;
    }

    const candidateDetails = await detailResponse.json();
    return candidateDetails;
  } catch (error) {
    console.error(`💥 Error fetching candidate ${candidateId}:`, error);
    return null;
  }
}

async function analyzeCandidate(candidateDetails) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 CANDIDATE DATA ANALYSIS');
  console.log('='.repeat(60));
  
  console.log(`👤 Name: ${candidateDetails.full_name}`);
  console.log(`📧 Email: ${candidateDetails.email}`);
  console.log(`📱 Phone: ${candidateDetails.phone || 'Not provided'}`);
  console.log(`🏷️  Tags: ${candidateDetails.tags?.join(', ') || 'None'}`);
  console.log(`📅 Created: ${candidateDetails.created_at}`);
  
  console.log('\n📍 LOCATION INFORMATION:');
  if (candidateDetails.custom_fields?.candidate_location) {
    console.log(`✅ Location found: "${candidateDetails.custom_fields.candidate_location}"`);
  } else {
    console.log('❌ Location not found in custom_fields.candidate_location');
  }
  
  console.log('\n🎬 HIREFLIX INTERVIEW INFORMATION:');
  const hireflixFields = [
    'hireflix_interview_id',
    'hireflix_interview_status', 
    'hireflix_video_url',
    'hireflix_transcript_url',
    'hireflix_score',
    'hireflix_feedback',
    'hireflix_completed_at',
    'interview_processed_at',
    'interview_notes'
  ];
  
  let hireflixDataFound = false;
  hireflixFields.forEach(field => {
    if (candidateDetails.custom_fields?.[field]) {
      console.log(`✅ ${field}: ${candidateDetails.custom_fields[field]}`);
      hireflixDataFound = true;
    } else {
      console.log(`❌ ${field}: Not found`);
    }
  });
  
  if (!hireflixDataFound) {
    console.log('⚠️  No Hireflix interview data found - interview may not have been completed yet');
  }
  
  console.log('\n📋 ALL CUSTOM FIELDS:');
  if (candidateDetails.custom_fields && Object.keys(candidateDetails.custom_fields).length > 0) {
    Object.entries(candidateDetails.custom_fields).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  } else {
    console.log('❌ No custom fields found');
  }
  
  console.log('\n📄 ADDITIONAL INFORMATION:');
  console.log(`Position Applied: ${candidateDetails.custom_fields?.position_applied || 'Not specified'}`);
  console.log(`Application Source: ${candidateDetails.custom_fields?.application_source || 'Not specified'}`);
  console.log(`Application Flow: ${candidateDetails.custom_fields?.application_flow || 'Not specified'}`);
  console.log(`Source: ${candidateDetails.source || 'Not specified'}`);
}

async function checkCandidateData() {
  try {
    console.log('🔍 Checking candidate data in Manatal...');
    console.log(`🔑 Using API Token: ${MANATAL_API_TOKEN.substring(0, 10)}...`);
    
    if (!MANATAL_API_TOKEN) {
      console.error('❌ MANATAL_API_TOKEN not found');
      return;
    }

    // Search for the specific email address
    const targetEmail = 'ashok.jaiswal+8@gmail.com';
    console.log(`🎯 Searching for candidate with email: ${targetEmail}`);
    
    // Try searching by email
    const emailSearchResponse = await fetch(`https://api.manatal.com/open/v3/candidates/?search=${encodeURIComponent(targetEmail)}&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (emailSearchResponse.ok) {
      const emailSearchData = await emailSearchResponse.json();
      console.log(`✅ Found ${emailSearchData.results?.length || 0} candidates matching email search`);
      
      if (emailSearchData.results && emailSearchData.results.length > 0) {
        console.log('📋 Email search results:');
        emailSearchData.results.forEach((candidate, index) => {
          console.log(`  ${index + 1}. ${candidate.full_name || `${candidate.first_name} ${candidate.last_name}`} - ${candidate.email} (ID: ${candidate.id})`);
        });
        
        const targetCandidate = emailSearchData.results.find(candidate => 
          candidate.email === targetEmail
        );
        
        if (targetCandidate) {
          console.log(`🎯 Found exact email match: ${targetCandidate.full_name} (ID: ${targetCandidate.id})`);
          await analyzeCandidate(targetCandidate);
          return;
        } else {
          console.log(`⚠️  No exact match for ${targetEmail} found in search results`);
          
          // Check if any candidate has similar email
          const similarCandidate = emailSearchData.results.find(candidate => 
            candidate.email?.includes('ashok.jaiswal') || candidate.email?.includes('ashok')
          );
          
          if (similarCandidate) {
            console.log(`🔍 Found similar email candidate: ${similarCandidate.full_name} - ${similarCandidate.email}`);
            await analyzeCandidate(similarCandidate);
            return;
          }
        }
      } else {
        console.log('❌ No candidates found in email search');
      }
    } else {
      console.error(`❌ Email search failed: ${emailSearchResponse.status}`);
    }

    // First, let's search for candidates with email containing "bbb" or recent ones
    console.log('📋 Searching for candidates...');
    
    // Try searching by email first
    console.log('🔍 Searching by email pattern...');
    let candidatesResponse = await fetch('https://api.manatal.com/open/v3/candidates/?search=bbb&limit=20', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!candidatesResponse.ok) {
      console.error(`❌ Failed to fetch candidates: ${candidatesResponse.status}`);
      const errorText = await candidatesResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    let candidatesData = await candidatesResponse.json();
    console.log(`✅ Found ${candidatesData.results?.length || 0} candidates matching "bbb"`);
    
    // If no results with search, try getting recent candidates
    if (!candidatesData.results || candidatesData.results.length === 0) {
      console.log('🔍 No matches found, trying recent candidates...');
      candidatesResponse = await fetch('https://api.manatal.com/open/v3/candidates/?ordering=-created_at&limit=50', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${MANATAL_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      candidatesData = await candidatesResponse.json();
      console.log(`✅ Found ${candidatesData.results?.length || 0} recent candidates`);
    }

    // Look for the candidate "bbb bbb" from the screenshot or any recent candidate from Global Internship Initiative
    let targetCandidate = candidatesData.results?.find(candidate => 
      candidate.first_name?.toLowerCase().includes('bbb') || 
      candidate.last_name?.toLowerCase().includes('bbb') ||
      candidate.full_name?.toLowerCase().includes('bbb')
    );

    // If we can't find "bbb bbb", look for candidates from Global Internship Initiative source
    if (!targetCandidate) {
      console.log('🔍 Target candidate "bbb bbb" not found, looking for Global Internship Initiative candidates...');
      targetCandidate = candidatesData.results?.find(candidate => 
        candidate.source?.includes('Global Internship Initiative') ||
        candidate.tags?.some(tag => tag.includes('Global-Internship-Initiative'))
      );
    }

    if (!targetCandidate) {
      console.log('🔍 No Global Internship Initiative candidates found in recent candidates');
      console.log('📋 Available candidates (showing first 20):');
      candidatesData.results?.slice(0, 20).forEach((candidate, index) => {
        console.log(`  ${index + 1}. ${candidate.full_name || `${candidate.first_name} ${candidate.last_name}`} (ID: ${candidate.id}) - Source: ${candidate.source || 'N/A'}`);
      });
      
      // Let's check the most recent candidate anyway to see the data structure
      if (candidatesData.results?.length > 0) {
        console.log('\n🔍 Checking the most recent candidate for data structure analysis...');
        targetCandidate = candidatesData.results[0];
      } else {
        return;
      }
    }

    console.log(`🎯 Found target candidate: ${targetCandidate.full_name} (ID: ${targetCandidate.id})`);

    // Now get detailed information for this specific candidate
    console.log(`📝 Fetching detailed data for candidate ID: ${targetCandidate.id}`);
    const detailResponse = await fetch(`https://api.manatal.com/open/v3/candidates/${targetCandidate.id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!detailResponse.ok) {
      console.error(`❌ Failed to fetch candidate details: ${detailResponse.status}`);
      return;
    }

    const candidateDetails = await detailResponse.json();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CANDIDATE DATA ANALYSIS');
    console.log('='.repeat(60));
    
    console.log(`👤 Name: ${candidateDetails.full_name}`);
    console.log(`📧 Email: ${candidateDetails.email}`);
    console.log(`📱 Phone: ${candidateDetails.phone || 'Not provided'}`);
    console.log(`🏷️  Tags: ${candidateDetails.tags?.join(', ') || 'None'}`);
    console.log(`📅 Created: ${candidateDetails.created_at}`);
    
    console.log('\n📍 LOCATION INFORMATION:');
    if (candidateDetails.custom_fields?.candidate_location) {
      console.log(`✅ Location found: "${candidateDetails.custom_fields.candidate_location}"`);
    } else {
      console.log('❌ Location not found in custom_fields.candidate_location');
    }
    
    console.log('\n🎬 HIREFLIX INTERVIEW INFORMATION:');
    const hireflixFields = [
      'hireflix_interview_id',
      'hireflix_interview_status', 
      'hireflix_video_url',
      'hireflix_transcript_url',
      'hireflix_score',
      'hireflix_feedback',
      'hireflix_completed_at',
      'interview_processed_at',
      'interview_notes'
    ];
    
    let hireflixDataFound = false;
    hireflixFields.forEach(field => {
      if (candidateDetails.custom_fields?.[field]) {
        console.log(`✅ ${field}: ${candidateDetails.custom_fields[field]}`);
        hireflixDataFound = true;
      } else {
        console.log(`❌ ${field}: Not found`);
      }
    });
    
    if (!hireflixDataFound) {
      console.log('⚠️  No Hireflix interview data found - interview may not have been completed yet');
    }
    
    console.log('\n📋 ALL CUSTOM FIELDS:');
    if (candidateDetails.custom_fields && Object.keys(candidateDetails.custom_fields).length > 0) {
      Object.entries(candidateDetails.custom_fields).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log('❌ No custom fields found');
    }
    
    console.log('\n📄 ADDITIONAL INFORMATION:');
    console.log(`Position Applied: ${candidateDetails.custom_fields?.position_applied || 'Not specified'}`);
    console.log(`Application Source: ${candidateDetails.custom_fields?.application_source || 'Not specified'}`);
    console.log(`Application Flow: ${candidateDetails.custom_fields?.application_flow || 'Not specified'}`);
    console.log(`Source: ${candidateDetails.source || 'Not specified'}`);
    
  } catch (error) {
    console.error('💥 Error checking candidate data:', error);
  }
}

// Run the check
checkCandidateData();
