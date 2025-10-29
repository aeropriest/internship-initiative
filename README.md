<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Global Internship Initiative - Next.js Application

This is a Next.js application for the Global Internship Initiative, connecting motivated graduates with leading clubs worldwide.

View your app in AI Studio: https://ai.studio/apps/drive/1TZaDOCH583a_DFckOkLhycxf5cUlFuUU

## Run Locally

**Prerequisites:** Node.js 18+ and pnpm

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables in [.env.local](.env.local):
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_MANATAL_API_TOKEN=your_manatal_token
   NEXT_PUBLIC_HIREFLIX_API_KEY=your_hireflix_key
   NEXT_PUBLIC_RESEND_API_KEY=your_resend_key
   NEXT_PUBLIC_HIREFLIX_POSITION_ID=your_position_id
   NEXT_PUBLIC_RESEND_FROM_EMAIL=your_verified_email
   
   # Google Sheets Integration (for questionnaire)
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
   GOOGLE_PRIVATE_KEY="your_private_key_with_quotes"
   ```
   
   See [.env.local.example](.env.local.example) for a template.

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/services` - API services and utilities
- `constants.tsx` - Application constants and data
- `config.ts` - Environment configuration

## Features

- **Landing Page**: Showcases the Global Internship Initiative with modern design
- **Position Management**: Fetches open positions from Hireflix API
- **Application Form**: Complete application with resume upload and position selection
- **Resume Upload**: Drag-and-drop file upload with validation
- **Status Tracking**: Real-time application status with progress indicators
- **Social Sharing**: Encourage candidates to share their applications
- **Email Integration**: Automated email notifications via Resend
- **Personality Questionnaire**: 10-question personality assessment with Likert scale
- **API Integration**: 
  - **Hireflix**: Position management and interview scheduling
  - **Manatal**: Candidate management and resume processing
  - **Resend**: Email notifications
  - **Google Sheets**: Storing questionnaire responses
- **Webhook Support**: Manatal webhook endpoint for status updates

## API Integrations

### Hireflix API
- Fetch open positions
- Create video interviews
- Position management

### Manatal API  
- Create candidate profiles
- Upload and process resumes
- Track application status
- Webhook notifications

### Resend API
- Send confirmation emails
- Application status updates
- Professional email templates

### Google Sheets API
- Store personality questionnaire responses
- Track candidate information and URLs
- Automated data collection
- See [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for detailed setup instructions

## Application Flow

1. **Browse Positions**: Candidates view available internship positions
2. **Submit Application**: Complete form with personal details and resume
3. **Resume Processing**: Automatic upload to Manatal ATS
4. **Status Updates**: Real-time progress tracking via webhooks
5. **Personality Assessment**: Complete 10-question personality questionnaire
6. **Social Sharing**: Encourage network engagement
7. **Interview Scheduling**: Automatic Hireflix integration

https://www.perplexity.ai/search/we-have-a-nextjs-application-w-WHT4Sw2zQ4SxWULzxZyllQ#0