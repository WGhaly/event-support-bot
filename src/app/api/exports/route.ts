import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { generateBadges } from '@/lib/badge-generator';
import { put } from '@vercel/blob';
import path from 'path';

const createExportSchema = z.object({
  fieldMappingId: z.string().min(1, 'Field mapping ID is required'),
});

// GET all exports for a project
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const projectId = req.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json(
        createErrorResponse('Project ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Project not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    const exports = await prisma.export.findMany({
      where: { projectId },
      include: {
        fieldMapping: {
          include: {
            template: { select: { id: true, name: true } },
            dataset: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json(createSuccessResponse(exports));
  } catch (error) {
    console.error('Error fetching exports:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch exports', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// POST create new export (generate badges)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createExportSchema.parse(body);

    // Fetch field mapping with all related data
    const fieldMapping = await prisma.fieldMapping.findUnique({
      where: { id: validatedData.fieldMappingId },
      include: {
        template: {
          include: {
            project: {
              select: { id: true, userId: true },
            },
          },
        },
        dataset: true,
      },
    });

    if (!fieldMapping) {
      return NextResponse.json(
        createErrorResponse('Field mapping not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Verify ownership
    if (fieldMapping.template.project.userId !== session.user.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 403 }
      );
    }

    // Parse data
    const templateFields = JSON.parse(fieldMapping.template.fields as string);
    const mappings = JSON.parse(fieldMapping.mappings as string);
    const dataRows = JSON.parse(fieldMapping.dataset.data as string);

    console.log('[EXPORT DEBUG] Template fields:', JSON.stringify(templateFields, null, 2));
    console.log('[EXPORT DEBUG] Mappings:', JSON.stringify(mappings, null, 2));
    console.log('[EXPORT DEBUG] First data row:', JSON.stringify(dataRows[0], null, 2));

    // Create export record with PENDING status
    const exportRecord = await prisma.export.create({
      data: {
        projectId: fieldMapping.template.projectId,
        fieldMappingId: fieldMapping.id,
        status: 'pending',
        badgeCount: dataRows.length,
      },
    });

    // Start badge generation in the background (async, non-blocking)
    generateBadgesAsync(
      exportRecord.id,
      fieldMapping.template.imageUrl, // This is a URL like /uploads/templates/...
      fieldMapping.template.imageWidth,
      fieldMapping.template.imageHeight,
      templateFields,
      mappings,
      dataRows
    ).catch((error) => {
      console.error('Badge generation failed:', error);
      // Update export record to FAILED
      prisma.export
        .update({
          where: { id: exportRecord.id },
          data: {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date(),
          },
        })
        .catch(console.error);
    });

    return NextResponse.json(
      createSuccessResponse({
        ...exportRecord,
        message: 'Badge generation started',
      }),
      { status: 202 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse(
          error.errors[0]?.message || 'Validation error',
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    console.error('Error creating export:', error);
    return NextResponse.json(
      createErrorResponse('Failed to create export', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

/**
 * Generate badges asynchronously and upload to Vercel Blob
 */
async function generateBadgesAsync(
  exportId: string,
  templateImageUrl: string,
  templateWidth: number,
  templateHeight: number,
  templateFields: unknown[],
  mappings: Record<string, string>,
  dataRows: Record<string, unknown>[]
) {
  try {
    // Update status to PROCESSING
    await prisma.export.update({
      where: { id: exportId },
      data: { status: 'processing' },
    });

    console.log(`Starting badge generation for export ${exportId}`);
    const startTime = Date.now();

    console.log('[BADGE DEBUG] Fields:', JSON.stringify(templateFields, null, 2));
    console.log('[BADGE DEBUG] Mappings:', JSON.stringify(mappings, null, 2));
    console.log('[BADGE DEBUG] First row:', JSON.stringify(dataRows[0], null, 2));

    // Template URL can be either a Blob Storage URL (https://...) or a local path (/...)
    // For local paths, convert to absolute file system path
    // For URLs, pass directly to loadImage (which supports HTTP/HTTPS URLs)
    const templateFilePath = templateImageUrl.startsWith('http')
      ? templateImageUrl
      : templateImageUrl.startsWith('/')
      ? path.join(process.cwd(), 'public', templateImageUrl)
      : templateImageUrl;

    // Generate all badges
    const badges = await generateBadges({
      templateImageUrl: templateFilePath,
      templateWidth,
      templateHeight,
      fields: templateFields as never[],
      mappings,
      dataRows,
      onProgress: (current, total) => {
        console.log(`Generated ${current}/${total} badges`);
      },
    });

    const generationTime = Date.now() - startTime;
    console.log(`Generated ${badges.length} badges in ${generationTime}ms`);

    // Upload badges to Vercel Blob Storage
    console.log('Uploading badges to Blob Storage...');
    const uploadStartTime = Date.now();

    const badgeUrls: string[] = [];

    // Upload each badge to Blob Storage
    for (let i = 0; i < badges.length; i++) {
      const badge = badges[i];
      const filename = `badge-${String(i + 1).padStart(4, '0')}.png`;
      const blobPath = `badges/${exportId}/${filename}`;

      const blob = await put(blobPath, badge, {
        access: 'public',
        contentType: 'image/png',
      });

      badgeUrls.push(blob.url);

      // Log progress every 10 badges
      if ((i + 1) % 10 === 0 || i === badges.length - 1) {
        console.log(`Uploaded ${i + 1}/${badges.length} badges`);
      }
    }

    // Create manifest JSON
    const manifest = {
      exportId,
      badgeCount: badges.length,
      badges: badgeUrls,
      generatedAt: new Date().toISOString(),
    };

    // Upload manifest to Blob Storage
    const manifestBlob = await put(
      `badges/${exportId}/manifest.json`,
      JSON.stringify(manifest, null, 2),
      {
        access: 'public',
        contentType: 'application/json',
      }
    );

    const uploadTime = Date.now() - uploadStartTime;
    console.log(`Uploaded ${badges.length} badges in ${uploadTime}ms`);

    // Update export record to COMPLETED
    await prisma.export.update({
      where: { id: exportId },
      data: {
        status: 'completed',
        exportUrl: manifestBlob.url,
        completedAt: new Date(),
      },
    });

    const totalTime = Date.now() - startTime;
    console.log(`Export ${exportId} completed in ${totalTime}ms (${generationTime}ms generation + ${uploadTime}ms upload)`);
  } catch (error) {
    console.error(`Badge generation failed for export ${exportId}:`, error);
    throw error;
  }
}
