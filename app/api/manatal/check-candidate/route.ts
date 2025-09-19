import { NextRequest, NextResponse } from 'next/server';
import { MANATAL_API_TOKEN } from '../../../../config';

// POST - Check if candidate already exists in Manatal
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Manatal Check API: Received candidate check request');
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Checking if candidate exists: ${email}`);
    
    if (!MANATAL_API_TOKEN) {
      console.warn('⚠️ MANATAL_API_TOKEN not configured');
      return NextResponse.json(
        { success: false, error: 'Manatal API not configured' },
        { status: 500 }
      );
    }
    
    // Search for existing candidate by email
    const response = await fetch(`https://api.manatal.com/open/v3/candidates/?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`📊 Manatal search response: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const candidate = data.results[0];
        console.log(`✅ Found existing candidate: ${candidate.id}`);
        
        // Extract relevant information
        const candidateInfo = {
          id: candidate.id,
          full_name: candidate.full_name,
          email: candidate.email,
          created_at: candidate.created_at,
          custom_fields: candidate.custom_fields || {},
          // Check interview status from custom fields
          interview_status: candidate.custom_fields?.interview_status || 'pending',
          hireflix_interview_status: candidate.custom_fields?.hireflix_interview_status || null,
          application_stage: candidate.custom_fields?.application_stage || 'application_submitted',
          position_applied: candidate.custom_fields?.position_applied || 'Unknown Position'
        };
        
        // Determine current status
        let status = 'application_submitted';
        let message = 'Your application has been submitted and is being processed.';
        let next_step = 'wait_for_contact';
        
        if (candidateInfo.hireflix_interview_status === 'completed') {
          status = 'interview_completed';
          message = 'You have completed your video interview! Our team is reviewing your responses.';
          next_step = 'wait_for_results';
        } else if (candidateInfo.application_stage === 'video_interview_scheduled' || 
                   candidateInfo.interview_status === 'scheduled') {
          status = 'interview_scheduled';
          message = 'Your video interview has been scheduled. Please check your email for the interview link.';
          next_step = 'complete_interview';
        }
        
        return NextResponse.json({
          success: true,
          exists: true,
          candidate: candidateInfo,
          status,
          message,
          next_step,
          ui_message: `Welcome back! You have already applied for the ${candidateInfo.position_applied} position.`
        });
        
      } else {
        console.log('✅ No existing candidate found');
        return NextResponse.json({
          success: true,
          exists: false,
          message: 'No existing application found. You can proceed with your application.'
        });
      }
      
    } else {
      console.error('❌ Failed to search Manatal candidates:', response.status);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing candidate' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error checking candidate:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
