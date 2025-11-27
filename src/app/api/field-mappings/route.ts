import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

const createMappingSchema = z.object({
  projectId: z.string(),
  templateId: z.string(),
  datasetId: z.string(),
  mappings: z.string(), // JSON string of field mappings
});

// GET field mappings for a project
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        createErrorResponse('Project ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Project not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    const mappings = await prisma.fieldMapping.findMany({
      where: { 
        template: {
          projectId,
        },
      },
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
      orderBy: { createdAt: 'desc' as const },
    });

    return NextResponse.json(createSuccessResponse(mappings));
  } catch (error) {
    console.error('Get field mappings error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch field mappings', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// POST create a new field mapping
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const data = await req.json();
    const validated = createMappingSchema.safeParse(data);

    if (!validated.success) {
      return NextResponse.json(
        createErrorResponse(
          validated.error.errors[0].message,
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    const { projectId, templateId, datasetId, mappings } = validated.data;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Project not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Verify template belongs to project
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        projectId,
      },
    });

    if (!template) {
      return NextResponse.json(
        createErrorResponse('Template not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Verify dataset belongs to project
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        projectId,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        createErrorResponse('Dataset not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Check if mapping already exists for this template/dataset pair
    const existingMapping = await prisma.fieldMapping.findUnique({
      where: {
        templateId_datasetId: {
          templateId,
          datasetId,
        },
      },
    });

    if (existingMapping) {
      return NextResponse.json(
        createErrorResponse(
          'A mapping already exists for this template and dataset combination',
          'DUPLICATE'
        ),
        { status: 409 }
      );
    }

    // Validate mappings JSON
    try {
      JSON.parse(mappings);
    } catch {
      return NextResponse.json(
        createErrorResponse('Invalid mappings format', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    // Create field mapping
    const fieldMapping = await prisma.fieldMapping.create({
      data: {
        projectId,
        templateId,
        datasetId,
        mappings,
      },
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
      createSuccessResponse(fieldMapping, 'Field mapping created successfully')
    );
  } catch (error) {
    console.error('Create field mapping error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to create field mapping', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
