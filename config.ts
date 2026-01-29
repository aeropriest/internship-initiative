// Environment variables for API routes
// Using NEXT_PUBLIC_ prefix as configured in .env.local

export const MANATAL_API_TOKEN = process.env.NEXT_PUBLIC_MANATAL_API_TOKEN || '51ce36b3ac06f113f418f0e0f47391e7471090c7';
export const HIREFLIX_API_KEY = process.env.NEXT_PUBLIC_HIREFLIX_API_KEY || 'dde0fc60-bd68-4166-853e-4c852faa94db';
export const RESEND_API_KEY = process.env.NEXT_PUBLIC_RESEND_API_KEY || 're_6BZ9WZWD_2S6nGim2jE5mYooj8GyuT59Y';

// This is a placeholder for a position you must create in your Hireflix account.
// Replace 'your-position-id' with the actual ID from Hireflix.
export const HIREFLIX_POSITION_ID = process.env.NEXT_PUBLIC_HIREFLIX_POSITION_ID || 'global-internship-initiative-2025';

// The 'from' email address for Resend. This must be a domain you have verified with Resend.
export const RESEND_FROM_EMAIL = process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL || 'Global Internship Initiative <ashok@axarsoft.com>';

// Admin credentials for dashboard access
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'GlobalTalentSolutions';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '18hanDicap08';

// Firebase Admin configuration
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'golfinternship';
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@golfinternship.iam.gserviceaccount.com';
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
export const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'golfinternship.firebasestorage.app';
