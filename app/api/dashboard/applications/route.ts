import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '../../../../services/firebase';
import { verify } from 'jsonwebtoken';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    try {
      // Verify JWT token
      verify(authToken, JWT_SECRET);
    } catch (tokenError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Fetch applications from Firebase
    const applications = await FirebaseService.getApplications();
    
    // Process applications for the response
    const processedApplications = applications.map(app => {
      // Convert Firestore timestamp to ISO string for JSON serialization
      const timestamp = app.timestamp instanceof Date 
        ? app.timestamp.toISOString() 
        : typeof app.timestamp === 'object' && app.timestamp && typeof app.timestamp.toDate === 'function'
          ? app.timestamp.toDate().toISOString()
          : app.timestamp;
      
      return {
        ...app,
        timestamp
      };
    });
    
    // Return applications
    return NextResponse.json({
      applications: processedApplications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
