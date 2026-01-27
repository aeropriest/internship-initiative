import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../../../config';

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { username, password } = await request.json();

    console.log('Login attempt:', {
      receivedUsername: username,
      expectedUsername: ADMIN_USERNAME,
      usernameMatch: username === ADMIN_USERNAME,
      passwordMatch: password === ADMIN_PASSWORD,
      hasUsername: !!username,
      hasPassword: !!password
    });

    // Validate credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.error('Authentication failed: Invalid credentials');
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Authentication successful for user:', username);

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
