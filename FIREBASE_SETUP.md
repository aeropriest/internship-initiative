# Firebase Storage Setup Guide

## Problem
The production environment is showing Firebase Storage permission errors:
```
FirebaseError: Firebase Storage: User does not have permission to access 'resumes/136306148_1769480017425.pdf'. (storage/unauthorized)
```

## Solution Implemented
We've implemented a **hybrid authentication approach**:
1. **Anonymous authentication** for users (no login required)
2. **Admin authentication** for accessing all user data
3. **Server-side upload** using Firebase Admin SDK for security

## Setup Instructions

### 1. Install Dependencies
```bash
pnpm install firebase-admin
```

### 2. Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file

### 3. Add Environment Variables

Add these to your `.env.local` file (or production environment variables):

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Admin Authentication
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-admin-password
```

**Important**: 
- The private key should include the `\n` characters exactly as shown in the JSON file
- Use a strong password for admin access

### 4. Enable Anonymous Authentication in Firebase Console

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Anonymous" authentication
3. Save the settings

### 5. Deploy Storage Rules

Deploy the updated security rules that allow anonymous uploads:

```bash
firebase deploy --only storage
```

The rules in `storage.rules` now:
- Allow authenticated users (including anonymous) to upload resumes
- Allow public read access for downloads
- Reserve admin-only areas for sensitive data

### 6. Test the Authentication

**For Users (Anonymous):**
- Users are automatically signed in anonymously when they upload files
- No login required from the user perspective
- Their data is stored and can be accessed by admins

**For Admins:**
```javascript
// Admin login
const response = await fetch('/api/admin/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@yourdomain.com',
    password: 'your-secure-admin-password'
  })
});

const { token } = await response.json();

// Access all user data
const data = await fetch('/api/admin/data?type=applications', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## How It Works

### User Flow (Anonymous)
1. User fills out application form
2. Firebase automatically signs them in anonymously
3. Upload works because anonymous users are authenticated
4. Data is stored with their anonymous UID

### Admin Flow
1. Admin logs in with credentials
2. Receives custom Firebase token with admin claims
3. Can access all user data via admin APIs
4. Can view applications, surveys, and manage users

### Security Features
- **Anonymous users**: Can only upload their own data
- **Admin users**: Can access all data with proper authentication
- **Server-side uploads**: Files uploaded via secure backend
- **Public downloads**: Resume files are publicly accessible for viewing

## API Endpoints

### Admin Authentication
- `POST /api/admin/auth` - Login with admin credentials
- Returns custom token for admin access

### Admin Data Access
- `GET /api/admin/data?type=applications` - Get all applications
- `GET /api/admin/data?type=surveyResults` - Get all survey results
- `GET /api/admin/data?type=quizResults` - Get all quiz results
- `GET /api/admin/data?type=users` - Get all users (including anonymous)
- `DELETE /api/admin/data?type=application&id={id}` - Delete specific data

### File Upload
- `POST /api/firebase/upload-resume` - Upload resume (server-side)

## Troubleshooting

If you encounter issues:

1. **Check environment variables** are correctly set
2. **Verify anonymous authentication** is enabled in Firebase Console
3. **Check storage rules** are deployed correctly
4. **Ensure service account** has proper permissions
5. **Check browser console** for detailed error messages

## Benefits of This Approach

1. **No User Login Required**: Seamless experience for applicants
2. **Admin Access**: Complete data access for administrators
3. **Secure**: Server-side uploads with proper authentication
4. **Scalable**: Works for any number of anonymous users
5. **Compliant**: Data is properly secured and managed
