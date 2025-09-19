import { NextRequest, NextResponse } from 'next/server';
import { HIREFLIX_API_KEY, MANATAL_API_TOKEN, RESEND_API_KEY, RESEND_FROM_EMAIL } from '../../../../config';
import { createInterviewCompleteEmailHtml } from '../../../../services/email';

interface HireflixWebhookPayload {
  event: string;
  interview?: {
    id: string;
    candidate: {
      name: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
    position: {
      id: string;
      name: string;
    };
    status: string;
    completed_at: string;
    video_url?: string;
    share_url?: string;
  };
  external_id?: string;
  // New structure for interview.status-change events
  data?: {
    id: string;
    position: {
      id: string;
      name: string;
    };
    externalId?: string;
    status: string;
    completed: number;
    candidate: {
      name: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    url: {
      short: string;
      private: string;
      public: string;
    };
  };
  date?: number;
}

// GET - Webhook info and health check
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`📋 Hireflix Webhook GET request at ${timestamp}`);
  
  return NextResponse.json({
    webhook: "Global Internship Initiative - Hireflix Interview Monitor",
    status: "active",
    timestamp: timestamp,
    events: ["interview.finish", "interview.status-change", "interview.started", "interview.recording", "interview.uploaded"],
    description: "Monitors Hireflix interview process and updates Manatal candidates",
    actions: [
      "Logs all Hireflix events for debugging",
      "Updates Manatal candidate with interview results",
      "Sends branded completion email to candidates",
      "Tracks interview progress in real-time"
    ],
    setup: {
      url: `${request.nextUrl.origin}/api/webhooks/hireflix`,
      method: "POST",
      events: ["interview.finish", "interview.status-change"]
    },
    ngrok_url: "https://3c6d5e35f4d9.ngrok-free.app/api/webhooks/hireflix",
    logs: "Comprehensive logging enabled for all events"
  });
}

