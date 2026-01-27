// Client-side Firebase service for browser use
// This service makes HTTP calls to server-side APIs

export interface ApplicationData {
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  position?: string;
  positionId?: string;
  resumeUrl?: string;
  resumeFile?: File;
  passportCountry?: string;
  golfHandicap?: string;
  message?: string;
  status?: string;
  candidateId?: string | number;
  manatalCandidateId?: string | number;
  hireflixInterviewId?: string;
  hireflixInterviewUrl?: string;
  hireflixInterviewStatus?: string;
  surveyCompleted?: boolean;
  surveyId?: string;
  surveyCompletedAt?: Date;
  timestamp?: Date;
  quizCompleted?: boolean;
  interviewCompleted?: boolean;
}

export interface SurveyResult {
  id?: string;
  candidateId?: string;
  name?: string;
  email: string;
  position?: string;
  answers: Record<string, Record<number, number>>;
  traitScores: Record<string, number>;
  timestamp?: Date;
  applicationId?: string | null;
}

export class FirebaseClientService {
  // Application methods
  static async saveApplication(application: ApplicationData): Promise<string> {
    try {
      // Add timestamp if not provided
      if (!application.timestamp) {
        application.timestamp = new Date();
      }
      
      // Save via server-side API
      const response = await fetch('/api/firebase/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save application');
      }
      
      const result = await response.json();
      console.log('Application saved via server-side API with ID:', result.id);
      return result.id;
    } catch (error) {
      console.error('Error saving application to Firestore:', error);
      throw error;
    }
  }
  
  static async getApplications(): Promise<ApplicationData[]> {
    try {
      // Get via server-side API
      const response = await fetch('/api/firebase/applications');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get applications');
      }
      
      const result = await response.json();
      return result.applications || [];
    } catch (error) {
      console.error('Error getting applications from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationByEmail(email: string): Promise<ApplicationData | null> {
    try {
      // Get via server-side API
      const response = await fetch(`/api/firebase/applications?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get application by email');
      }
      
      const result = await response.json();
      return result.exists ? result.application : null;
    } catch (error) {
      console.error('Error getting application by email from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationByCandidateId(candidateId: string | number): Promise<ApplicationData | null> {
    try {
      // Get via server-side API
      const response = await fetch(`/api/firebase/applications?candidateId=${encodeURIComponent(candidateId.toString())}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get application by candidate ID');
      }
      
      const result = await response.json();
      return result.exists ? result.application : null;
    } catch (error) {
      console.error('Error getting application by candidate ID from Firestore:', error);
      throw error;
    }
  }
  
  static async updateApplication(id: string, updates: Partial<ApplicationData>): Promise<void> {
    try {
      // Remove the actual file object before updating
      const { resumeFile, ...updatesData } = updates;
      
      // Update via server-side API
      const response = await fetch('/api/firebase/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updatesData }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update application');
      }
      
      console.log('Application updated via server-side API');
    } catch (error) {
      console.error('Error updating application in Firestore:', error);
      throw error;
    }
  }
  
  static async saveSurveyResult(surveyResult: SurveyResult): Promise<string> {
    try {
      // Add timestamp if not provided
      if (!surveyResult.timestamp) {
        surveyResult.timestamp = new Date();
      }

      // Save via server-side API
      const response = await fetch('/api/firebase/survey-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyResult),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save survey result');
      }
      
      const result = await response.json();
      console.log('Survey result saved via server-side API with ID:', result.id);
      return result.id;
    } catch (error) {
      console.error('Error saving survey result to Firestore:', error);
      throw error;
    }
  }
}
