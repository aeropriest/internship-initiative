import { NextRequest, NextResponse } from 'next/server';
import { HIREFLIX_API_KEY, MANATAL_API_TOKEN } from '../../../../config';

interface InterviewResultRequest {
  interview_id: string;
  candidate_id: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Hireflix Interview Results API: Received request');
    
    const data: InterviewResultRequest = await request.json();
    console.log('📝 Hireflix Interview Results API: Request data:', {
      interview_id: data.interview_id,
      candidate_id: data.candidate_id
    });
    
    if (!HIREFLIX_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_HIREFLIX_API_KEY not configured' },
        { status: 500 }
      );
    }

    if (!MANATAL_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_MANATAL_API_TOKEN not configured' },
        { status: 500 }
      );
    }
    
    // Validate required fields
    const requiredFields = ['interview_id', 'candidate_id'];
    for (const field of requiredFields) {
      if (!data[field as keyof InterviewResultRequest]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    console.log('🔍 Hireflix Interview Results API: Fetching interview results...');
    console.log(`🎬 Interview ID: ${data.interview_id}`);
    
    // Check if this is a fallback interview ID (not a real Hireflix interview)
    if (data.interview_id.startsWith('fallback-') || data.interview_id.startsWith('existing_')) {
      console.log('💡 Interview Results API: Detected fallback/existing interview ID, skipping Hireflix fetch');
      
      // For fallback interviews, just update Manatal with basic info
      const manatalUpdateData = {
        custom_fields: {
          hireflix_interview_id: data.interview_id,
          hireflix_interview_status: 'not_available',
          interview_processed_at: new Date().toISOString(),
          interview_notes: 'Candidate was already invited to this position or interview creation failed'
        }
      };
      
      const manatalResponse = await fetch(`https://api.manatal.com/open/v3/candidates/${data.candidate_id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${MANATAL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manatalUpdateData),
      });
      
      if (!manatalResponse.ok) {
        console.warn('⚠️ Failed to update Manatal with fallback interview info');
      } else {
        console.log('✅ Manatal updated with fallback interview info');
      }
      
      return NextResponse.json({
        success: true,
        interview_results: {
          id: data.interview_id,
          status: 'not_available',
          message: 'Interview results not available - candidate may have been previously invited'
        },
        manatal_updated: true,
        candidate_id: data.candidate_id,
        fallback: true
      });
    }
    
    // Step 1: Get interview results from Hireflix
    const hireflixQuery = `
      query GetInterview($id: String!) {
        Interview(id: $id) {
          id
          status
          videoUrl
          transcriptUrl
          score
          feedback
          completedAt
          candidate {
            name
            email
          }
        }
      }
    `;
    
    const hireflixVariables = {
      id: data.interview_id
    };
    
    console.log('📤 Hireflix Interview Results API: Sending GraphQL query...');
    
    const startTime = Date.now();
    const hireflixResponse = await fetch('https://api.hireflix.com/me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HIREFLIX_API_KEY}`,
      },
      body: JSON.stringify({
        query: hireflixQuery,
        variables: hireflixVariables,
      }),
    });
    
    const endTime = Date.now();
    console.log(`⏱️ Hireflix Interview Results API: Request completed in ${endTime - startTime}ms`);
    
    const hireflixData = await hireflixResponse.json();
    console.log('📥 Hireflix Interview Results API: Response:', JSON.stringify(hireflixData, null, 2));
    
    if (hireflixData.errors || hireflixData.message === 'Unauthorized') {
      console.error('❌ Hireflix Interview Results API: GraphQL errors or unauthorized:', hireflixData.errors || hireflixData.message);
      
      // Handle gracefully - update Manatal with error info but don't fail the request
      const manatalUpdateData = {
        custom_fields: {
          hireflix_interview_id: data.interview_id,
          hireflix_interview_status: 'fetch_failed',
          interview_processed_at: new Date().toISOString(),
          interview_notes: `Failed to fetch interview results: ${hireflixData.errors ? hireflixData.errors.map((e: any) => e.message).join(', ') : hireflixData.message}`
        }
      };
      
      const manatalResponse = await fetch(`https://api.manatal.com/open/v3/candidates/${data.candidate_id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${MANATAL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manatalUpdateData),
      });
      
      if (manatalResponse.ok) {
        console.log('✅ Manatal updated with error info');
      }
      
      return NextResponse.json({
        success: true,
        interview_results: {
          id: data.interview_id,
          status: 'fetch_failed',
          message: 'Could not fetch interview results from Hireflix'
        },
        manatal_updated: true,
        candidate_id: data.candidate_id,
        error_handled: true
      });
    }
    
    const interview = hireflixData.data?.Interview;
    if (!interview) {
      console.error('❌ Hireflix Interview Results API: No interview data found');
      return NextResponse.json(
        { success: false, error: 'Interview not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Hireflix Interview Results API: Interview data retrieved successfully');
    console.log(`🎬 Interview Status: ${interview.status}`);
    console.log(`📹 Video URL: ${interview.videoUrl ? 'Available' : 'Not available'}`);
    console.log(`📄 Transcript URL: ${interview.transcriptUrl ? 'Available' : 'Not available'}`);
    
    // Step 2: Update Manatal candidate with interview results
    console.log('📤 Manatal Update API: Updating candidate with interview results...');
    
    const manatalUpdateData = {
      custom_fields: {
        hireflix_interview_id: interview.id,
        hireflix_interview_status: interview.status,
        hireflix_video_url: interview.videoUrl || '',
        hireflix_transcript_url: interview.transcriptUrl || '',
        hireflix_score: interview.score || 0,
        hireflix_feedback: interview.feedback || '',
        hireflix_completed_at: interview.completedAt || '',
        interview_processed_at: new Date().toISOString()
      }
    };
    
    const manatalResponse = await fetch(`https://api.manatal.com/open/v3/candidates/${data.candidate_id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(manatalUpdateData),
    });
    
    if (!manatalResponse.ok) {
      const manatalError = await manatalResponse.text();
      console.error('❌ Manatal Update API: Failed to update candidate:', manatalError);
      return NextResponse.json(
        { success: false, error: `Failed to update Manatal candidate: ${manatalResponse.status}` },
        { status: 500 }
      );
    }
    
    const manatalResult = await manatalResponse.json();
    console.log('✅ Manatal Update API: Candidate updated successfully');
    
    const responsePayload = {
      success: true,
      interview_results: {
        id: interview.id,
        status: interview.status,
        video_url: interview.videoUrl,
        transcript_url: interview.transcriptUrl,
        score: interview.score,
        feedback: interview.feedback,
        completed_at: interview.completedAt
      },
      manatal_updated: true,
      candidate_id: data.candidate_id
    };
    
    console.log('📤 Hireflix Interview Results API: Sending response:', JSON.stringify(responsePayload, null, 2));
    
    return NextResponse.json(responsePayload);
    
  } catch (error) {
    console.error('💥 Hireflix Interview Results API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process interview results. Please try again.' },
      { status: 500 }
    );
  }
}
