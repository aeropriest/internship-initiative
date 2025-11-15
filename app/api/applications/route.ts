import { NextResponse } from 'next/server';

// Get Manatal API token from environment variables
const MANATAL_API_TOKEN = process.env.MANATAL_API_TOKEN;
const MANATAL_API_BASE_URL = 'https://api.manatal.com/open/v3';

export async function GET() {
  try {
    if (!MANATAL_API_TOKEN) {
      return NextResponse.json(
        { error: 'Manatal API token not configured' },
        { status: 500 }
      );
    }

    // Fetch candidates from Manatal
    const response = await fetch(`${MANATAL_API_BASE_URL}/candidates/`, {
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Manatal API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch candidates: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Process the response to include only necessary fields
    const candidates = data.results.map((candidate: any) => ({
      id: candidate.id,
      full_name: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      position: candidate.position?.name,
      status: candidate.status?.name,
      created_at: candidate.created_at,
      updated_at: candidate.updated_at,
      custom_fields: candidate.custom_fields || {},
      resume_url: candidate.resume?.file || null
    }));

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}
