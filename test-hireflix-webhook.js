// Test Hireflix webhook endpoint
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const WEBHOOK_URL = 'https://3c6d5e35f4d9.ngrok-free.app/api/webhooks/hireflix';
const LOCAL_URL = 'http://localhost:3000/api/webhooks/hireflix';

async function testWebhookEndpoint() {
  try {
    console.log('🧪 Testing Hireflix Webhook Endpoint...');
    console.log('🔗 Webhook URL:', WEBHOOK_URL);
    
    // Test 1: GET request for webhook info
    console.log('\n📋 Test 1: GET request for webhook info');
    const getResponse = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const getResult = await getResponse.json();
    console.log('✅ GET Response:', JSON.stringify(getResult, null, 2));
    
    // Test 2: Mock interview completion webhook
    console.log('\n🎬 Test 2: Mock interview completion webhook');
    const mockPayload = {
      event: 'interview.status-change',
      data: {
        id: 'test_interview_123',
        externalId: '124014816', // Use the candidate ID from your test
        status: 'completed',
        completed: Date.now(),
        candidate: {
          name: 'Test Candidate',
          firstName: 'Test',
          lastName: 'Candidate',
          email: 'ashok.jaiswal@gmail.com' // Your email for testing
        },
        position: {
          id: 'test_position_456',
          name: 'Operations Internship'
        },
        url: {
          public: 'https://app.hireflix.com/test-video-url',
          private: 'https://app.hireflix.com/private-test-video-url',
          short: 'https://hireflix.co/short123'
        }
      },
      date: Date.now()
    };
    
    console.log('📤 Sending mock payload:', JSON.stringify(mockPayload, null, 2));
    
    const postResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockPayload),
    });
    
    const postResult = await postResponse.json();
    console.log('📥 POST Response Status:', postResponse.status);
    console.log('📥 POST Response:', JSON.stringify(postResult, null, 2));
    
    if (postResponse.ok) {
      console.log('✅ Webhook test completed successfully!');
      console.log('🎯 The webhook should have:');
      console.log('   1. Logged the complete payload');
      console.log('   2. Updated Manatal candidate 124014816');
      console.log('   3. Sent a branded email to ashok.jaiswal@gmail.com');
    } else {
      console.log('❌ Webhook test failed');
    }
    
  } catch (error) {
    console.error('💥 Error testing webhook:', error);
  }
}

// Test 3: Test with different event types
async function testDifferentEvents() {
  console.log('\n🔄 Test 3: Testing different event types');
  
  const events = [
    {
      event: 'interview.started',
      data: { id: 'test_123', status: 'started', externalId: '124014816' }
    },
    {
      event: 'interview.recording',
      data: { id: 'test_123', status: 'recording', externalId: '124014816' }
    },
    {
      event: 'interview.uploaded',
      data: { id: 'test_123', status: 'uploaded', externalId: '124014816' }
    }
  ];
  
  for (const eventPayload of events) {
    try {
      console.log(`\n📡 Testing event: ${eventPayload.event}`);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      });
      
      const result = await response.json();
      console.log(`✅ ${eventPayload.event}: ${result.message}`);
      
    } catch (error) {
      console.error(`❌ Error testing ${eventPayload.event}:`, error);
    }
  }
}

// Run tests
async function runAllTests() {
  await testWebhookEndpoint();
  await testDifferentEvents();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 WEBHOOK SETUP COMPLETE');
  console.log('='.repeat(60));
  console.log('📋 Add this URL to Hireflix webhooks:');
  console.log('🔗 ' + WEBHOOK_URL);
  console.log('');
  console.log('📝 Recommended Hireflix webhook events:');
  console.log('   • interview.status-change');
  console.log('   • interview.finish');
  console.log('   • interview.started (optional for monitoring)');
  console.log('   • interview.recording (optional for monitoring)');
  console.log('   • interview.uploaded (optional for monitoring)');
  console.log('='.repeat(60));
}

runAllTests();
