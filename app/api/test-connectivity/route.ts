import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test various endpoints to diagnose connectivity
  const testEndpoints = [
    { name: 'Google DNS', url: 'https://8.8.8.8/' },
    { name: 'Google', url: 'https://google.com/' },
    { name: 'Hireflix', url: 'https://hireflix.com/' },
    { name: 'Hireflix API', url: 'https://api.hireflix.com/' },
    { name: 'Manatal', url: 'https://manatal.com/' },
    { name: 'Manatal API', url: 'https://api.manatal.com/' },
    { name: 'Manatal API Open', url: 'https://api.manatal.com/open/' },
    { name: 'Manatal API v3', url: 'https://api.manatal.com/open/v3/' },
  ];

  for (const endpoint of testEndpoints) {
    const testResult: any = {
      name: endpoint.name,
      url: endpoint.url,
      status: 'unknown',
      error: null,
      responseTime: 0
    };

    try {
      console.log(`🧪 Testing ${endpoint.name}: ${endpoint.url}`);
      const startTime = Date.now();
      
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Global-Internship-Initiative-Test/1.0',
          'Accept': '*/*',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      const endTime = Date.now();
      testResult.responseTime = endTime - startTime;
      testResult.status = response.status;
      testResult.success = response.ok;
      
      console.log(`✅ ${endpoint.name}: ${response.status} (${testResult.responseTime}ms)`);
      
    } catch (error) {
      testResult.success = false;
      testResult.error = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${endpoint.name}: ${testResult.error}`);
    }

    results.tests.push(testResult);
  }

  // Test DNS resolution specifically
  try {
    console.log('🔍 Testing DNS resolution...');
    const dnsTest = await fetch('https://1.1.1.1/dns-query?name=api.manatal.com&type=A', {
      headers: {
        'Accept': 'application/dns-json',
      },
    });
    
    if (dnsTest.ok) {
      const dnsData = await dnsTest.json();
      results.dns = {
        success: true,
        data: dnsData
      };
      console.log('✅ DNS resolution test passed');
    }
  } catch (dnsError) {
    results.dns = {
      success: false,
      error: dnsError instanceof Error ? dnsError.message : String(dnsError)
    };
    console.log('❌ DNS resolution test failed:', results.dns.error);
  }

  // Environment info
  results.environment = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    userAgent: request.headers.get('user-agent'),
    host: request.headers.get('host'),
  };

  console.log('📊 Connectivity test results:', JSON.stringify(results, null, 2));

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  // Test specific API calls
  try {
    const body = await request.json();
    const { testType } = body;

    if (testType === 'manatal') {
      console.log('🧪 Testing Manatal API specifically...');
      
      const MANATAL_API_TOKEN = process.env.NEXT_PUBLIC_MANATAL_API_TOKEN || '51ce36b3ac06f113f418f0e0f47391e7471090c7';
      if (!MANATAL_API_TOKEN) {
        return NextResponse.json({
          success: false,
          error: 'MANATAL_API_TOKEN not configured'
        });
      }

      // Test authentication
      const response = await fetch('https://api.manatal.com/open/v3/candidates/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${MANATAL_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      const responseText = await response.text();
      
      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.substring(0, 1000), // Limit response size
        tokenLength: MANATAL_API_TOKEN.length
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown test type'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
