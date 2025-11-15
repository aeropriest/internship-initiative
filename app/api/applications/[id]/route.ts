import { NextRequest, NextResponse } from 'next/server';

// Get Manatal API token from environment variables
const MANATAL_API_TOKEN = process.env.MANATAL_API_TOKEN;
const MANATAL_API_BASE_URL = 'https://api.manatal.com/open/v3';

// GET a single candidate by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!MANATAL_API_TOKEN) {
      return NextResponse.json(
        { error: 'Manatal API token not configured' },
        { status: 500 }
      );
    }

    const id = params.id;

    // Fetch candidate from Manatal
    const response = await fetch(`${MANATAL_API_BASE_URL}/candidates/${id}/`, {
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
        { error: `Failed to fetch candidate: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const candidate = await response.json();
    
    // Process the response to include only necessary fields
    const processedCandidate = {
      id: candidate.id,
      full_name: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      position: candidate.position?.name,
      position_id: candidate.position?.id,
      status: candidate.status?.name,
      status_id: candidate.status?.id,
      created_at: candidate.created_at,
      updated_at: candidate.updated_at,
      custom_fields: candidate.custom_fields || {},
      resume_url: candidate.resume?.file || null,
      attachments: candidate.attachments || []
    };

    return NextResponse.json(processedCandidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
}

// PATCH to update a candidate by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!MANATAL_API_TOKEN) {
      return NextResponse.json(
        { error: 'Manatal API token not configured' },
        { status: 500 }
      );
    }

    const id = params.id;
    const body = await request.json();

    // Update candidate in Manatal
    const response = await fetch(`${MANATAL_API_BASE_URL}/candidates/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Manatal API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to update candidate: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const updatedCandidate = await response.json();
    return NextResponse.json(updatedCandidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    );
  }
}

// DELETE a candidate by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!MANATAL_API_TOKEN) {
      return NextResponse.json(
        { error: 'Manatal API token not configured' },
        { status: 500 }
      );
    }

    const id = params.id;

    // Delete candidate from Manatal
    const response = await fetch(`${MANATAL_API_BASE_URL}/candidates/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${MANATAL_API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Manatal API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to delete candidate: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json(
      { error: 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}
