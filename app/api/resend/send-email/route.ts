import { NextRequest, NextResponse } from 'next/server';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '../../../../config';

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Resend Email API: Received email send request');
    
    const data: EmailRequest = await request.json();
    console.log('📝 Resend Email API: Request data:', {
      to: data.to,
      subject: data.subject,
      from: data.from || RESEND_FROM_EMAIL,
      htmlLength: data.html?.length || 0
    });
    
    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    // Validate required fields
    const requiredFields = ['to', 'subject', 'html'];
    for (const field of requiredFields) {
      if (!data[field as keyof EmailRequest]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    console.log('📤 Resend Email API: Sending email via Resend...');
    console.log(`📧 To: ${data.to.join(', ')}`);
    console.log(`📋 Subject: ${data.subject}`);
    
    const startTime = Date.now();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: data.from || RESEND_FROM_EMAIL,
        to: data.to,
        subject: data.subject,
        html: data.html,
      }),
    });
    
    const endTime = Date.now();
    console.log(`⏱️ Resend Email API: Request completed in ${endTime - startTime}ms`);
    
    const responseData = await response.json();
    console.log(`📊 Resend Email API: Response status: ${response.status}`);
    console.log('📥 Resend Email API: Response:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      console.error('❌ Resend Email API: Email send failed');
      return NextResponse.json(
        { success: false, error: 'Failed to send email', details: responseData },
        { status: response.status }
      );
    }
    
    console.log('✅ Resend Email API: Email sent successfully!');
    console.log(`📧 Email ID: ${responseData.id}`);
    
    return NextResponse.json({
      success: true,
      emailId: responseData.id,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    console.error('💥 Resend Email API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}
