import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
    console.log('Firebase Admin SDK initialized successfully for applications API');
    return db;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

// GET - Retrieve applications
export async function GET(request: NextRequest) {
  try {
    const database = getDb();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const candidateId = searchParams.get('candidateId');

    if (email) {
      // Get application by email
      const q = database.collection('applications').where('email', '==', email);
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
      const q = database.collection('applications').where('candidateId', '==', candidateId);
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
      const querySnapshot = await database.collection('applications').get();
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
    const database = getDb();
    const applicationData = await request.json();
    
    console.log('📝 Saving application to Firestore:', {
      email: applicationData.email,
      name: applicationData.name,
      candidateId: applicationData.candidateId
    });
    
    // Add timestamp if not provided
    if (!applicationData.timestamp) {
      applicationData.timestamp = new Date();
    }
    
    // Remove any file objects before saving
    const { resumeFile, ...dataToSave } = applicationData;
    
    const docRef = await database.collection('applications').add(dataToSave);
    console.log('✅ Application saved to Firestore with ID:', docRef.id);
    
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
    const database = getDb();
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    // Remove any file objects before updating
    const { resumeFile, ...dataToUpdate } = updateData;
    
    const docRef = database.collection('applications').doc(id);
    
    // Check if document exists
    const docSnapshot = await docRef.get();
    
    if (!docSnapshot.exists) {
      // Create the document if it doesn't exist
      await docRef.set({
        ...dataToUpdate,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Application created (was missing):', id);
    } else {
      // Update the existing document
      await docRef.update({
        ...dataToUpdate,
        updatedAt: new Date()
      });
      console.log('Application updated successfully:', id);
    }
    
    return NextResponse.json({
      success: true,
      message: docSnapshot.exists ? 'Application updated successfully' : 'Application created successfully'
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
