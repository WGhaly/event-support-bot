import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

// GET individual export status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ exportId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const { exportId } = await params;

    const exportRecord = await prisma.export.findUnique({
      where: { id: exportId },
      include: {
        fieldMapping: {
          include: {
            template: {
              include: {
                project: {
                  select: { id: true, userId: true },
                },
              },
            },
            dataset: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!exportRecord) {
      return NextResponse.json(
        createErrorResponse('Export not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Verify ownership
    if (exportRecord.fieldMapping.template.project.userId !== session.user.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 403 }
      );
    }

    // Calculate progress
    const progress = {
      percentComplete: exportRecord.status === 'completed' ? 100 : 
                      exportRecord.status === 'processing' ? 50 : 
                      exportRecord.status === 'pending' ? 0 : 0,
      estimatedTimeRemaining: null as number | null,
    };

    return NextResponse.json(
      createSuccessResponse({
        ...exportRecord,
        progress,
      })
    );
  } catch (error) {
    console.error('Error fetching export:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch export', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// DELETE export
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ exportId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const { exportId } = await params;

    const exportRecord = await prisma.export.findUnique({
      where: { id: exportId },
      include: {
        fieldMapping: {
          include: {
            template: {
              include: {
                project: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!exportRecord) {
      return NextResponse.json(
        createErrorResponse('Export not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Verify ownership
    if (exportRecord.fieldMapping.template.project.userId !== session.user.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 403 }
      );
    }

    await prisma.export.delete({
      where: { id: exportId },
    });

    return NextResponse.json(
      createSuccessResponse({ message: 'Export deleted successfully' })
    );
  } catch (error) {
    console.error('Error deleting export:', error);
    return NextResponse.json(
      createErrorResponse('Failed to delete export', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
