import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '../../../../../services/firebase';
import { verify } from 'jsonwebtoken';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    // Fetch application from Firebase
    const application = await FirebaseService.getApplicationById(id);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Process application for the response
    // Convert Firestore timestamp to ISO string for JSON serialization
    const timestamp = application.timestamp instanceof Date 
      ? application.timestamp.toISOString() 
      : typeof application.timestamp === 'object' && application.timestamp && typeof application.timestamp.toDate === 'function'
        ? application.timestamp.toDate().toISOString()
        : application.timestamp;
    
    const processedApplication = {
      ...application,
      timestamp
    };
    
    // Return application
    return NextResponse.json({
      application: processedApplication
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application details' },
      { status: 500 }
    );
  }
}
