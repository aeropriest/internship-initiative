import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '../../../../../services/firebase';
import { verify } from 'jsonwebtoken';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production';

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  
  if (!authToken) {
    return { authenticated: false, error: 'Authentication required', status: 401 };
  }
  
  try {
    // Verify JWT token
    verify(authToken, JWT_SECRET);
    return { authenticated: true };
  } catch (tokenError) {
    return { authenticated: false, error: 'Invalid or expired token', status: 401 };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Get update data from request body
    const updates = await request.json();
    
    // Check if application exists
    const existingApplication = await FirebaseService.getApplicationById(id);
    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Update application in Firebase
    await FirebaseService.updateApplication(id, updates);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Application updated successfully'
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Check if application exists
    const existingApplication = await FirebaseService.getApplicationById(id);
    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Delete application from Firebase
    await FirebaseService.deleteApplication(id);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
