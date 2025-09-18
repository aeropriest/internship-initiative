import { NextRequest, NextResponse } from 'next/server';
import { HIREFLIX_API_KEY } from '../../../../config';

interface HireflixPosition {
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  tags: string[];
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Hireflix API: Fetching positions from Hireflix...');
    
    if (!HIREFLIX_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_HIREFLIX_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    const query = `
      query {
        positions {
          id
          name
          description
          archived
          tags
        }
      }
    `;
    
    console.log('🌐 Hireflix API: Making GraphQL request to fetch positions...');
    
    const response = await fetch('https://api.hireflix.com/me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': HIREFLIX_API_KEY,
      },
      body: JSON.stringify({ query }),
    });
    
    const data = await response.json();
    console.log('📥 Hireflix API: Response received:', JSON.stringify(data, null, 2));
    
    if (data.errors) {
      console.error('❌ Hireflix API: GraphQL errors:', data.errors);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch positions from Hireflix', details: data.errors },
        { status: 500 }
      );
    }
    
    const positions = data.data?.positions || [];
    
    // Filter active positions only
    const activePositions = positions.filter((pos: HireflixPosition) => !pos.archived);
    
    console.log(`✅ Hireflix API: Found ${positions.length} total positions, ${activePositions.length} active`);
    
    // Transform positions for frontend
    const transformedPositions = activePositions.map((pos: HireflixPosition) => ({
      id: pos.id,
      title: pos.name,
      description: pos.description || 'No description available',
      location: 'Various International Locations',
      department: pos.tags?.join(', ') || 'General',
      employment_type: 'Internship',
      status: 'open',
      tags: pos.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    return NextResponse.json({
      success: true,
      positions: transformedPositions,
      total: activePositions.length,
      source: 'hireflix_api'
    });
    
  } catch (error) {
    console.error('❌ Hireflix API: Error fetching positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch positions from Hireflix' },
      { status: 500 }
    );
  }
}
