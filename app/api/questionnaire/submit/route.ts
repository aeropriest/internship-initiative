import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { FirebaseService } from '../../../../services/firebase';
import { MANATAL_API_TOKEN } from '../../../../config';

// Define the structure of the questionnaire submission
interface QuestionnaireSubmission {
  name: string;
  email: string;
  manatalUrl: string;
  hireflixUrl: string;
  candidateId?: string;
  answers: Record<number, number>;
  traitScores: Record<string, number>;
}

// Google Sheets configuration
const SPREADSHEET_ID = '11FJAX2yUi4lFQQuFlZTmjobK5PCjn4HnJ6fzyTHfNN0';
const SHEET_NAME = 'Personality Questionnaire Responses';

// Trait categories for better readability in the spreadsheet
const TRAIT_DISPLAY_NAMES: Record<string, string> = {
  extraversion: 'Extraversion',
  conscientiousness: 'Conscientiousness',
  agreeableness: 'Agreeableness',
  openness: 'Openness',
  emotionalStability: 'Emotional Stability'
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const submission: QuestionnaireSubmission = await request.json();
    
    // Validate the submission
    if (!submission.name || !submission.email || !submission.answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract candidateId from query parameter if available
    const url = new URL(request.url);
    const candidateIdParam = url.searchParams.get('candidateId');
    if (candidateIdParam && !submission.candidateId) {
      submission.candidateId = candidateIdParam;
    }

    // Log the submission data
    console.log('Questionnaire submission received:', {
      name: submission.name,
      email: submission.email,
      manatalUrl: submission.manatalUrl || 'Not provided',
      hireflixUrl: submission.hireflixUrl || 'Not provided',
      candidateId: submission.candidateId || 'Not provided',
      traitScores: submission.traitScores
    });

    try {
      // Initialize auth with service account
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      // Initialize the spreadsheet
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
      await doc.loadInfo();
      
      // Get the sheet by name or create it if it doesn't exist
      let sheet = doc.sheetsByTitle[SHEET_NAME];
      
      if (!sheet) {
        // Create a new sheet with appropriate headers
        sheet = await doc.addSheet({
          title: SHEET_NAME,
          headerValues: [
            'Timestamp',
            'Name',
            'Email',
            'Manatal URL',
            'Hireflix Video Interview URL',
            'Extraversion Score',
            'Conscientiousness Score',
            'Agreeableness Score',
            'Openness Score',
            'Emotional Stability Score',
            'Q1 - Networking',
            'Q2 - Planning',
            'Q3 - Collaboration',
            'Q4 - Learning',
            'Q5 - Stress Management',
            'Q6 - Initiative',
            'Q7 - Feedback',
            'Q8 - Adaptability',
            'Q9 - Social Energy',
            'Q10 - Criticism Handling'
          ]
        });
      }
      
      // Prepare row data with proper typing
      const rowData: Record<string, string | number> = {
        'Timestamp': new Date().toISOString(),
        'Name': submission.name,
        'Email': submission.email,
        'Manatal URL': submission.manatalUrl || 'Not provided',
        'Hireflix Video Interview URL': submission.hireflixUrl || 'Not provided',
      };
      
      // Add trait scores
      Object.entries(submission.traitScores).forEach(([trait, score]) => {
        const displayName = TRAIT_DISPLAY_NAMES[trait] || trait;
        rowData[`${displayName} Score`] = score.toFixed(2);
      });
      
      // Add individual question answers
      const questionLabels = [
        'Q1 - Networking',
        'Q2 - Planning',
        'Q3 - Collaboration',
        'Q4 - Learning',
        'Q5 - Stress Management',
        'Q6 - Initiative',
        'Q7 - Feedback',
        'Q8 - Adaptability',
        'Q9 - Social Energy',
        'Q10 - Criticism Handling'
      ];
      
      Object.entries(submission.answers).forEach(([questionId, answer]) => {
        const index = parseInt(questionId) - 1;
        if (index >= 0 && index < questionLabels.length) {
          rowData[questionLabels[index]] = answer;
        }
      });
      
      // Add the row to the sheet
      await sheet.addRow(rowData);
      
      // Save to Firestore
      try {
        await FirebaseService.saveQuizResult({
          name: submission.name,
          email: submission.email,
          manatalUrl: submission.manatalUrl,
          hireflixUrl: submission.hireflixUrl,
          candidateId: submission.candidateId,
          answers: submission.answers,
          traitScores: submission.traitScores,
          timestamp: new Date()
        });
        console.log('✅ Quiz results saved to Firestore');
      } catch (firestoreError) {
        console.error('❌ Error saving to Firestore:', firestoreError);
        // Continue even if Firestore fails
      }

      // Update Manatal if candidateId is provided
      if (submission.candidateId && MANATAL_API_TOKEN) {
        try {
          // Prepare trait scores for Manatal custom fields
          const customFields: Record<string, any> = {};
          
          Object.entries(submission.traitScores).forEach(([trait, score]) => {
            const formattedTrait = trait.charAt(0).toUpperCase() + trait.slice(1);
            customFields[`personality_${trait.toLowerCase()}`] = score.toFixed(2);
          });
          
          // Add quiz completion status
          customFields['quiz_completed'] = true;
          customFields['quiz_completed_at'] = new Date().toISOString();
          
          // Update Manatal candidate
          const response = await fetch(`https://api.manatal.com/open/v3/candidates/${submission.candidateId}/`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Token ${MANATAL_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              custom_fields: customFields
            }),
          });
          
          if (response.ok) {
            console.log('✅ Manatal candidate updated with quiz results');
          } else {
            console.error('❌ Failed to update Manatal:', response.status, response.statusText);
          }
        } catch (manatalError) {
          console.error('❌ Error updating Manatal:', manatalError);
          // Continue even if Manatal update fails
        }
      }

      // Return success response
      return NextResponse.json({ 
        success: true,
        message: 'Questionnaire submitted successfully'
      });
      
    } catch (googleError: unknown) {
      console.error('Google Sheets API error:', googleError);
      
      // Try to save to Firestore even if Google Sheets fails
      try {
        await FirebaseService.saveQuizResult({
          name: submission.name,
          email: submission.email,
          manatalUrl: submission.manatalUrl,
          hireflixUrl: submission.hireflixUrl,
          candidateId: submission.candidateId,
          answers: submission.answers,
          traitScores: submission.traitScores,
          timestamp: new Date()
        });
        console.log('✅ Quiz results saved to Firestore (Google Sheets failed)');
      } catch (firestoreError) {
        console.error('❌ Error saving to Firestore:', firestoreError);
      }
      
      // For development/testing, return success even if Google Sheets fails
      // In production, you might want to handle this differently
      return NextResponse.json({ 
        success: true,
        message: 'Questionnaire recorded (Google Sheets integration pending)',
        error: process.env.NODE_ENV === 'development' ? 
          (googleError instanceof Error ? googleError.message : String(googleError)) : 
          undefined
      });
    }
    
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to submit questionnaire' },
      { status: 500 }
    );
  }
}
