import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { del } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  fields: z.string().optional(), // JSON string
});

type Params = { params: Promise<{ id: string }> };

// GET a specific template
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

    const template = await prisma.template.findFirst({
      where: {
        id,
        project: {
          userId: session.user.id,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        createErrorResponse('Template not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(template));
  } catch (error) {
    console.error('Get template error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch template', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// PATCH update a template
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

    // Verify template belongs to user's project
    const existingTemplate = await prisma.template.findFirst({
      where: {
        id,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        createErrorResponse('Template not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    const data = await req.json();
    const validated = updateTemplateSchema.safeParse(data);

    if (!validated.success) {
      return NextResponse.json(
        createErrorResponse(
          validated.error.errors[0].message,
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    const template = await prisma.template.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json(
      createSuccessResponse(template, 'Template updated successfully')
    );
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to update template', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// DELETE a template
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

    // Get template and verify ownership
    const template = await prisma.template.findFirst({
      where: {
        id,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        createErrorResponse('Template not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Delete from Vercel Blob storage
    try {
      await del(template.imageUrl);
    } catch (error) {
      console.error('Blob deletion error:', error);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete template from database (cascade will handle related records)
    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json(
      createSuccessResponse(null, 'Template deleted successfully')
    );
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to delete template', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
