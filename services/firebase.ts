import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, signInWithEmailAndPassword, Auth, UserCredential, signInAnonymously, User } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;
let auth: Auth | undefined;

// Function to initialize Firebase (for client-side use)
export function initializeFirebase() {
  if (!app && firebaseConfig.apiKey) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      
      // Initialize analytics only on client side
      if (typeof window !== 'undefined') {
        try {
          analytics = getAnalytics(app);
        } catch (error) {
          console.warn('Analytics not initialized:', error);
        }
      }
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }
}

// Initialize Firebase on import (for backward compatibility)
if (!app && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Initialize analytics only on client side
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.warn('Analytics not initialized:', error);
      }
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

export interface QuizResult {
  name: string;
  email: string;
  manatalUrl?: string;
  hireflixUrl?: string;
  candidateId?: string;
  answers: Record<number, number>;
  traitScores: Record<string, number>;
  timestamp: Date;
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

export class FirebaseService {
  // Authentication methods
  static async authenticateAdmin(email: string, password: string): Promise<UserCredential> {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  // Anonymous authentication for users
  static async authenticateAnonymously(): Promise<User> {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('Anonymous user authenticated:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Anonymous authentication error:', error);
      throw error;
    }
  }

  // Get current authenticated user
  static getCurrentUser(): User | null {
    if (!auth) {
      return null;
    }
    return auth.currentUser;
  }

  // Ensure user is authenticated (anonymous if not)
  static async ensureAuthenticated(): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      return currentUser;
    }
    return await this.authenticateAnonymously();
  }
  
  // File storage methods
  static async uploadResume(file: File, candidateId: string): Promise<string> {
    try {
      // Ensure user is authenticated (anonymously if needed)
      await this.ensureAuthenticated();
      
      console.log('Uploading resume to Firebase via server-side API...');
      
      // Create FormData for the API request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('candidateId', candidateId);
      
      // Try Firebase upload first
      try {
        const response = await fetch('/api/firebase/upload-resume', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Resume uploaded successfully via Firebase, URL:', result.downloadUrl);
          return result.downloadUrl;
        }
      } catch (firebaseError) {
        console.warn('Firebase upload failed, trying fallback:', firebaseError);
      }
      
      // Fallback to local upload
      console.log('Using fallback upload method...');
      const fallbackResponse = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!fallbackResponse.ok) {
        const errorData = await fallbackResponse.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }
      
      const result = await fallbackResponse.json();
      console.log('Resume uploaded successfully via fallback, URL:', result.downloadUrl);
      return result.downloadUrl;
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }
  
  // Application methods
  static async saveApplication(application: ApplicationData): Promise<string> {
    try {
      // This method should only be called from client-side
      // Server-side code should use the admin API directly
      throw new Error('saveApplication should only be called from client-side code');
    } catch (error) {
      console.error('Error saving application to Firestore:', error);
      throw error;
    }
  }
  
  static async getApplications(): Promise<ApplicationData[]> {
    try {
      // This method should only be called from client-side
      throw new Error('getApplications should only be called from client-side code');
    } catch (error) {
      console.error('Error getting applications from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationById(id: string): Promise<ApplicationData | null> {
    try {
      // This method should only be called from client-side
      throw new Error('getApplicationById should only be called from client-side code');
    } catch (error) {
      console.error('Error getting application by ID from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationByEmail(email: string): Promise<ApplicationData | null> {
    try {
      // This method should only be called from client-side
      throw new Error('getApplicationByEmail should only be called from client-side code');
    } catch (error) {
      console.error('Error getting application by email from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationByCandidateId(candidateId: string | number): Promise<ApplicationData | null> {
    try {
      // This method should only be called from client-side
      throw new Error('getApplicationByCandidateId should only be called from client-side code');
    } catch (error) {
      console.error('Error getting application by candidate ID from Firestore:', error);
      throw error;
    }
  }
  
  static async updateApplication(id: string, updates: Partial<ApplicationData>): Promise<void> {
    try {
      // This method should only be called from client-side
      throw new Error('updateApplication should only be called from client-side code');
    } catch (error) {
      console.error('Error updating application in Firestore:', error);
      throw error;
    }
  }
  
  static async deleteApplication(id: string): Promise<void> {
    try {
      // This method should only be called from client-side
      throw new Error('deleteApplication should only be called from client-side code');
    } catch (error) {
      console.error('Error deleting application from Firestore:', error);
      throw error;
    }
  }
  
  static async saveSurveyResult(surveyResult: SurveyResult): Promise<string> {
    try {
      // This method should only be called from client-side
      throw new Error('saveSurveyResult should only be called from client-side code');
    } catch (error) {
      console.error('Error saving survey result to Firestore:', error);
      throw error;
    }
  }

  // Quiz result methods - now using server-side APIs
  static async saveQuizResult(quizResult: QuizResult): Promise<string> {
    try {
      // Add timestamp if not provided
      if (!quizResult.timestamp) {
        quizResult.timestamp = new Date();
      }

      // For now, this method is not implemented with server-side API
      // You can create a similar API to survey-results if needed
      console.log('Quiz result saving not implemented with server-side API yet');
      throw new Error('Quiz result saving not implemented');
    } catch (error) {
      console.error('Error saving quiz result to Firestore:', error);
      throw error;
    }
  }

  static async getQuizResults(): Promise<QuizResult[]> {
    // For now, this method is not implemented with server-side API
    console.log('Quiz results retrieval not implemented with server-side API yet');
    throw new Error('Quiz results retrieval not implemented');
  }

  static async getQuizResultByEmail(email: string): Promise<QuizResult | null> {
    // For now, this method is not implemented with server-side API
    console.log('Quiz result retrieval not implemented with server-side API yet');
    throw new Error('Quiz result retrieval not implemented');
  }

  static async getQuizResultByCandidateId(candidateId: string): Promise<QuizResult | null> {
    // For now, this method is not implemented with server-side API
    console.log('Quiz result retrieval not implemented with server-side API yet');
    throw new Error('Quiz result retrieval not implemented');
  }

  // Alias for getApplications - for backward compatibility
  static async getCandidates(): Promise<ApplicationData[]> {
    return this.getApplications();
  }
}

// Alias for backward compatibility
export type CandidateData = ApplicationData;

export { auth };
