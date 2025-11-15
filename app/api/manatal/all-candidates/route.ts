import { NextRequest, NextResponse } from 'next/server';
import { MANATAL_API_TOKEN } from '../../../../config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Manatal All Candidates API: Fetching all candidates');
    
    if (!MANATAL_API_TOKEN) {
      console.warn('⚠️ MANATAL_API_TOKEN not configured');
      return NextResponse.json(
        { success: false, error: 'Manatal API not configured' },
        { status: 500 }
      );
    }
    
    // Fetch candidates from Manatal API
    const response = await fetch('https://api.manatal.com/open/v3/candidates/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`📊 Manatal search response: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      // Process candidates
      const candidates = data.results.map((candidate: any) => ({
        id: candidate.id,
        full_name: candidate.full_name,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.custom_fields?.candidate_location,
        position_applied: candidate.custom_fields?.position_applied,
        status: candidate.custom_fields?.interview_status || 'pending',
        created_at: candidate.created_at,
        updated_at: candidate.updated_at,
        source: 'manatal',
        interview_status: candidate.custom_fields?.interview_status,
        hireflix_interview_status: candidate.custom_fields?.hireflix_interview_status,
        application_stage: candidate.custom_fields?.application_stage,
        resume_url: candidate.resume_url,
        tags: candidate.tags
      }));
      
      return NextResponse.json({
        success: true,
        candidates,
        total: data.count
      });
    } else {
      console.error('❌ Failed to fetch Manatal candidates:', response.status);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch candidates from Manatal' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('❌ Error fetching Manatal candidates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
