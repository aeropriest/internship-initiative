import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '../../../../services/firebase';
import { verify } from 'jsonwebtoken';

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
    
    // Fetch data from Firebase
    const applications = await FirebaseService.getApplications();
    const quizResults = await FirebaseService.getQuizResults();
    
    // Sort applications by timestamp (newest first)
    const sortedApplications = [...applications].sort((a, b) => {
      // Handle Firestore Timestamp objects or Date objects
      const dateA = a.timestamp instanceof Date ? a.timestamp : 
                   (a.timestamp && typeof a.timestamp.toDate === 'function') ? 
                   a.timestamp.toDate() : new Date(a.timestamp as any);
      
      const dateB = b.timestamp instanceof Date ? b.timestamp : 
                   (b.timestamp && typeof b.timestamp.toDate === 'function') ? 
                   b.timestamp.toDate() : new Date(b.timestamp as any);
                   
      return dateB.getTime() - dateA.getTime();
    });
    
    // Get recent applications (last 5)
    const recentApplications = sortedApplications.slice(0, 5);
    
    // Return dashboard statistics
    return NextResponse.json({
      totalApplications: applications.length,
      totalQuizResults: quizResults.length,
      recentApplications,
      // Add more statistics as needed
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
