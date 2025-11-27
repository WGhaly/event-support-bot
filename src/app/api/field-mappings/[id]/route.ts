import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

const updateMappingSchema = z.object({
  mappings: z.string().optional(), // JSON string
});

type Params = { params: Promise<{ id: string }> };

// GET a specific field mapping
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

    const mapping = await prisma.fieldMapping.findFirst({
      where: {
        id,
        template: {
          project: {
            userId: session.user.id,
          },
        },
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            fields: true,
          },
        },
        dataset: {
          select: {
            id: true,
            name: true,
            rowCount: true,
            columns: true,
          },
        },
      },
    });

    if (!mapping) {
      return NextResponse.json(
        createErrorResponse('Field mapping not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(mapping));
  } catch (error) {
    console.error('Get field mapping error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch field mapping', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// PATCH update a field mapping
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

    // Verify mapping belongs to user's project
    const existingMapping = await prisma.fieldMapping.findFirst({
      where: {
        id,
        template: {
          project: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingMapping) {
      return NextResponse.json(
        createErrorResponse('Field mapping not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    const data = await req.json();
    const validated = updateMappingSchema.safeParse(data);

    if (!validated.success) {
      return NextResponse.json(
        createErrorResponse(
          validated.error.errors[0].message,
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    // Validate mappings JSON if provided
    if (validated.data.mappings) {
      try {
        JSON.parse(validated.data.mappings);
      } catch {
        return NextResponse.json(
          createErrorResponse('Invalid mappings format', 'VALIDATION_ERROR'),
          { status: 400 }
        );
      }
    }

    const mapping = await prisma.fieldMapping.update({
      where: { id },
      data: validated.data,
      include: {
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        dataset: {
          select: {
            id: true,
            name: true,
            rowCount: true,
          },
        },
      },
    });

    return NextResponse.json(
      createSuccessResponse(mapping, 'Field mapping updated successfully')
    );
  } catch (error) {
    console.error('Update field mapping error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to update field mapping', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// DELETE a field mapping
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

    // Get mapping and verify ownership
    const mapping = await prisma.fieldMapping.findFirst({
      where: {
        id,
        template: {
          project: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!mapping) {
      return NextResponse.json(
        createErrorResponse('Field mapping not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Delete mapping from database (cascade will handle exports)
    await prisma.fieldMapping.delete({
      where: { id },
    });

    return NextResponse.json(
      createSuccessResponse(null, 'Field mapping deleted successfully')
    );
  } catch (error) {
    console.error('Delete field mapping error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to delete field mapping', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
