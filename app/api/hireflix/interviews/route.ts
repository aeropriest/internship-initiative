import { NextRequest, NextResponse } from 'next/server';
import { HIREFLIX_API_KEY } from '../../../../config';

interface InterviewRequest {
  position_id: string;
  candidate_email: string;
  candidate_name: string;
  manatal_candidate_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Hireflix Interview API: Received interview creation request');
    
    const data: InterviewRequest = await request.json();
    console.log('📝 Hireflix Interview API: Request data:', JSON.stringify(data, null, 2));
    
    if (!HIREFLIX_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_HIREFLIX_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    // Validate required fields
    const requiredFields = ['position_id', 'candidate_email', 'candidate_name'];
    for (const field of requiredFields) {
      if (!data[field as keyof InterviewRequest]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    console.log('🌐 Hireflix Interview API: Creating interview invitation...');
    console.log(`👤 Candidate: ${data.candidate_name} (${data.candidate_email})`);
    console.log(`📋 Position ID: ${data.position_id}`);
    
    // Create interview invitation in Hireflix (without externalId as it's not supported)
    const inviteMutation = `
      mutation InviteCandidate($positionId: String!, $candidateEmail: String!, $candidateName: String!) {
        Position(id: $positionId) {
          invite(candidate: { 
            email: $candidateEmail, 
            name: $candidateName
          }) {
            url {
              public
            }
            id
          }
        }
      }
    `;
    
    const variables = {
      positionId: data.position_id,
      candidateEmail: data.candidate_email,
      candidateName: data.candidate_name
    };
    
    console.log(`🆔 External ID (Manatal Candidate ID): ${data.manatal_candidate_id}`);
    
    console.log('📤 Hireflix Interview API: Sending GraphQL mutation...');
    console.log('Variables:', JSON.stringify(variables, null, 2));
    
    const startTime = Date.now();
    const response = await fetch('https://api.hireflix.com/me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': HIREFLIX_API_KEY,
      },
      body: JSON.stringify({
        query: inviteMutation,
        variables
      }),
    });
    
    const endTime = Date.now();
    console.log(`⏱️ Hireflix Interview API: Request completed in ${endTime - startTime}ms`);
    
    const responseData = await response.json();
    console.log('📥 Hireflix Interview API: Response:', JSON.stringify(responseData, null, 2));
    
    if (responseData.errors) {
      console.error('❌ Hireflix Interview API: GraphQL errors:', responseData.errors);
      
      // Handle specific error cases
      const errorMessages = responseData.errors.map((e: any) => e.message);
      const hasAlreadyExistsError = responseData.errors.some((e: any) => 
        e.message === 'candidate-already-exists' || 
        e.extensions?.code === 409 || 
        e.code === 409
      );
      
      if (hasAlreadyExistsError) {
        console.log('💡 Hireflix Interview API: Candidate already invited to this position');
        
        // Try to find existing interview for this candidate
        // For now, return a graceful response that the UI can handle
        return NextResponse.json({
          success: true,
          interview: {
            id: `existing_${data.position_id}_${Date.now()}`,
            position_id: data.position_id,
            candidate_email: data.candidate_email,
            interview_url: null, // No new interview URL since already exists
            status: 'already_invited',
            created_at: new Date().toISOString(),
            manatal_candidate_id: data.manatal_candidate_id,
            existing_candidate: true
          },
          message: 'This candidate has already been invited to this position. They can use their existing interview link.',
          user_message: 'You have already been invited to interview for this position. Please check your email for the interview link, or contact us if you need assistance.'
        });
      }
      
      return NextResponse.json(
        { success: false, error: `Hireflix error: ${errorMessages.join(', ')}` },
        { status: 500 }
      );
    }
    
    const interview = responseData.data?.Position?.invite;
    if (!interview) {
      console.error('❌ Hireflix Interview API: No interview data returned');
      return NextResponse.json(
        { success: false, error: 'No interview data returned from Hireflix' },
        { status: 500 }
      );
    }
    
    console.log('✅ Hireflix Interview API: Interview created successfully!');
    console.log('🆔 Interview ID:', interview.id);
    console.log('🔗 Interview URL:', interview.url.public);
    
    const responsePayload = {
      success: true,
      interview: {
        id: interview.id,
        position_id: data.position_id,
        candidate_email: data.candidate_email,
        interview_url: interview.url.public,
        status: 'pending',
        created_at: new Date().toISOString(),
        // Add mock data for testing
        transcript_url: `https://mock-transcript-url.com/transcript_${interview.id}.txt`,
        resume_url: `https://mock-resume-url.com/resume_${interview.id}.pdf`,
        manatal_candidate_id: data.manatal_candidate_id
      }
    };
    
    console.log('📤 Hireflix Interview API: Sending response:', JSON.stringify(responsePayload, null, 2));
    
    return NextResponse.json(responsePayload);
    
  } catch (error) {
    console.error('💥 Hireflix Interview API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create interview. Please try again.' },
      { status: 500 }
    );
  }
}