// Add CORS headers for webhook
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  console.log('🔧 CORS preflight request received');
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// POST - Handle Hireflix webhook notifications
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log('\n' + '='.repeat(80));
  console.log(`🔔 HIREFLIX WEBHOOK RECEIVED AT ${timestamp}`);
  console.log('='.repeat(80));
  
  try {
    console.log('📡 Request Details:');
    console.log(`   Method: ${request.method}`);
    console.log(`   URL: ${request.url}`);
    console.log(`   Headers:`, Object.fromEntries(request.headers.entries()));
    
    console.log('\n📥 Reading request body...');
    const rawBody = await request.text();
    console.log(`📄 Raw body length: ${rawBody.length} characters`);
    console.log(`📄 Raw body preview: ${rawBody.substring(0, 500)}...`);
    
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Invalid JSON payload');
    }
    
    console.log('\n🔍 COMPLETE PAYLOAD ANALYSIS:');
    console.log('📋 Full Payload:', JSON.stringify(payload, null, 2));
    console.log('📊 Payload Keys:', Object.keys(payload));
    console.log('📋 Event Type:', payload.event || 'MISSING');
    
    // Log all possible data structures
    if (payload.interview) {
      console.log('\n🎬 INTERVIEW OBJECT FOUND:');
      console.log('   Interview ID:', payload.interview.id || 'MISSING');
      console.log('   Status:', payload.interview.status || 'MISSING');
      console.log('   Video URL:', payload.interview.video_url || 'MISSING');
      console.log('   Share URL:', payload.interview.share_url || 'MISSING');
      console.log('   Completed At:', payload.interview.completed_at || 'MISSING');
      
      if (payload.interview.candidate) {
        console.log('   Candidate Name:', payload.interview.candidate.name || 'MISSING');
        console.log('   Candidate Email:', payload.interview.candidate.email || 'MISSING');
      }
      
      if (payload.interview.position) {
        console.log('   Position ID:', payload.interview.position.id || 'MISSING');
        console.log('   Position Name:', payload.interview.position.name || 'MISSING');
      }
    }
    
    if (payload.data) {
      console.log('\n📊 DATA OBJECT FOUND:');
      console.log('   Interview ID:', payload.data.id || 'MISSING');
      console.log('   Status:', payload.data.status || 'MISSING');
      console.log('   External ID:', payload.data.externalId || 'MISSING');
      console.log('   Completed Timestamp:', payload.data.completed || 'MISSING');
      
      if (payload.data.candidate) {
        console.log('   Candidate Name:', payload.data.candidate.name || 'MISSING');
        console.log('   Candidate Email:', payload.data.candidate.email || 'MISSING');
        console.log('   Candidate First Name:', payload.data.candidate.firstName || 'MISSING');
        console.log('   Candidate Last Name:', payload.data.candidate.lastName || 'MISSING');
      }
      
      if (payload.data.url) {
        console.log('   Public URL:', payload.data.url.public || 'MISSING');
        console.log('   Private URL:', payload.data.url.private || 'MISSING');
        console.log('   Short URL:', payload.data.url.short || 'MISSING');
      }
      
      if (payload.data.position) {
        console.log('   Position ID:', payload.data.position.id || 'MISSING');
        console.log('   Position Name:', payload.data.position.name || 'MISSING');
      }
    }
    
    console.log('\n📋 External ID:', payload.external_id || 'MISSING');
    console.log('📅 Date:', payload.date || 'MISSING');
    
    // Track all events for monitoring
    await logEventToConsole(payload);
    
    // Handle different Hireflix event types
    if (payload.event === 'interview.status-change') {
      console.log('\n🔄 Processing interview.status-change event');
      
      if (payload.data?.status === 'completed') {
        console.log('✅ Interview completed via status-change event');
        
        // Transform the payload to match our expected structure
        const transformedPayload = transformStatusChangeToInterview(payload);
        await processInterviewCompletion(transformedPayload);
        
        const response = NextResponse.json({
          success: true,
          message: 'Interview completion processed via status-change',
          interviewId: payload.data.id,
          candidateId: payload.data.externalId,
          timestamp: timestamp
        });
        return addCorsHeaders(response);
      } else {
        console.log(`ℹ️  Status change to: ${payload.data?.status} (not completed, ignoring)`);
      }
    }
    
    if (payload.event === 'interview.finish') {
      console.log('\n✅ Processing interview.finish event');
      await processInterviewCompletion(payload);
      
      const response = NextResponse.json({
        success: true,
        message: 'Interview completion processed via finish event',
        interviewId: payload.interview?.id,
        candidateId: payload.external_id,
        timestamp: timestamp
      });
      return addCorsHeaders(response);
    }
    
    // Log all other events for monitoring
    console.log(`ℹ️  Event logged: ${payload.event}`);
    const response = NextResponse.json({
      success: true,
      message: `Event ${payload.event} logged successfully`,
      timestamp: timestamp
    });
    return addCorsHeaders(response);
    
  } catch (error) {
    console.error('❌ Webhook: Error processing notification:', error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  } finally {
    console.log('🔚 Webhook processing completed at', new Date().toISOString());
    console.log('='.repeat(80));
  }
}

