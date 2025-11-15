import { NextResponse } from 'next/server';

export async function GET() {
  // Get environment from .env.local
  const environment = process.env.ENVIRONMENT || 'production';
  
  return NextResponse.json({ 
    environment,
    isDevelopment: environment === 'development'
  });
}
