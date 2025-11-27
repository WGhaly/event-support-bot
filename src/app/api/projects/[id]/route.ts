import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET a specific project
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        templates: {
          orderBy: { createdAt: 'desc' as const },
        },
        datasets: {
          orderBy: { createdAt: 'desc' as const },
        },
        exports: {
          orderBy: { startedAt: 'desc' as const },
          take: 10,
        },
        _count: {
          select: {
            templates: true,
            datasets: true,
            exports: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Project not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(project));
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch project', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// PATCH update a project
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        createErrorResponse('Project not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    const data = await req.json();
    const validated = projectSchema.safeParse(data);

    if (!validated.success) {
      return NextResponse.json(
        createErrorResponse(
          validated.error.errors[0].message,
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json(
      createSuccessResponse(project, 'Project updated successfully')
    );
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to update project', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// DELETE a project
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        createErrorResponse('Project not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Delete project (cascade will handle related records)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json(
      createSuccessResponse(null, 'Project deleted successfully')
    );
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to delete project', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
