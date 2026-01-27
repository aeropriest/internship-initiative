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

// Define the structure of the survey submission
interface SurveySubmission {
  candidateId: string;
  name: string;
  email: string;
  position: string;
  answers: Record<string, Record<number, number>>;
  traitScores: Record<string, number>;
}

// Categories for the survey
const CATEGORIES = [
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'openness',
  'emotionalStability'
];

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const submission: SurveySubmission = await request.json();
    
    // Validate the submission
    if (!submission.email || !submission.answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Survey submission received:', {
      candidateId: submission.candidateId,
      name: submission.name,
      email: submission.email,
      position: submission.position,
      traitScores: submission.traitScores
    });
    
    // Save the survey data to Firebase using Admin SDK
    try {
      // First, check if we have an application for this candidate
      let application = null;
      
      if (submission.email) {
        const q = db.collection('applications').where('email', '==', submission.email);
        const querySnapshot = await q.get();
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          application = { id: doc.id, ...doc.data() };
        }
      }
      
      if (!application && submission.candidateId) {
        const q = db.collection('applications').where('candidateId', '==', submission.candidateId);
        const querySnapshot = await q.get();
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          application = { id: doc.id, ...doc.data() };
        }
      }
      
      // Prepare survey data
      const surveyData = {
        candidateId: submission.candidateId,
        name: submission.name,
        email: submission.email,
        position: submission.position,
        answers: submission.answers,
        traitScores: submission.traitScores,
        timestamp: new Date(),
        applicationId: application?.id || null
      };
      
      // Save survey to Firestore
      const docRef = await db.collection('surveyResults').add(surveyData);
      const surveyId = docRef.id;
      console.log('Survey result saved to Firestore with ID:', surveyId);
      
      // If we found an application, update it with the survey completion info
      if (application && application.id) {
        await db.collection('applications').doc(application.id).update({
          surveyCompleted: true,
          surveyId: surveyId,
          surveyCompletedAt: new Date(),
          status: 'Survey Completed'
        });
        console.log('Application updated with survey completion info');
      }
      
      // Return success response with the survey ID
      return NextResponse.json({ 
        success: true,
        surveyId: surveyId,
        message: 'Survey submitted successfully'
      });
    } catch (error) {
      console.error('Firebase error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to save survey to database', details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}
