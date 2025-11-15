# Manatal API Testing Scripts

This directory contains scripts for testing the Manatal API integration.

## Available Test Scripts

### 1. `test-manatal-apis.js`

A comprehensive test that covers the entire application flow:

- Creates a new candidate in Manatal
- Uploads a resume for the candidate
- Submits questionnaire data with personality scores
- Fetches the candidate data to verify everything was saved correctly

### 2. `verify-manatal-custom-fields.js`

A focused test specifically for custom fields:

- Creates a candidate with initial custom field values
- Verifies the custom fields were saved correctly
- Updates the custom fields with new values
- Verifies the updates were applied correctly

## Prerequisites

- Node.js installed
- The application running locally on port 3000
- Resume file at `~/Downloads/Arian_Gibson_CV.pdf` (for the first script)
- Required npm packages (scripts will install these automatically):
  - node-fetch
  - form-data

## Running the Tests

```bash
# Run the comprehensive API test
node scripts/test-manatal-apis.js

# Run the custom fields verification test
node scripts/verify-manatal-custom-fields.js
```

## API Endpoints Used

These scripts test the following API endpoints:

1. **Create Candidate**
   - Endpoint: `/api/manatal/candidates`
   - Method: `POST`
   - Tests: Creating a new candidate with basic info

2. **Upload Resume**
   - Endpoint: `/api/manatal/resume`
   - Method: `POST`
   - Tests: Uploading a resume file for a candidate

3. **Submit Questionnaire**
   - Endpoint: `/api/survey/submit`
   - Method: `POST`
   - Tests: Submitting personality survey results

4. **Get Candidate**
   - Endpoint: `/api/applications/{id}`
   - Method: `GET`
   - Tests: Retrieving candidate data with custom fields

5. **Update Candidate**
   - Endpoint: `/api/applications/{id}`
   - Method: `PATCH`
   - Tests: Updating candidate custom fields

## Interpreting Test Results

The scripts provide detailed output for each step:

- ✅ indicates a successful test
- ❌ indicates a failed test
- ⚠️ indicates a warning or potential issue

For each custom field, the scripts compare the expected value with the actual value returned from the API. This helps identify any issues with data persistence or API integration.

## Troubleshooting

### Common Issues

1. **API Token Not Configured**
   - Check that the `MANATAL_API_TOKEN` environment variable is set
   - Verify the token is valid and has the necessary permissions

2. **Resume Upload Fails**
   - Check if the resume file exists at the specified path
   - Ensure the file is a valid PDF

3. **Custom Fields Not Saved**
   - Check the API response for any error messages
   - Verify the field names match exactly what Manatal expects
   - Ensure the values are in the correct format (string, number, boolean)

### Debug Mode

Add `DEBUG=true` before the command to enable more verbose logging:

```bash
DEBUG=true node scripts/test-manatal-apis.js
```
