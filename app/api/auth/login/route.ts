import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../../../config';

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { username, password } = await request.json();

    // Validate credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { 
        username: username,
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
