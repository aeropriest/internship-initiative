import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, DocumentData, Timestamp, Firestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword, Auth, UserCredential } from 'firebase/auth';

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
let db: Firestore | undefined;
let analytics: Analytics | undefined;
let storage: FirebaseStorage | undefined;
let auth: Auth | undefined;

// Initialize Firebase
if (!app && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
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
  timestamp: Date | Timestamp;
}

export interface ApplicationData {
  id?: string;
  name: string;
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
  candidateId?: string | number;
  manatalUrl?: string;
  hireflixUrl?: string;
  status?: string;
  timestamp: Date | Timestamp;
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
  
  // File storage methods
  static async uploadResume(file: File, candidateId: string): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }
    
    try {
      // Create a storage reference
      const fileExtension = file.name.split('.').pop();
      const fileName = `resumes/${candidateId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('Resume uploaded successfully, URL:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }
  
  // Application methods
  static async saveApplication(application: ApplicationData): Promise<string> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      // Add timestamp if not provided
      if (!application.timestamp) {
        application.timestamp = Timestamp.now();
      }
      
      // Remove the actual file object before saving to Firestore
      const { resumeFile, ...applicationData } = application;
      
      const docRef = await addDoc(collection(db, 'applications'), applicationData);
      console.log('Application saved to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving application to Firestore:', error);
      throw error;
    }
  }
  
  static async getApplications(): Promise<ApplicationData[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const querySnapshot = await getDocs(collection(db, 'applications'));
      const applications: ApplicationData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as ApplicationData;
        data.id = doc.id;
        
        // Convert Firestore timestamp to Date if needed
        if (data.timestamp && typeof data.timestamp !== 'string') {
          data.timestamp = (data.timestamp as any).toDate();
        }
        
        applications.push(data);
      });
      
      return applications;
    } catch (error) {
      console.error('Error getting applications from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationById(id: string): Promise<ApplicationData | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const docRef = doc(db, 'applications', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data() as ApplicationData;
      data.id = docSnap.id;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting application by ID from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationByEmail(email: string): Promise<ApplicationData | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const q = query(collection(db, 'applications'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as ApplicationData;
      data.id = doc.id;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting application by email from Firestore:', error);
      throw error;
    }
  }
  
  static async getApplicationByCandidateId(candidateId: string | number): Promise<ApplicationData | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const q = query(collection(db, 'applications'), where('candidateId', '==', candidateId.toString()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as ApplicationData;
      data.id = doc.id;
      
      // Convert Firestore timestamp to Date if needed
      if (data.timestamp && typeof data.timestamp !== 'string') {
        data.timestamp = (data.timestamp as any).toDate();
      }
      
      return data;
    } catch (error) {
      console.error('Error getting application by candidate ID from Firestore:', error);
      throw error;
    }
  }
  
  static async updateApplication(id: string, updates: Partial<ApplicationData>): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      // Remove the actual file object before updating Firestore
      const { resumeFile, ...updatesData } = updates;
      
      const docRef = doc(db, 'applications', id);
      await updateDoc(docRef, updatesData);
      console.log('Application updated successfully');
    } catch (error) {
      console.error('Error updating application in Firestore:', error);
      throw error;
    }
  }
  
  static async deleteApplication(id: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const docRef = doc(db, 'applications', id);
      await deleteDoc(docRef);
      console.log('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application from Firestore:', error);
      throw error;
    }
  }
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

export { db, storage, auth };
