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

// GET - Retrieve applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const candidateId = searchParams.get('candidateId');

    if (email) {
      // Get application by email
      const q = db.collection('applications').where('email', '==', email);
      const querySnapshot = await q.get();
      
      if (querySnapshot.empty) {
        return NextResponse.json({ exists: false, application: null });
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      data.id = doc.id;
      
      return NextResponse.json({ exists: true, application: data });
    } else if (candidateId) {
      // Get application by candidate ID
      const q = db.collection('applications').where('candidateId', '==', candidateId);
      const querySnapshot = await q.get();
      
      if (querySnapshot.empty) {
        return NextResponse.json({ exists: false, application: null });
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      data.id = doc.id;
      
      return NextResponse.json({ exists: true, application: data });
    } else {
      // Get all applications
      const querySnapshot = await db.collection('applications').get();
      const applications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return NextResponse.json({ applications });
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Create new application
export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json();
    
    // Add timestamp if not provided
    if (!applicationData.timestamp) {
      applicationData.timestamp = new Date();
    }
    
    // Remove any file objects before saving
    const { resumeFile, ...dataToSave } = applicationData;
    
    const docRef = await db.collection('applications').add(dataToSave);
    console.log('Application saved to Firestore with ID:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Application saved successfully'
    });
  } catch (error) {
    console.error('Error saving application:', error);
    return NextResponse.json(
      { error: 'Failed to save application' },
      { status: 500 }
    );
  }
}

// PUT - Update application
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    // Remove any file objects before updating
    const { resumeFile, ...dataToUpdate } = updateData;
    
    await db.collection('applications').doc(id).update(dataToUpdate);
    console.log('Application updated successfully:', id);
    
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