// Log all events to console for monitoring
async function logEventToConsole(payload: any) {
  try {
    console.log('\n📝 EVENT LOGGING:');
    console.log(`   Event: ${payload.event}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`   Interview ID: ${payload.data?.id || payload.interview?.id || 'UNKNOWN'}`);
    console.log(`   Candidate ID: ${payload.data?.externalId || payload.external_id || 'UNKNOWN'}`);
    console.log(`   Status: ${payload.data?.status || payload.interview?.status || 'UNKNOWN'}`);
    
    // Store event in a simple log format
    const eventLog = {
      timestamp: new Date().toISOString(),
      event: payload.event,
      interviewId: payload.data?.id || payload.interview?.id,
      candidateId: payload.data?.externalId || payload.external_id,
      status: payload.data?.status || payload.interview?.status,
      candidateEmail: payload.data?.candidate?.email || payload.interview?.candidate?.email,
      positionName: payload.data?.position?.name || payload.interview?.position?.name,
      videoUrl: payload.data?.url?.public || payload.interview?.video_url,
      rawPayload: payload
    };
    
    console.log('📊 Event Log Entry:', JSON.stringify(eventLog, null, 2));
    
  } catch (error) {
    console.error('❌ Error logging event:', error);
  }
}

// Transform status-change payload to interview format
function transformStatusChangeToInterview(payload: any): HireflixWebhookPayload {
  return {
    event: 'interview.finish',
    external_id: payload.data?.externalId,
    interview: {
      id: payload.data?.id,
      status: payload.data?.status,
      completed_at: payload.data?.completed ? new Date(payload.data.completed).toISOString() : new Date().toISOString(),
      video_url: payload.data?.url?.public,
      share_url: payload.data?.url?.short,
      candidate: {
        name: payload.data?.candidate?.name || `${payload.data?.candidate?.firstName || ''} ${payload.data?.candidate?.lastName || ''}`.trim(),
        email: payload.data?.candidate?.email,
        firstName: payload.data?.candidate?.firstName,
        lastName: payload.data?.candidate?.lastName
      },
      position: {
        id: payload.data?.position?.id,
        name: payload.data?.position?.name
      }
    }
  };
}

// Process interview completion
async function processInterviewCompletion(payload: HireflixWebhookPayload) {
  try {
    console.log('\n🔄 PROCESSING INTERVIEW COMPLETION');
    console.log('='.repeat(50));
    
    const candidateId = payload.external_id;
    const interviewId = payload.interview?.id;
    const candidateEmail = payload.interview?.candidate?.email;
    const candidateName = payload.interview?.candidate?.name;
    
    console.log(`👤 Candidate: ${candidateName} (${candidateEmail})`);
    console.log(`🎬 Interview ID: ${interviewId}`);
    console.log(`🆔 External Candidate ID: ${candidateId || 'Not provided'}`);
    console.log(`📹 Video URL: ${payload.interview?.video_url || 'Not available'}`);
    
    if (!candidateEmail) {
      console.warn('⚠️ No candidate email provided, cannot update Manatal');
      return;
    }
    
    // If no external ID, try to find candidate by email
    let manatalCandidateId: string | undefined = candidateId;
    if (!manatalCandidateId && candidateEmail) {
      console.log('🔍 No external ID provided, will search Manatal by email');
      const foundId = await findManatalCandidateByEmail(candidateEmail);
      manatalCandidateId = foundId || undefined;
    }
    
    // Step 1: Update Manatal with interview results
    await updateManatalWithInterviewResults(payload, manatalCandidateId);
    
    // Step 2: Send branded completion email
    // await sendBrandedCompletionEmail(payload);
    
    // Step 3: Signal frontend to close iframe
    await signalInterviewComplete(payload, manatalCandidateId);
    
    console.log('✅ Interview completion processing finished');
    
  } catch (error) {
    console.error('❌ Error processing interview completion:', error);
  }
}

// Find Manatal candidate by email
async function findManatalCandidateByEmail(email: string): Promise<string | null> {
  try {
    console.log(`🔍 Searching Manatal for candidate with email: ${email}`);
    
    if (!MANATAL_API_TOKEN) {
      console.warn('⚠️ MANATAL_API_TOKEN not configured');
      return null;
    }
    
    // Search candidates by email
    const response = await fetch(`https://api.manatal.com/open/v3/candidates/?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const candidateId = data.results[0].id.toString();
        console.log(`✅ Found Manatal candidate: ${candidateId}`);
        return candidateId;
      } else {
        console.log('⚠️ No candidate found with this email in Manatal');
        return null;
      }
    } else {
      console.error('❌ Failed to search Manatal candidates:', response.status);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error searching Manatal candidate by email:', error);
    return null;
  }
}

