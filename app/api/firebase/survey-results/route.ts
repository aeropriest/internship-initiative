import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

// GET - Retrieve survey results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const candidateId = searchParams.get('candidateId');

    if (email) {
      // Get survey result by email
      const q = db.collection('surveyResults').where('email', '==', email);
      const querySnapshot = await q.get();
      
      if (querySnapshot.empty) {
        return NextResponse.json({ exists: false, result: null });
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      data.id = doc.id;
      
      return NextResponse.json({ exists: true, result: data });
    } else if (candidateId) {
      // Get survey result by candidate ID
      const q = db.collection('surveyResults').where('candidateId', '==', candidateId);
      const querySnapshot = await q.get();
      
      if (querySnapshot.empty) {
        return NextResponse.json({ exists: false, result: null });
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      data.id = doc.id;
      
      return NextResponse.json({ exists: true, result: data });
    } else {
      // Get all survey results
      const querySnapshot = await db.collection('surveyResults').get();
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return NextResponse.json({ results });
    }
  } catch (error) {
    console.error('Error fetching survey results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey results' },
      { status: 500 }
    );
  }
}

// POST - Create new survey result
export async function POST(request: NextRequest) {
  try {
    const surveyData = await request.json();
    
    // Add timestamp if not provided
    if (!surveyData.timestamp) {
      surveyData.timestamp = new Date();
    }
    
    const docRef = await db.collection('surveyResults').add(surveyData);
    console.log('Survey result saved to Firestore with ID:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Survey result saved successfully'
    });
  } catch (error) {
    console.error('Error saving survey result:', error);
    return NextResponse.json(
      { error: 'Failed to save survey result' },
      { status: 500 }
    );
  }
}
