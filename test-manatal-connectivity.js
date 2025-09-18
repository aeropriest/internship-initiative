/**
 * Test Manatal API Connectivity
 * Run this script to diagnose connectivity issues
 */

const https = require('https');
const { URL } = require('url');

const MANATAL_API_TOKEN = process.env.NEXT_PUBLIC_MANATAL_API_TOKEN || '51ce36b3ac06f113f418f0e0f47391e7471090c7';

console.log('🔍 Manatal Connectivity Test');
console.log('=' .repeat(50));
console.log(`🔑 API Token: ${MANATAL_API_TOKEN.substring(0, 10)}...`);
console.log(`🌐 Node.js Version: ${process.version}`);
console.log(`💻 Platform: ${process.platform}`);
console.log('');

async function testConnectivity() {
  console.log('📡 Testing basic connectivity...');
  
  // Test 1: Basic DNS resolution
  try {
    const dns = require('dns').promises;
    console.log('🔍 Testing DNS resolution for api.manatal.com...');
    const addresses = await dns.resolve4('api.manatal.com');
    console.log('✅ DNS Resolution successful:', addresses);
  } catch (dnsError) {
    console.log('❌ DNS Resolution failed:', dnsError.message);
    return;
  }

  // Test 2: Basic HTTPS connection
  console.log('🔗 Testing HTTPS connection...');
  try {
    await testHttpsConnection('https://api.manatal.com/');
    console.log('✅ HTTPS connection successful');
  } catch (httpsError) {
    console.log('❌ HTTPS connection failed:', httpsError.message);
    return;
  }

  // Test 3: API endpoint test
  console.log('🧪 Testing API endpoint...');
  try {
    const result = await testManatalAPI();
    console.log('✅ API test result:', result);
  } catch (apiError) {
    console.log('❌ API test failed:', apiError.message);
  }
}

function testHttpsConnection(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Global-Internship-Initiative-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📊 Response status: ${res.statusCode}`);
      console.log(`📋 Response headers:`, res.headers);
      resolve({
        statusCode: res.statusCode,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testManatalAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      first_name: 'Test',
      last_name: 'Candidate',
      full_name: 'Test Candidate',
      email: 'test@example.com',
      source: 'Connectivity Test'
    });

    const options = {
      hostname: 'api.manatal.com',
      port: 443,
      path: '/open/v3/candidates/',
      method: 'POST',
      timeout: 15000,
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Global-Internship-Initiative-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📊 API Response status: ${res.statusCode}`);
        console.log(`📋 API Response headers:`, res.headers);
        console.log(`📥 API Response body (first 500 chars):`, data.substring(0, 500));
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 1000)
        });
      });
    });

    req.on('error', (error) => {
      console.log('❌ API Request error:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('API Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Alternative test using fetch (if available)
async function testWithFetch() {
  console.log('🧪 Testing with fetch API...');
  
  try {
    // Test basic connectivity first
    console.log('🔗 Testing basic fetch to api.manatal.com...');
    const basicResponse = await fetch('https://api.manatal.com/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Global-Internship-Initiative-Test/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    console.log('✅ Basic fetch successful:', basicResponse.status);
    
    // Test API endpoint
    console.log('🧪 Testing API endpoint with fetch...');
    const apiResponse = await fetch('https://api.manatal.com/open/v3/candidates/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Global-Internship-Initiative-Test/1.0'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    console.log('✅ API fetch successful:', apiResponse.status);
    const responseText = await apiResponse.text();
    console.log('📥 API Response:', responseText.substring(0, 500));
    
  } catch (fetchError) {
    console.log('❌ Fetch test failed:', fetchError.message);
    console.log('🔍 Error details:', fetchError);
  }
}

// Run tests
async function runAllTests() {
  try {
    await testConnectivity();
    console.log('\n' + '='.repeat(50));
    
    // Test with fetch if available
    if (typeof fetch !== 'undefined') {
      await testWithFetch();
    } else {
      console.log('ℹ️ Fetch API not available in this Node.js version');
    }
    
  } catch (error) {
    console.log('💥 Test suite failed:', error.message);
  }
}

runAllTests();
