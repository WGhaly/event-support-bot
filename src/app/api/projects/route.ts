import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
});

// GET all projects for the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            templates: true,
            datasets: true,
            exports: true,
          },
        },
      },
    });

    return NextResponse.json(createSuccessResponse(projects));
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch projects', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// POST create a new project
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // For HTML form submission, redirect to login
      const contentType = req.headers.get('content-type');
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    // Parse form data or JSON
    let data;
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string | undefined,
      };
    } else {
      data = await req.json();
    }

    // Validate input
    const validated = projectSchema.safeParse(data);
    if (!validated.success) {
      const errorMessage = validated.error.errors[0].message;
      
      // For HTML form, redirect with error
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        return NextResponse.redirect(
          new URL(
            `/dashboard/modules/badges/projects/new?error=${encodeURIComponent(errorMessage)}`,
            req.url
          )
        );
      }

      return NextResponse.json(
        createErrorResponse(errorMessage, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        ...validated.data,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            templates: true,
            datasets: true,
            exports: true,
          },
        },
      },
    });

    // For HTML form, redirect to project page
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(
        new URL(`/dashboard/modules/badges/projects/${project.id}`, req.url)
      );
    }

    return NextResponse.json(
      createSuccessResponse(project, 'Project created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(
        new URL(
          '/dashboard/modules/badges/projects/new?error=' +
            encodeURIComponent('Failed to create project'),
          req.url
        )
      );
    }

    return NextResponse.json(
      createErrorResponse('Failed to create project', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
