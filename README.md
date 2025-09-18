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
   ```

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

- **Landing Page**: Showcases the Global Internship Initiative
- **Application Form**: Allows candidates to express interest
- **Status Tracking**: Tracks application status with unique IDs
- **Email Integration**: Automated email notifications via Resend
- **API Integration**: Connects with Manatal and Hireflix APIs
