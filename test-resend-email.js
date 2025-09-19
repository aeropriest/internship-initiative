// Test Resend email functionality
require('dotenv').config({ path: '.env.local' });

const RESEND_API_KEY = process.env.NEXT_PUBLIC_RESEND_API_KEY || 're_6BZ9WZWD_2S6nGim2jE5mYooj8GyuT59Y';
const RESEND_FROM_EMAIL = 'Global Internship Initiative <onboarding@resend.dev>';

async function testResendEmail() {
  try {
    console.log('🧪 Testing Resend Email Configuration...');
    console.log('🔑 API Key:', RESEND_API_KEY ? `${RESEND_API_KEY.substring(0, 8)}...` : 'NOT SET');
    console.log('📧 From Email:', RESEND_FROM_EMAIL);
    
    const testEmail = {
      from: RESEND_FROM_EMAIL,
      to: ['ashok.jaiswal@gmail.com'], // Send to your verified email
      subject: 'Test Email - Global Internship Initiative',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify Resend configuration.</p>
        <p>If you receive this, the email system is working correctly!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
    };
    
    console.log('📤 Sending test email...');
    console.log('📧 Email details:', {
      from: testEmail.from,
      to: testEmail.to[0],
      subject: testEmail.subject
    });
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmail),
    });
    
    const responseText = await response.text();
    console.log('📥 Response status:', response.status);
    console.log('📥 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Test email sent successfully!');
      const result = JSON.parse(responseText);
      console.log('📧 Email ID:', result.id);
    } else {
      console.error('❌ Failed to send test email');
      
      // Common error analysis
      if (response.status === 401) {
        console.log('🔍 Issue: Invalid API key');
      } else if (response.status === 422) {
        console.log('🔍 Issue: Invalid email format or unverified domain');
        console.log('💡 Solution: You need to verify ashokjaiswal@gmail.com domain in Resend');
      } else if (response.status === 429) {
        console.log('🔍 Issue: Rate limit exceeded');
      }
    }
    
  } catch (error) {
    console.error('💥 Error testing Resend email:', error);
  }
}

// Run the test
testResendEmail();
