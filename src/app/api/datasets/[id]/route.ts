import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

const updateDatasetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET a specific dataset
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

    const dataset = await prisma.dataset.findFirst({
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

    if (!dataset) {
      return NextResponse.json(
        createErrorResponse('Dataset not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(dataset));
  } catch (error) {
    console.error('Get dataset error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch dataset', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// PATCH update a dataset
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

    // Verify dataset belongs to user's project
    const existingDataset = await prisma.dataset.findFirst({
      where: {
        id,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!existingDataset) {
      return NextResponse.json(
        createErrorResponse('Dataset not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    const data = await req.json();
    const validated = updateDatasetSchema.safeParse(data);

    if (!validated.success) {
      return NextResponse.json(
        createErrorResponse(
          validated.error.errors[0].message,
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    const dataset = await prisma.dataset.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json(
      createSuccessResponse(dataset, 'Dataset updated successfully')
    );
  } catch (error) {
    console.error('Update dataset error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to update dataset', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// DELETE a dataset
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

    // Get dataset and verify ownership
    const dataset = await prisma.dataset.findFirst({
      where: {
        id,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!dataset) {
      return NextResponse.json(
        createErrorResponse('Dataset not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Delete dataset from database (cascade will handle related records)
    await prisma.dataset.delete({
      where: { id },
    });

    return NextResponse.json(
      createSuccessResponse(null, 'Dataset deleted successfully')
    );
  } catch (error) {
    console.error('Delete dataset error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to delete dataset', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
