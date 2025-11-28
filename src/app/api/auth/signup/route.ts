import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Validate input
    const validated = signupSchema.safeParse(data);
    if (!validated.success) {
      const errorMessage = validated.error.errors[0].message;
      return NextResponse.redirect(
        new URL(
          `/auth/signup?error=${encodeURIComponent(errorMessage)}`,
          req.url
        )
      );
    }

    const { name, email, password } = validated.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.redirect(
        new URL(
          '/auth/signup?error=' +
            encodeURIComponent('An account with this email already exists'),
          req.url
        )
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Get the 'user' role
    const userRole = await prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      return NextResponse.redirect(
        new URL(
          '/auth/signup?error=' +
            encodeURIComponent('System error: User role not found. Please contact support.'),
          req.url
        )
      );
    }

    // Create user with role
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: userRole.id,
      },
    });

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/auth/login?success=Account created successfully', req.url)
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.redirect(
      new URL(
        '/auth/signup?error=' +
          encodeURIComponent('An unexpected error occurred. Please try again.'),
        req.url
      )
    );
  }
}

// Also support JSON API for programmatic access
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const validated = signupSchema.safeParse(data);

    if (!validated.success) {
      return NextResponse.json(
        createErrorResponse(
          validated.error.errors[0].message,
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        createErrorResponse(
          'An account with this email already exists',
          'USER_EXISTS'
        ),
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Get the 'user' role
    const userRole = await prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      return NextResponse.json(
        createErrorResponse(
          'System error: User role not found. Please contact support.',
          'ROLE_NOT_FOUND'
        ),
        { status: 500 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: userRole.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      createSuccessResponse(user, 'Account created successfully')
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      createErrorResponse('An unexpected error occurred', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
