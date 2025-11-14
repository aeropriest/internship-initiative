import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production';

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'GlobalTalentSolutions';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '18hanDicap08';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email, password } = await request.json();

    // Validate credentials
    if (email !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { 
        username: email,
        role: 'admin',
        // Add any additional claims as needed
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Return success response with token
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
