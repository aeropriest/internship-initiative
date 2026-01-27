import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { verify } from 'jsonwebtoken';
import { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } from '../../../../config';

// Initialize Firebase Admin SDK only if it doesn't exist
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error('Firebase environment variables not configured');
}

const adminApp = getApps().length === 0 
  ? initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  : getApps()[0];

const db = getFirestore(adminApp);

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
    
    // Fetch applications from Firebase using Admin SDK
    const applicationsSnapshot = await db.collection('applications').get();
    const applications = applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process applications for the response
    const processedApplications = applications.map(app => {
      // Convert Firestore timestamp to ISO string for JSON serialization
      const timestamp = (app as any).timestamp instanceof Date 
        ? (app as any).timestamp.toISOString() 
        : typeof (app as any).timestamp === 'object' && (app as any).timestamp && typeof (app as any).timestamp.toDate === 'function'
          ? (app as any).timestamp.toDate().toISOString()
          : (app as any).timestamp;
      
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
