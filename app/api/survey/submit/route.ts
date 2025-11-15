import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '../../../../services/firebase';
import { Timestamp } from 'firebase/firestore';

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
    
    // Save the survey data to Firebase
    try {
      // First, check if we have an application for this candidate
      let application = null;
      
      if (submission.email) {
        application = await FirebaseService.getApplicationByEmail(submission.email);
      }
      
      if (!application && submission.candidateId) {
        application = await FirebaseService.getApplicationByCandidateId(submission.candidateId);
      }
      
      // Prepare survey data
      const surveyData = {
        candidateId: submission.candidateId,
        name: submission.name,
        email: submission.email,
        position: submission.position,
        answers: submission.answers,
        traitScores: submission.traitScores,
        timestamp: Timestamp.now(),
        applicationId: application?.id || null
      };
      
      // Save survey to Firestore
      const surveyId = await FirebaseService.saveSurveyResult(surveyData);
      
      // If we found an application, update it with the survey completion info
      if (application && application.id) {
        await FirebaseService.updateApplication(application.id, {
          surveyCompleted: true,
          surveyId: surveyId,
          surveyCompletedAt: Timestamp.now(),
          status: 'Survey Completed' // This field exists in the ApplicationData interface
        });
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
