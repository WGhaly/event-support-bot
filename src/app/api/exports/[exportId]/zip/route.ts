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
    console.log('[ZIP API] Fetching manifest from:', exportRecord.exportUrl);
    const manifestResponse = await fetch(exportRecord.exportUrl);
    if (!manifestResponse.ok) {
      throw new Error('Failed to fetch manifest');
    }
    const manifest = await manifestResponse.json();
    console.log('[ZIP API] Manifest loaded, badge count:', manifest.badges.length);

    // Create ZIP archive in memory
    console.log('[ZIP API] Creating archive...');
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    const chunks: Buffer[] = [];
    
    // Set up promise to wait for archive completion BEFORE adding files
    const archivePromise = new Promise<void>((resolve, reject) => {
      archive.on('end', () => {
        console.log('[ZIP API] Archive end event fired');
        resolve();
      });
      
      archive.on('error', (err: Error) => {
        console.error('[ZIP API] Archive error:', err);
        reject(err);
      });
    });
    
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Add each badge to the ZIP by fetching from blob storage
    console.log('[ZIP API] Adding badges to archive...');
    for (let i = 0; i < manifest.badges.length; i++) {
      const badgeUrl = manifest.badges[i];
      console.log(`[ZIP API] Fetching badge ${i + 1}/${manifest.badges.length}:`, badgeUrl);
      const badgeResponse = await fetch(badgeUrl);
      if (!badgeResponse.ok) {
        throw new Error(`Failed to fetch badge: ${badgeUrl}`);
      }
      const badgeBuffer = Buffer.from(await badgeResponse.arrayBuffer());
      const badgeFilename = badgeUrl.split('/').pop() || 'badge.png';
      
      archive.append(badgeBuffer, { name: badgeFilename });
      console.log(`[ZIP API] Added badge ${i + 1}: ${badgeFilename} (${badgeBuffer.length} bytes)`);
    }

    // Add manifest to ZIP
    console.log('[ZIP API] Adding manifest.json...');
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

    // Finalize the archive
    console.log('[ZIP API] Finalizing archive...');
    await archive.finalize();

    // Wait for archive to complete
    console.log('[ZIP API] Waiting for archive to complete...');
    await archivePromise;

    const zipBuffer = Buffer.concat(chunks);
    console.log('[ZIP API] ZIP created successfully, size:', zipBuffer.length, 'bytes');

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
