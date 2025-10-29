import { NextRequest, NextResponse } from 'next/server';
import { MANATAL_API_TOKEN } from '../../../../config';

// Define the Manatal candidate interface
interface ManatalCandidate {
  id: number;
  full_name: string;
  email: string;
  current_position?: string | null;
  [key: string]: any; // Allow other properties
}

export async function GET(request: NextRequest) {
  try {
    if (!MANATAL_API_TOKEN) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Manatal API token is not configured. Please set NEXT_PUBLIC_MANATAL_API_TOKEN in your .env.local file.' 
        },
        { status: 500 }
      );
    }

    // Test the Manatal API by fetching candidates
    console.log('Testing Manatal API with token:', MANATAL_API_TOKEN.substring(0, 5) + '...');
    const response = await fetch('https://api.manatal.com/open/v3/candidates/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to connect to Manatal API: ${response.status} ${response.statusText}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Manatal API',
      candidates_count: data.count || 0,
      first_candidates: data.results?.slice(0, 3).map((c: ManatalCandidate) => ({
        id: c.id,
        name: c.full_name,
        email: c.email,
        position: c.current_position
      })) || []
    });
  } catch (error) {
    console.error('Error testing Manatal API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
