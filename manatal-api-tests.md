# Manatal API Integration Tests

This document contains the API tests performed for the integration between our application and Manatal's API.

## Test Environment

- **Date**: October 29, 2025
- **API Token**: 51ce36b3ac06f113f418f0e0f47391e7471090c7
- **Test Candidate ID**: 127835665

## API Calls and Results

### 1. Create Candidate

**Endpoint**: `POST https://api.manatal.com/open/v3/candidates/`

**Request**:
```json
{
  "full_name": "AA Test Support Request 1761744160946",
  "email": "aa.test.support.1761744160946@example.com",
  "phone_number": "+1234567890",
  "candidate_location": "Hong Kong",
  "description": "This is a test candidate created for Manatal support request",
  "current_position": "Internship Applicant",
  "notes": "This candidate has completed our personality questionnaire with the following scores:\n- Extraversion: 4.0/5\n- Conscientiousness: 4.5/5\n- Agreeableness: 4.5/5\n- Openness: 4.5/5\n- Emotional Stability: 3.5/5",
  "custom_fields": {
    "application_flow": "API Test",
    "position_applied": "Golf Internship",
    "application_source": "Website",
    "application_notes": "Created for testing the questionnaire integration with Manatal support",
    "personality_extraversion": "4.00",
    "personality_conscientiousness": "4.50",
    "personality_agreeableness": "4.50",
    "personality_openness": "4.50",
    "personality_emotionalstability": "3.50",
    "quiz_completed": true,
    "quiz_completed_at": "2025-10-29T13:22:40.946Z"
  }
}
```

**Response**: 201 Created
```json
{
  "id": 127835665,
  "external_id": null,
  "full_name": "AA Test Support Request 1761744160946",
  "creator": 853608,
  "owner": null,
  "source_type": "sourced",
  "source_other": null,
  "consent": null,
  "consent_date": null,
  "picture": null,
  "email": "aa.test.support.1761744160946@example.com",
  "phone_number": "+1234567890",
  "gender": null,
  "birth_date": null,
  "address": "",
  "zipcode": "",
  "candidate_location": "",
  "current_position": "Internship Applicant",
  "description": "This is a test candidate created for Manatal support request",
  "candidate_tags": [],
  "candidate_industries": [],
  "hash": "367VY4XYW",
  "custom_fields": {
    "quiz_completed": true,
    "application_flow": "API Test",
    "position_applied": "Golf Internship",
    "application_notes": "Created for testing the questionnaire integration with Manatal support",
    "quiz_completed_at": "2025-10-29T13:22:40.946Z",
    "application_source": "Website",
    "personality_openness": "4.50",
    "personality_extraversion": "4.00",
    "personality_agreeableness": "4.50",
    "personality_conscientiousness": "4.50",
    "personality_emotionalstability": "3.50"
  },
  "created_at": "2025-10-29T13:22:41.864458Z",
  "updated_at": "2025-10-29T13:22:43.471147Z"
}
```

### 2. Upload Resume

**Endpoint**: `POST https://api.manatal.com/open/v3/candidates/127835665/resume/`

**Request**: Form data with resume file (sample-resume.jpg)

**Response**: 201 Created
```json
{
  "id": 109136007,
  "resume_file": "",
  "created_at": "2025-10-29T13:22:42.655225Z"
}
```

### 3. Update Candidate with Notes

**Endpoint**: `PATCH https://api.manatal.com/open/v3/candidates/127835665/`

**Request**:
```json
{
  "notes": "Updated notes for candidate 127835665:\n\nThis candidate has completed our personality questionnaire with excellent results. The candidate shows strong traits in conscientiousness (4.5/5) and openness (4.5/5), which align well with our company values.\n\nRecommended for further consideration."
}
```

**Response**: 200 OK

### 4. Get Candidate Notes

**Endpoint**: `GET https://api.manatal.com/open/v3/candidates/127835665/notes/`

**Response**: 200 OK
```json
[]
```

### 5. Get Candidate Resume

**Endpoint**: `GET https://api.manatal.com/open/v3/candidates/127835665/resume/`

**Response**: 200 OK
```json
{
  "id": 109136007,
  "resume_file": "",
  "created_at": "2025-10-29T13:22:42.655225Z"
}
```

### 6. Get Candidate Attachments

**Endpoint**: `GET https://api.manatal.com/open/v3/candidates/127835665/attachments/`

**Response**: 200 OK
```json
[]
```

## Test Scripts

### Create Candidate Script

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';

// Generate unique identifier for test candidate
const timestamp = Date.now();
const testCandidate = {
  full_name: `AA Test Support Request ${timestamp}`,
  email: `aa.test.support.${timestamp}@example.com`,
  phone_number: '+1234567890',
  candidate_location: 'Hong Kong',
  description: 'This is a test candidate created for Manatal support request',
  current_position: 'Internship Applicant',
  notes: 'This candidate has completed our personality questionnaire with the following scores:\n- Extraversion: 4.0/5\n- Conscientiousness: 4.5/5\n- Agreeableness: 4.5/5\n- Openness: 4.5/5\n- Emotional Stability: 3.5/5',
  custom_fields: {
    application_flow: 'API Test',
    position_applied: 'Golf Internship',
    application_source: 'Website',
    application_notes: 'Created for testing the questionnaire integration with Manatal support',
    personality_extraversion: '4.00',
    personality_conscientiousness: '4.50',
    personality_agreeableness: '4.50',
    personality_openness: '4.50',
    personality_emotionalstability: '3.50',
    quiz_completed: true,
    quiz_completed_at: new Date().toISOString()
  }
};

// Function to make API request
function makeRequest(method, path, data = null) {
  // Implementation details...
}

// Function to upload resume
async function uploadResume(candidateId, resumePath) {
  // Implementation details...
}

// Main function to run the test
async function runTest() {
  try {
    // Create candidate
    const createResponse = await makeRequest('POST', '/candidates/', testCandidate);
    const candidateId = createResponse.data.id;
    
    // Upload resume
    const resumePath = path.resolve(process.env.HOME, 'Downloads/sample-resume.jpg');
    await uploadResume(candidateId, resumePath);
    
    // Add additional data
    const additionalData = {
      notes: `Updated notes for candidate ${candidateId}:\n\nThis candidate has completed our personality questionnaire with excellent results.`
    };
    await makeRequest('PATCH', `/candidates/${candidateId}/`, additionalData);
    
    // Verify the data
    const verifyResponse = await makeRequest('GET', `/candidates/${candidateId}/`);
    console.log(JSON.stringify(verifyResponse.data, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
```

### Read Candidate Data Script

```javascript
const https = require('https');

// Manatal API configuration
const API_TOKEN = '51ce36b3ac06f113f418f0e0f47391e7471090c7';
const BASE_URL = 'api.manatal.com';
const CANDIDATE_ID = '127835665';

// Function to make API request
function makeRequest(method, path) {
  // Implementation details...
}

// Main function to read candidate data
async function readCandidateData() {
  try {
    // Get candidate details
    const candidateResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/`);
    console.log(JSON.stringify(candidateResponse.data, null, 2));
    
    // Get candidate notes
    const notesResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/notes/`);
    console.log(JSON.stringify(notesResponse.data, null, 2));
    
    // Get candidate resume
    const resumeResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/resume/`);
    console.log(JSON.stringify(resumeResponse.data, null, 2));
    
    // Get candidate attachments
    const attachmentsResponse = await makeRequest('GET', `/candidates/${CANDIDATE_ID}/attachments/`);
    console.log(JSON.stringify(attachmentsResponse.data, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the function
readCandidateData();
```
