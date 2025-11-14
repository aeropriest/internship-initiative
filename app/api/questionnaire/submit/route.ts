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
            // Extraversion (1-6)
            'Q1 - Meeting New People',
            'Q2 - Leading Groups',
            'Q3 - Social Energy',
            'Q4 - Sharing Ideas',
            'Q5 - Starting Conversations',
            'Q6 - Social Environment',
            // Agreeableness (7-12)
            'Q7 - Perspective Taking',
            'Q8 - Forgiveness',
            'Q9 - Problem Solving',
            'Q10 - Harmony vs Competition',
            'Q11 - Compassion',
            'Q12 - Team Cooperation',
            // Conscientiousness (13-18)
            'Q13 - Task Planning',
            'Q14 - Goal Setting',
            'Q15 - Order and Routine',
            'Q16 - Promise Keeping',
            'Q17 - Attention to Detail',
            'Q18 - Task Completion',
            // Openness (19-24)
            'Q19 - Exploring Ideas',
            'Q20 - Adaptability',
            'Q21 - Curiosity',
            'Q22 - Learning',
            'Q23 - Problem Approaches',
            'Q24 - Diverse Perspectives',
            // Emotional Stability (25-30)
            'Q25 - Calm Under Pressure',
            'Q26 - Handling Challenges',
            'Q27 - Recovery from Setbacks',
            'Q28 - Positivity in Stress',
            'Q29 - Emotional Control',
            'Q30 - Anxiety Management'
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
        // Extraversion (1-6)
        'Q1 - Meeting New People',
        'Q2 - Leading Groups',
        'Q3 - Social Energy',
        'Q4 - Sharing Ideas',
        'Q5 - Starting Conversations',
        'Q6 - Social Environment',
        // Agreeableness (7-12)
        'Q7 - Perspective Taking',
        'Q8 - Forgiveness',
        'Q9 - Problem Solving',
        'Q10 - Harmony vs Competition',
        'Q11 - Compassion',
        'Q12 - Team Cooperation',
        // Conscientiousness (13-18)
        'Q13 - Task Planning',
        'Q14 - Goal Setting',
        'Q15 - Order and Routine',
        'Q16 - Promise Keeping',
        'Q17 - Attention to Detail',
        'Q18 - Task Completion',
        // Openness (19-24)
        'Q19 - Exploring Ideas',
        'Q20 - Adaptability',
        'Q21 - Curiosity',
        'Q22 - Learning',
        'Q23 - Problem Approaches',
        'Q24 - Diverse Perspectives',
        // Emotional Stability (25-30)
        'Q25 - Calm Under Pressure',
        'Q26 - Handling Challenges',
        'Q27 - Recovery from Setbacks',
        'Q28 - Positivity in Stress',
        'Q29 - Emotional Control',
        'Q30 - Anxiety Management'
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
          
          // Format trait scores according to Manatal's expected format
          // Make sure to use the exact field names we confirmed are working
          customFields['personality_openness'] = submission.traitScores.openness.toFixed(2);
          customFields['personality_extraversion'] = submission.traitScores.extraversion.toFixed(2);
          customFields['personality_agreeableness'] = submission.traitScores.agreeableness.toFixed(2);
          customFields['personality_conscientiousness'] = submission.traitScores.conscientiousness.toFixed(2);
          customFields['personality_emotionalstability'] = submission.traitScores.emotionalStability.toFixed(2);
          
          // Add quiz completion status
          customFields['quiz_completed'] = true;
          customFields['application_flow'] = 'Questionnaire Completed';
          customFields['application_source'] = 'Website';
          
          console.log('Updating Manatal with custom fields:', JSON.stringify(customFields, null, 2));
          
          // Update Manatal candidate
          const response = await fetch(`https://api.manatal.com/open/v3/candidates/${submission.candidateId}/`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Token ${MANATAL_API_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              custom_fields: customFields
            }),
          });
          
          if (response.ok) {
            const responseData = await response.json();
            console.log('✅ Manatal candidate updated with quiz results');
            console.log('Manatal response:', JSON.stringify(responseData, null, 2));
            
            // Verify the custom fields were properly set
            if (responseData.custom_fields) {
              console.log('Verified custom fields in response:', JSON.stringify(responseData.custom_fields, null, 2));
              
              // Check if all fields were properly set
              const allFieldsSet = [
                'personality_openness',
                'personality_extraversion',
                'personality_agreeableness',
                'personality_conscientiousness',
                'personality_emotionalstability',
                'quiz_completed'
              ].every(field => responseData.custom_fields[field] !== undefined);
              
              if (allFieldsSet) {
                console.log('✅ All custom fields were successfully set in Manatal');
              } else {
                console.warn('⚠️ Some custom fields may not have been set properly in Manatal');
              }
            } else {
              console.warn('⚠️ No custom_fields found in Manatal response');
            }
          } else {
            console.error('❌ Failed to update Manatal:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
          }
        } catch (manatalError) {
          console.error('❌ Error updating Manatal:', manatalError);
          // Continue even if Manatal update fails
        }
      }

      // Return success response with detailed information
      return NextResponse.json({ 
        success: true,
        message: 'Questionnaire submitted successfully',
        status: 'Quiz Completed',
        candidateId: submission.candidateId,
        updatedFields: {
          personality_scores: {
            openness: submission.traitScores.openness.toFixed(2),
            extraversion: submission.traitScores.extraversion.toFixed(2),
            agreeableness: submission.traitScores.agreeableness.toFixed(2),
            conscientiousness: submission.traitScores.conscientiousness.toFixed(2),
            emotionalStability: submission.traitScores.emotionalStability.toFixed(2)
          },
          quiz_completed: true,
          application_flow: 'Questionnaire Completed'
        },
        next_steps: 'Your application is now complete and will be reviewed by our team.'
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
