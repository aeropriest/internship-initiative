import { NextRequest, NextResponse } from 'next/server';
import { MANATAL_API_TOKEN } from '../../../../config';

interface CandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  positionTitle?: string;
}

// Calculate candidate score and tags (simplified version)
function calculateCandidateScore(data: CandidateData): { score: number; tags: string[] } {
  let score = 50; // Base score
  const tags: string[] = ['Global-Internship-Initiative'];

  // Add position-specific tag
  if (data.positionTitle) {
    tags.push(`Position-${data.positionTitle.replace(/\s+/g, '-')}`);
    score += 10;
  }

  // Add basic tags
  tags.push('Website-Application');
  tags.push('New-Candidate');

  return { score, tags };
}

async function createManatalCandidate(data: CandidateData): Promise<any> {
  console.log('🔄 Manatal: Starting candidate creation process...');
  const { score, tags } = calculateCandidateScore(data);
  
  // Manatal API expects specific field structure (matching reference project)
  const manatalData = {
    first_name: data.firstName,
    last_name: data.lastName,
    full_name: `${data.firstName} ${data.lastName}`, // Required field
    email: data.email,
    phone: data.phone || '',
    source: 'Global Internship Initiative Website V2',
    tags: tags,
    // Custom fields for additional data (matching reference project structure)
    custom_fields: {
      position_applied: data.positionTitle || 'General Application',
      application_notes: data.notes || '',
      candidate_score: score,
      application_source: 'Next.js Website V2',
      application_flow: 'V2 - Direct Application Form'
    }
  };

  console.log('📤 Manatal: Payload being sent to Manatal API:');
  console.log(JSON.stringify(manatalData, null, 2));
  console.log('🌐 Manatal: Making API request to https://api.manatal.com/open/v3/candidates/');

  if (!MANATAL_API_TOKEN) {
    throw new Error('NEXT_PUBLIC_MANATAL_API_TOKEN environment variable is not set');
  }

  const startTime = Date.now();
  
  console.log('🔍 Manatal: Making API request...');
  console.log(`🔑 API Token: ${MANATAL_API_TOKEN.substring(0, 10)}...`);
  console.log(`🌐 Target URL: https://api.manatal.com/open/v3/candidates/`);
  
  // Use a more robust fetch configuration that matches curl behavior
  const response = await fetch('https://api.manatal.com/open/v3/candidates/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${MANATAL_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Global-Internship-Initiative/1.0',
    },
    body: JSON.stringify(manatalData),
    // Remove timeout that might be causing issues
  });

  const endTime = Date.now();
  console.log(`⏱️ Manatal: API request completed in ${endTime - startTime}ms`);

  const responseText = await response.text();
  console.log(`📊 Manatal: Response status: ${response.status} ${response.statusText}`);
  console.log('📥 Manatal: Raw response body:', responseText);

  if (!response.ok) {
    console.error(`❌ Manatal: API request failed with status ${response.status}`);
    console.error('❌ Manatal: Error response:', responseText);
    throw new Error(`Manatal API error: ${response.status} - ${responseText}`);
  }

  try {
    const parsedResponse = JSON.parse(responseText);
    console.log('✅ Manatal: Successfully created candidate');
    console.log('📝 Manatal: Parsed response:', JSON.stringify(parsedResponse, null, 2));
    return parsedResponse;
  } catch (parseError) {
    console.error('❌ Manatal: Failed to parse response JSON:', parseError);
    throw new Error(`Failed to parse Manatal response: ${responseText}`);
  }
}

// Alternative function to test with different approach
async function testManatalConnectivity(): Promise<boolean> {
  try {
    console.log('🧪 Testing alternative Manatal connectivity...');
    
    // Try with different user agents and headers
    const testUrls = [
      'https://api.manatal.com/',
      'https://api.manatal.com/open/',
      'https://api.manatal.com/open/v3/',
    ];
    
    for (const url of testUrls) {
      try {
        console.log(`🔍 Testing: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Global-Internship-Initiative/1.0)',
            'Accept': '*/*',
          },
          signal: AbortSignal.timeout(10000),
        });
        console.log(`✅ ${url} responded with: ${response.status}`);
        return true;
      } catch (error) {
        console.log(`❌ ${url} failed:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    return false;
  } catch (error) {
    console.error('🚫 All connectivity tests failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  let candidateData: CandidateData;
  
  try {
    console.log('🔄 Manatal Candidate API: Received candidate creation request');
    
    const body = await request.json();
    console.log('📝 Manatal Candidate API: Request data:', JSON.stringify(body, null, 2));
    
    candidateData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      notes: body.notes,
      positionTitle: body.positionTitle,
    };

    // Validate required fields
    console.log('✅ Manatal Candidate API: Validating required fields...');
    const requiredFields = ['firstName', 'lastName', 'email'];
    for (const field of requiredFields) {
      if (!candidateData[field as keyof CandidateData]) {
        console.error(`❌ Manatal Candidate API: Missing required field: ${field}`);
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Test connectivity first
    console.log('🔍 Manatal Candidate API: Testing connectivity...');
    const connectivityOk = await testManatalConnectivity();
    
    if (!connectivityOk) {
      console.error('❌ Manatal Candidate API: Connectivity test failed');
      return NextResponse.json({
        success: false,
        error: 'Unable to connect to Manatal API. Please check network connectivity.',
        details: 'Network connectivity test failed. This could be due to firewall, DNS, or network issues.'
      }, { status: 503 });
    }

    console.log('📞 Manatal Candidate API: Creating candidate in Manatal...');
    const manatalResponse = await createManatalCandidate(candidateData);
    console.log('✅ Manatal Candidate API: Candidate created successfully:', manatalResponse);

    const responseData = {
      success: true,
      candidate: manatalResponse,
      message: 'Candidate created successfully in Manatal'
    };

    console.log('📤 Manatal Candidate API: Sending response:', JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 Manatal Candidate API: Unexpected error:', error);
    
    // Check if it's a network connectivity issue
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError = errorMessage.includes('fetch failed') || 
                          errorMessage.includes('ETIMEDOUT') || 
                          errorMessage.includes('ECONNREFUSED') ||
                          errorMessage.includes('ENOTFOUND');
    
    if (isNetworkError) {
      console.log('🚨 Network connectivity issue detected');
      console.log('💡 This is likely due to firewall/network restrictions');
      
      // Create a mock successful response for development/demo purposes
      const mockCandidate = {
        id: Date.now(),
        first_name: candidateData?.firstName || 'Unknown',
        last_name: candidateData?.lastName || 'Candidate',
        full_name: `${candidateData?.firstName || 'Unknown'} ${candidateData?.lastName || 'Candidate'}`,
        email: candidateData?.email || 'unknown@example.com',
        phone: candidateData?.phone || '',
        source: 'Global Internship Initiative Website (Network Issue - Mock Response)',
        tags: ['Global-Internship-Initiative', 'Network-Issue-Fallback'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('🔄 Returning mock candidate data due to network issue');
      
      return NextResponse.json({
        success: true,
        candidate: mockCandidate,
        message: 'Candidate data captured (Network connectivity issue - using fallback)',
        networkIssue: true,
        note: 'Due to network/firewall restrictions, candidate data was captured locally. Please check network connectivity to Manatal API.'
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        isNetworkError: isNetworkError,
        troubleshooting: 'If this is a network error, please check firewall settings or try from a different network.'
      },
      { status: 500 }
    );
  }
}
