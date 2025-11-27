import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import archiver from 'archiver';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ exportId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { exportId } = await params;

    // Get export record and verify ownership
    const exportRecord = await prisma.export.findUnique({
      where: { id: exportId },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!exportRecord || exportRecord.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: { message: 'Export not found' } },
        { status: 404 }
      );
    }

    if (!exportRecord.exportUrl) {
      return NextResponse.json(
        { error: { message: 'Export manifest not found' } },
        { status: 404 }
      );
    }

    // Fetch manifest from Blob Storage
    const manifestResponse = await fetch(exportRecord.exportUrl);
    if (!manifestResponse.ok) {
      throw new Error('Failed to fetch manifest');
    }
    const manifest = await manifestResponse.json();

    // Create ZIP archive in memory
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on('error', (err: Error) => {
      throw err;
    });

    // Add each badge to the ZIP by fetching from blob storage
    for (const badgeUrl of manifest.badges) {
      const badgeResponse = await fetch(badgeUrl);
      if (!badgeResponse.ok) {
        throw new Error(`Failed to fetch badge: ${badgeUrl}`);
      }
      const badgeBuffer = Buffer.from(await badgeResponse.arrayBuffer());
      const badgeFilename = badgeUrl.split('/').pop() || 'badge.png';
      
      archive.append(badgeBuffer, { name: badgeFilename });
    }

    // Add manifest to ZIP
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

    // Finalize the archive
    await archive.finalize();

    // Wait for all data to be collected
    await new Promise<void>((resolve) => {
      archive.on('end', () => resolve());
    });

    const zipBuffer = Buffer.concat(chunks);

    // Return ZIP as response
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="badges-${exportId}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Failed to create ZIP:', error);
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to create ZIP',
        },
      },
      { status: 500 }
    );
  }
}
