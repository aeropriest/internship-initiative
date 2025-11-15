# Testing Scripts

This directory contains scripts for testing the application functionality.

## Application Process Test Script

The `test-application-process.js` script automates the full application process:

1. Fills out and submits the application form
2. Completes the personality survey with predefined answers
3. Verifies the interview link

### Prerequisites

- Node.js installed
- Puppeteer package installed: `npm install puppeteer`
- The application running locally on port 3000
- Resume file at `~/Downloads/Arian_Gibson_CV.pdf` (or update the path in the script)

### Running the Test

```bash
# Install dependencies
npm install puppeteer

# Run the test script
node scripts/test-application-process.js
```

### Configuration

You can modify the test data in the `config` object at the top of the script:

- `baseUrl`: The URL of your application (default: http://localhost:3000)
- `resumePath`: Path to the resume file
- `applicationData`: Personal information for the application form
- `surveyAnswers`: Predefined answers for the personality survey (1-5 scale)

### Notes

- The script uses a unique email address (with timestamp) to avoid duplicate application errors
- The browser runs in non-headless mode by default so you can see the process
- The browser will remain open after the test completes for inspection

## Troubleshooting

### Common Issues

1. **Resume Upload Fails**
   - Check if the resume file exists at the specified path
   - Ensure the file is a valid PDF

2. **Position Selection Fails**
   - Make sure there are available positions in the database
   - Check the network tab for API errors

3. **Survey Submission Fails**
   - Check if all questions are being answered
   - Look for any validation errors in the console

### Debugging

- Set `headless: false` in the Puppeteer launch options (already default)
- Add `await page.waitForTimeout(5000)` at specific points to slow down the process
- Use `console.log(await page.content())` to see the current page HTML