// Update Manatal with interview results
async function updateManatalWithInterviewResults(payload: HireflixWebhookPayload, candidateId?: string | null) {
  try {
    console.log('\n📝 UPDATING MANATAL WITH INTERVIEW RESULTS');
    
    const manatalCandidateId = candidateId || payload.external_id;
    if (!manatalCandidateId) {
      console.warn('⚠️ No candidate ID provided');
      return;
    }
    
    const updateData = {
      custom_fields: {
        // Hireflix Integration Data
        hireflix_interview_id: payload.interview?.id || 'unknown',
        hireflix_interview_status: 'completed',
        hireflix_video_url: payload.interview?.video_url || payload.interview?.share_url || '',
        hireflix_share_url: payload.interview?.share_url || '',
        hireflix_position_id: payload.interview?.position?.id || '',
        hireflix_position_name: payload.interview?.position?.name || '',
        
        // Completion Tracking
        interview_completed_at: payload.interview?.completed_at || new Date().toISOString(),
        interview_platform: 'Hireflix',
        interview_status: 'completed',
        
        // Workflow Status
        application_stage: 'video_interview_complete',
        ready_for_review: true,
        
        // Webhook Processing
        webhook_processed_at: new Date().toISOString(),
        webhook_source: 'hireflix_webhook'
      }
    };
    
    console.log('📤 Manatal update data:', JSON.stringify(updateData, null, 2));
    
    if (!MANATAL_API_TOKEN) {
      console.warn('⚠️ MANATAL_API_TOKEN not configured, skipping Manatal update');
      return;
    }
    
    const response = await fetch(`https://api.manatal.com/open/v3/candidates/${manatalCandidateId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    console.log(`📊 Manatal API response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ Manatal candidate updated successfully via webhook');
    } else {
      const errorText = await response.text();
      console.error('❌ Manatal API error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error updating Manatal:', error);
  }
}

// Send branded completion email
async function sendBrandedCompletionEmail(payload: HireflixWebhookPayload) {
  try {
    console.log('\n📧 SENDING BRANDED COMPLETION EMAIL');
    
    const candidateEmail = payload.interview?.candidate?.email;
    const candidateName = payload.interview?.candidate?.name || 'Candidate';
    
    if (!candidateEmail) {
      console.warn('⚠️ No candidate email provided');
      return;
    }
    
    if (!RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping email');
      return;
    }
    
    const appUrl = process.env.NODE_ENV === 'production' 
      ? 'https://3c6d5e35f4d9.ngrok-free.app' 
      : 'http://localhost:3000';
    
    const emailHtml = createInterviewCompleteEmailHtml(candidateName, appUrl);
    
    console.log('📤 Sending email via Resend...');
    console.log(`   To: ${candidateEmail}`);
    console.log(`   From: ${RESEND_FROM_EMAIL}`);
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [candidateEmail],
        reply_to: 'ashokjaiswal@gmail.com',
        subject: 'Interview Complete - Global Internship Initiative 🎉',
        html: emailHtml,
      }),
    });
    
    const emailResponseText = await emailResponse.text();
    console.log('📥 Resend API response status:', emailResponse.status);
    console.log('📥 Resend API response:', emailResponseText);
    
    if (emailResponse.ok) {
      const result = JSON.parse(emailResponseText);
      console.log('✅ Branded completion email sent successfully via webhook');
      console.log('📧 Email ID:', result.id);
    } else {
      console.error('❌ Failed to send completion email via webhook:', emailResponseText);
    }
    
  } catch (error) {
    console.error('❌ Error sending branded completion email:', error);
  }
}

// Signal frontend to close iframe
async function signalInterviewComplete(payload: HireflixWebhookPayload, candidateId?: string | null) {
  try {
    console.log('\n🎯 SIGNALING INTERVIEW COMPLETION TO FRONTEND');
    
    const manatalCandidateId = candidateId || payload.external_id;
    const interviewId = payload.interview?.id;
    
    if (!manatalCandidateId || !interviewId) {
      console.warn('⚠️ Missing candidate ID or interview ID for signaling');
      return;
    }
    
    // Signal the interview completion API
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://3c6d5e35f4d9.ngrok-free.app' 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/interview-complete-signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate_id: manatalCandidateId,
        interview_id: interviewId,
        action: 'close_iframe'
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Interview completion signal sent successfully');
      console.log('📧 Frontend should close iframe for candidate:', manatalCandidateId);
    } else {
      console.warn('⚠️ Failed to send interview completion signal');
    }
    
  } catch (error) {
    console.error('❌ Error signaling interview completion:', error);
  }
}
