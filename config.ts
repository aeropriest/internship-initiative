// WARNING: Storing API keys in client-side code is highly insecure and should not be done in a production environment.
// These keys are exposed to anyone who inspects the browser's code.
// In a real application, this logic should be handled by a secure backend server.

export const MANATAL_API_TOKEN = process.env.NEXT_PUBLIC_MANATAL_API_TOKEN || '51ce36b3ac06f113f418f0e0f47391e7471090c7';
export const HIREFLIX_API_KEY = process.env.NEXT_PUBLIC_HIREFLIX_API_KEY || 'dde0fc60-bd68-4166-853e-4c852faa94db';
export const RESEND_API_KEY = process.env.NEXT_PUBLIC_RESEND_API_KEY || 're_6BZ9WZWD_2S6nGim2jE5mYooj8GyuT59Y';

// This is a placeholder for a position you must create in your Hireflix account.
// Replace 'your-position-id' with the actual ID from Hireflix.
export const HIREFLIX_POSITION_ID = process.env.NEXT_PUBLIC_HIREFLIX_POSITION_ID || 'global-internship-initiative-2025';

// The 'from' email address for Resend. This must be a domain you have verified with Resend.
export const RESEND_FROM_EMAIL = process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL || '59club Academy <onboarding@resend.dev>';
