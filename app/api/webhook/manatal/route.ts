import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (in production, you should verify this)
    const signature = request.headers.get('x-manatal-signature');
    
    // Handle different webhook events
    const { event_type, candidate_id, data } = body;
    
    console.log('Manatal webhook received:', { event_type, candidate_id, data });
    
    switch (event_type) {
      case 'candidate.resume.uploaded':
        // Handle resume upload completion
        await handleResumeUploaded(candidate_id, data);
        break;
        
      case 'candidate.created':
        // Handle candidate creation
        await handleCandidateCreated(candidate_id, data);
        break;
        
      case 'candidate.updated':
        // Handle candidate updates
        await handleCandidateUpdated(candidate_id, data);
        break;
        
      default:
        console.log('Unhandled webhook event:', event_type);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleResumeUploaded(candidateId: string, data: any) {
  try {
    // Update application status in localStorage (in production, use a database)
    // This is a simulation - in real implementation, you'd update your database
    console.log(`Resume uploaded for candidate ${candidateId}:`, data);
    
    // You could trigger additional actions here:
    // - Send notification email
    // - Update application status
    // - Trigger next step in the process
    
    return { success: true };
  } catch (error) {
    console.error('Error handling resume upload:', error);
    throw error;
  }
}

async function handleCandidateCreated(candidateId: string, data: any) {
  try {
    console.log(`Candidate created: ${candidateId}`, data);
    return { success: true };
  } catch (error) {
    console.error('Error handling candidate creation:', error);
    throw error;
  }
}

async function handleCandidateUpdated(candidateId: string, data: any) {
  try {
    console.log(`Candidate updated: ${candidateId}`, data);
    return { success: true };
  } catch (error) {
    console.error('Error handling candidate update:', error);
    throw error;
  }
}

// Handle GET requests (for webhook verification)
export async function GET() {
  return NextResponse.json({ message: 'Manatal webhook endpoint is active' });
}
