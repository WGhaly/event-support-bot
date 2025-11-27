import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.redirect(
        new URL(
          '/auth/login?error=' +
            encodeURIComponent('Email and password are required'),
          req.url
        )
      );
    }

    // Validate credentials directly
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.redirect(
        new URL(
          '/auth/login?error=' +
            encodeURIComponent('Invalid email or password'),
          req.url
        )
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      console.log('❌ Invalid password');
      return NextResponse.redirect(
        new URL(
          '/auth/login?error=' +
            encodeURIComponent('Invalid email or password'),
          req.url
        )
      );
    }

    console.log('✅ Login successful for:', email);

    // Redirect to the Auth.js callback to create session
    const callbackUrl = new URL('/api/auth/callback/credentials', req.url);
    callbackUrl.searchParams.set('email', email);
    callbackUrl.searchParams.set('password', password);
    
    // For now, just redirect to dashboard
    // The proper way would be to use Auth.js signIn function
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(
      new URL(
        '/auth/login?error=' +
          encodeURIComponent('An unexpected error occurred. Please try again.'),
        req.url
      )
    );
  }
}
