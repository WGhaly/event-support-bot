import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';

export async function POST(
  request: Request,
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

    // Load manifest to get all badge URLs
    const manifestPath = path.join(
      process.cwd(),
      'public',
      'exports',
      exportId,
      'manifest.json'
    );

    const manifestContent = await readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    // Create ZIP file in the exports directory
    const zipFilename = `badges-${exportId}.zip`;
    const zipPath = path.join(
      process.cwd(),
      'public',
      'exports',
      exportId,
      zipFilename
    );

    // Create ZIP archive
    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression
      });

      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);

      // Add each badge to the ZIP
      for (const badgeUrl of manifest.badges) {
        const badgeFilename = path.basename(badgeUrl);
        const badgePath = path.join(
          process.cwd(),
          'public',
          'exports',
          exportId,
          badgeFilename
        );
        archive.file(badgePath, { name: badgeFilename });
      }

      // Add manifest to ZIP
      archive.file(manifestPath, { name: 'manifest.json' });

      archive.finalize();
    });

    const zipUrl = `/exports/${exportId}/${zipFilename}`;

    return NextResponse.json({
      data: {
        zipUrl,
        badgeCount: manifest.badgeCount,
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
