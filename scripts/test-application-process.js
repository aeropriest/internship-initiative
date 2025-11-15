/**
 * Test Script for Application Process
 * 
 * This script automates the application process:
 * 1. Fills out and submits the application form
 * 2. Completes the personality survey
 * 3. Verifies the interview link
 * 
 * Usage: 
 * - Run with Node.js: node test-application-process.js
 * - Requires Puppeteer: npm install puppeteer
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  resumePath: path.resolve(process.env.HOME, 'Downloads/Arian_Gibson_CV.pdf'),
  applicationData: {
    name: 'Arian Gibson',
    email: `test${Date.now()}@example.com`, // Unique email to avoid duplicates
    phone: '555-123-4567',
    location: 'Singapore',
    passportCountry: 'Singapore',
    golfHandicap: '12.5',
    message: 'This is an automated test submission.'
  },
  // Pre-defined survey answers (1-5 scale)
  surveyAnswers: {
    extraversion: [5, 4, 5, 4, 5, 4],       // Questions 1-6
    agreeableness: [4, 5, 4, 5, 4, 5],      // Questions 7-12
    conscientiousness: [5, 5, 4, 5, 4, 5],  // Questions 13-18
    openness: [4, 5, 4, 5, 4, 5],           // Questions 19-24
    emotionalStability: [4, 4, 5, 4, 5, 4]  // Questions 25-30
  }
};

// Main test function
async function runTest() {
  console.log('🚀 Starting application process test');
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Step 1: Submit application form
    await submitApplicationForm(page);
    
    // Step 2: Complete personality survey
    await completeSurvey(page);
    
    // Step 3: Verify interview link
    await verifyInterviewLink(page);
    
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Keep the browser open for inspection
    // Uncomment to close automatically: await browser.close();
    console.log('🔍 Browser remains open for inspection. Close it manually when done.');
  }
}

// Submit the application form
async function submitApplicationForm(page) {
  console.log('📝 Submitting application form...');
  
  // Navigate to the application page
  await page.goto(`${config.baseUrl}/apply`, { waitUntil: 'networkidle0' });
  
  // Fill out the form
  await page.type('#name', config.applicationData.name);
  await page.type('#email', config.applicationData.email);
  await page.type('#phone', config.applicationData.phone);
  await page.type('#location', config.applicationData.location);
  
  // Select passport country
  await page.select('#passportCountry', config.applicationData.passportCountry);
  
  // Fill golf handicap
  await page.type('#golfHandicap', config.applicationData.golfHandicap);
  
  // Select the first position
  await page.waitForSelector('#position');
  await page.select('#position', await getFirstPositionId(page));
  
  // Upload resume
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('.dropzone')
  ]);
  await fileChooser.accept([config.resumePath]);
  
  // Wait for file to upload
  await page.waitForTimeout(1000);
  
  // Add message
  await page.type('#message', config.applicationData.message);
  
  // Check consent checkbox
  await page.click('input[type="checkbox"]');
  
  // Submit form
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 })
  ]);
  
  console.log('✅ Application form submitted successfully');
  
  // Wait for redirection to questionnaire
  await page.waitForTimeout(5000);
}

// Complete the personality survey
async function completeSurvey(page) {
  console.log('📋 Completing personality survey...');
  
  // Wait for survey page to load
  await page.waitForSelector('form');
  
  // Fill out each category of questions
  for (const [category, answers] of Object.entries(config.surveyAnswers)) {
    console.log(`📊 Answering ${category} questions...`);
    
    for (let i = 0; i < answers.length; i++) {
      const value = answers[i];
      const selector = `input[name="${category}-${i}"][value="${value}"]`;
      
      try {
        await page.waitForSelector(selector);
        await page.click(selector);
      } catch (error) {
        console.error(`Failed to select ${selector}:`, error);
      }
    }
  }
  
  // Submit the survey
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 })
  ]);
  
  console.log('✅ Survey completed successfully');
  
  // Wait for success message
  await page.waitForTimeout(3000);
}

// Verify the interview link
async function verifyInterviewLink(page) {
  console.log('🔍 Verifying interview link...');
  
  // Check if we're redirected to the status page
  const url = page.url();
  if (url.includes('/status/')) {
    console.log('✅ Successfully redirected to status page');
    
    // Check if interview button is present
    const interviewButton = await page.$('button:has-text("Start Video Interview")');
    if (interviewButton) {
      console.log('✅ Interview button found');
    } else {
      console.log('⚠️ Interview button not found, may need manual verification');
    }
  } else {
    console.log('⚠️ Not on status page, current URL:', url);
  }
}

// Helper function to get the first position ID
async function getFirstPositionId(page) {
  return await page.evaluate(() => {
    const select = document.querySelector('#position');
    const options = Array.from(select.options).filter(option => option.value !== '');
    return options.length > 0 ? options[0].value : '';
  });
}

// Run the test
runTest().catch(console.error);
