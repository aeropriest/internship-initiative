import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { verify } from 'jsonwebtoken';
import { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } from '../../../../config';

let db: FirebaseFirestore.Firestore | null = null;

// Lazy initialization of Firebase Admin SDK
function getDb() {
  if (db) return db;
  
  try {
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      console.error('Missing Firebase environment variables:', {
        hasProjectId: !!FIREBASE_PROJECT_ID,
        hasClientEmail: !!FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!FIREBASE_PRIVATE_KEY
      });
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

    db = getFirestore(adminApp);
    console.log('Firebase Admin SDK initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

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
    
    // Get database instance
    const database = getDb();
    
    // Fetch data from Firebase using Admin SDK
    const applicationsSnapshot = await database.collection('applications').get();
    const applications = applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get quiz results (for future use)
    const quizResultsSnapshot = await database.collection('quizResults').get();
    const quizResults = quizResultsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort applications by timestamp (newest first)
    const sortedApplications = [...applications].sort((a, b) => {
      const dateA = (a as any).timestamp instanceof Date ? (a as any).timestamp : new Date((a as any).timestamp as any);
      const dateB = (b as any).timestamp instanceof Date ? (b as any).timestamp : new Date((b as any).timestamp as any);
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
