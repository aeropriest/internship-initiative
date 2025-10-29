# Google Sheets Integration Setup

This document explains how to set up the Google Sheets integration for the personality questionnaire feature.

## Overview

The personality questionnaire feature saves responses to a Google Spreadsheet. This allows for easy data collection and analysis of candidate personality traits.

## Setup Instructions

### 1. Create a Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Rename it to something meaningful like "Internship Initiative - Questionnaire Responses"
3. Note the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 2. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API for your project:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 3. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details and click "Create"
4. Skip granting this service account access to the project
5. Click "Done"

### 4. Create and Download Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" as the key type and click "Create"
5. The key file will be downloaded to your computer

### 5. Share the Spreadsheet with the Service Account

1. Open your Google Spreadsheet
2. Click the "Share" button
3. Enter the service account email address (found in the JSON key file)
4. Set permission to "Editor"
5. Uncheck "Notify people"
6. Click "Share"

### 6. Configure Environment Variables

Add the following to your `.env.local` file:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key content here\n-----END PRIVATE KEY-----\n"
```

Note: The private key should be enclosed in quotes and all newlines should be represented as `\n`.

### 7. Update Spreadsheet ID in the Code

The spreadsheet ID is configured in the API route file:
`/app/api/questionnaire/submit/route.ts`

Update the `SPREADSHEET_ID` constant to match your spreadsheet's ID.

## Spreadsheet Structure

The questionnaire responses will be saved with the following columns:

- Timestamp
- Name
- Email
- Manatal URL
- Hireflix Video Interview URL
- Extraversion Score
- Conscientiousness Score
- Agreeableness Score
- Openness Score
- Emotional Stability Score
- Individual question responses (Q1-Q10)

## Testing the Integration

1. Run the development server: `pnpm dev`
2. Navigate to `/test-questionnaire` to submit test data
3. Check your Google Spreadsheet to verify the data was saved correctly

## Troubleshooting

- **Permission Denied**: Make sure the spreadsheet is shared with the service account email
- **Invalid Credentials**: Verify that the environment variables are set correctly
- **API Not Enabled**: Ensure the Google Sheets API is enabled for your project
- **Spreadsheet ID Mismatch**: Double-check that the spreadsheet ID in the code matches your actual spreadsheet ID
