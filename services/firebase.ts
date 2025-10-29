import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, DocumentData, Timestamp, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsSL0-6QBuBO4rAPcKt6VyYyegykIIWII",
  authDomain: "golf-internship.firebaseapp.com",
  projectId: "golf-internship",
  storageBucket: "golf-internship.firebasestorage.app",
  messagingSenderId: "672167525481",
  appId: "1:672167525481:web:933cde0a318c6daccef6f8",
  measurementId: "G-FQD4V5HER4"
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;

// Initialize Firebase only on client side
if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics not initialized:', error);
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
  timestamp: Date | Timestamp;
}

export class FirebaseService {
  static async saveQuizResult(quizResult: QuizResult): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Add timestamp if not provided
      if (!quizResult.timestamp) {
        quizResult.timestamp = Timestamp.now();
      }

      const docRef = await addDoc(collection(db, 'quizResults'), quizResult);
      console.log('Quiz result saved to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving quiz result to Firestore:', error);
      throw error;
    }
  }

  static async getQuizResults(): Promise<QuizResult[]> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const querySnapshot = await getDocs(collection(db, 'quizResults'));
      const results: QuizResult[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as QuizResult;
        // Convert Firestore timestamp to Date if needed
        if (data.timestamp && typeof data.timestamp !== 'string') {
          data.timestamp = (data.timestamp as any).toDate();
        }
        results.push(data);
      });
      
      return results;
    } catch (error) {
      console.error('Error getting quiz results from Firestore:', error);
      throw error;
    }
  }

  static async getQuizResultByEmail(email: string): Promise<QuizResult | null> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const q = query(collection(db, 'quizResults'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as QuizResult;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting quiz result by email from Firestore:', error);
      throw error;
    }
  }

  static async getQuizResultByCandidateId(candidateId: string): Promise<QuizResult | null> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const q = query(collection(db, 'quizResults'), where('candidateId', '==', candidateId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as QuizResult;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting quiz result by candidate ID from Firestore:', error);
      throw error;
    }
  }
}

export { db };
