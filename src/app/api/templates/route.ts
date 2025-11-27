import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  projectId: z.string().cuid(),
});

// GET all templates for a project
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

    const templates = await prisma.template.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(createSuccessResponse(templates));
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch templates', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// POST create a new template
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json(
        createErrorResponse('File is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    // Validate input
    const validated = templateSchema.safeParse({ name, projectId });
    if (!validated.success) {
      return NextResponse.json(
        createErrorResponse(
          validated.error.errors[0].message,
          'VALIDATION_ERROR'
        ),
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

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        createErrorResponse(
          'Invalid file type. Please upload PNG or JPG',
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        createErrorResponse(
          'File size exceeds 10MB limit',
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use Sharp to validate and get image dimensions
    let imageMetadata;
    try {
      imageMetadata = await sharp(buffer).metadata();
      
      if (!imageMetadata.width || !imageMetadata.height) {
        throw new Error('Could not determine image dimensions');
      }

      // Validate minimum dimensions (at least 100x100)
      if (imageMetadata.width < 100 || imageMetadata.height < 100) {
        return NextResponse.json(
          createErrorResponse(
            'Image dimensions must be at least 100x100 pixels',
            'VALIDATION_ERROR'
          ),
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Image validation error:', error);
      return NextResponse.json(
        createErrorResponse(
          'Invalid or corrupted image file',
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    // Upload to Vercel Blob Storage
    const filename = `templates/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    let blobUrl: string;
    try {
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: file.type,
      });
      blobUrl = blob.url;
    } catch (error) {
      console.error('Blob upload error:', error);
      return NextResponse.json(
        createErrorResponse(
          'Failed to upload file to storage',
          'UPLOAD_ERROR'
        ),
        { status: 500 }
      );
    }

    // Save template to database
    const template = await prisma.template.create({
      data: {
        projectId,
        name,
        imageUrl: blobUrl,
        imageWidth: imageMetadata.width,
        imageHeight: imageMetadata.height,
        fields: '[]', // Empty array, will be populated in editor
      },
    });

    return NextResponse.json(
      createSuccessResponse(template, 'Template uploaded successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to create template', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
