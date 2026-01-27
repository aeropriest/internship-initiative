import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET, ADMIN_USERNAME } from '../../../../config';

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
      storageBucket: FIREBASE_STORAGE_BUCKET,
    })
  : getApps()[0];

const db = getFirestore(adminApp);
const storage = getStorage(adminApp);
const adminAuth = getAuth(adminApp);

// Middleware to verify admin token
async function verifyAdminToken(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.admin === true || decodedToken.uid === ADMIN_USERNAME;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

// Get all applications
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    if (!(await verifyAdminToken(request))) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'applications';

    switch (type) {
      case 'applications':
        const applicationsSnapshot = await db.collection('applications').get();
        const applications = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        return NextResponse.json({ applications });

      case 'surveyResults':
        const surveySnapshot = await db.collection('surveyResults').get();
        const surveyResults = surveySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        return NextResponse.json({ surveyResults });

      case 'quizResults':
        const quizSnapshot = await db.collection('quizResults').get();
        const quizResults = quizSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        return NextResponse.json({ quizResults });

      case 'users':
        // List all users (including anonymous)
        const listUsersResult = await adminAuth.listUsers();
        const users = listUsersResult.users.map(user => ({
          uid: user.uid,
          email: user.email,
          isAnonymous: user.providerData.length === 0,
          createdAt: user.metadata.creationTime,
          lastSignInAt: user.metadata.lastSignInTime,
        }));
        return NextResponse.json({ users });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// Delete application or user data
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    if (!(await verifyAdminToken(request))) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID parameters are required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'application':
        await db.collection('applications').doc(id).delete();
        return NextResponse.json({ success: true, message: 'Application deleted' });

      case 'surveyResult':
        await db.collection('surveyResults').doc(id).delete();
        return NextResponse.json({ success: true, message: 'Survey result deleted' });

      case 'quizResult':
        await db.collection('quizResults').doc(id).delete();
        return NextResponse.json({ success: true, message: 'Quiz result deleted' });

      case 'user':
        await adminAuth.deleteUser(id);
        return NextResponse.json({ success: true, message: 'User deleted' });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}
