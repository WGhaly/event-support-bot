import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ZipDownloadButton } from '@/components/ZipDownloadButton';
import { ExportActions } from '@/components/export-actions';

async function getExport(exportId: string, userId: string) {
  const exportRecord = await prisma.export.findUnique({
    where: { id: exportId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          userId: true,
        },
      },
      fieldMapping: {
        include: {
          template: { select: { name: true } },
          dataset: { select: { name: true, rowCount: true } },
        },
      },
    },
  });

  if (!exportRecord || exportRecord.project.userId !== userId) {
    return null;
  }

  return exportRecord;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; exportId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { title: 'Unauthorized' };
  }

  const { exportId } = await params;
  const exportRecord = await getExport(exportId, session.user.id);

  return {
    title: exportRecord
      ? `Export ${exportRecord.badgeCount} Badges | ${exportRecord.project.name}`
      : 'Export Not Found',
  };
}

export default async function ExportDetailPage({
  params,
}: {
  params: Promise<{ id: string; exportId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const { id: projectId, exportId } = await params;
  const exportRecord = await getExport(exportId, session.user.id);

  if (!exportRecord) {
    notFound();
  }

  // Fetch manifest if export is completed
  let manifestData: {
    badges: string[];
  } | null = null;

  if (exportRecord.status === 'completed' && exportRecord.exportUrl) {
    try {
      // Construct absolute URL for manifest fetch
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      const manifestUrl = exportRecord.exportUrl.startsWith('http') 
        ? exportRecord.exportUrl 
        : `${baseUrl}${exportRecord.exportUrl}`;
      
      const manifestResponse = await fetch(manifestUrl);
      if (manifestResponse.ok) {
        manifestData = await manifestResponse.json();
      }
    } catch (error) {
      console.error('Failed to fetch manifest:', error);
    }
  }

  const duration =
    exportRecord.completedAt && exportRecord.startedAt
      ? exportRecord.completedAt.getTime() - exportRecord.startedAt.getTime()
      : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Project
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Export Details</h1>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                exportRecord.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : exportRecord.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : exportRecord.status === 'processing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {exportRecord.status.charAt(0).toUpperCase() +
                exportRecord.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Template</p>
              <p className="font-medium text-gray-900">
                {exportRecord.fieldMapping.template.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dataset</p>
              <p className="font-medium text-gray-900">
                {exportRecord.fieldMapping.dataset.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Badge Count</p>
              <p className="font-medium text-gray-900">
                {exportRecord.badgeCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Started</p>
              <p className="font-medium text-gray-900">
                {formatDate(exportRecord.startedAt)}
              </p>
            </div>
            {exportRecord.completedAt && (
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-medium text-gray-900">
                  {formatDate(exportRecord.completedAt)}
                </p>
              </div>
            )}
            {duration && (
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">
                  {(duration / 1000).toFixed(1)} seconds
                </p>
              </div>
            )}
            {duration && exportRecord.badgeCount > 0 && (
              <div>
                <p className="text-sm text-gray-600">Avg Time per Badge</p>
                <p className="font-medium text-gray-900">
                  {(duration / exportRecord.badgeCount).toFixed(0)} ms
                </p>
              </div>
            )}
          </div>

          {exportRecord.errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {exportRecord.errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* Badge Gallery */}
        {manifestData && manifestData.badges.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Generated Badges ({manifestData.badges.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {manifestData.badges.slice(0, 12).map((badgeUrl, index) => (
                <a
                  key={index}
                  href={badgeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
                >
                  <img
                    src={badgeUrl}
                    alt={`Badge ${index + 1}`}
                    className="w-full h-auto"
                  />
                  <div className="p-2 bg-gray-50 text-center text-sm text-gray-600">
                    Badge {index + 1}
                  </div>
                </a>
              ))}
            </div>
            {manifestData.badges.length > 12 && (
              <p className="text-sm text-gray-600 mt-4">
                Showing 12 of {manifestData.badges.length} badges
              </p>
            )}
          </div>
        )}

        {/* Download Options */}
        {exportRecord.status === 'completed' && exportRecord.exportUrl && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Download Options
            </h2>
            
            {/* ZIP Download */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Bulk Download (Recommended)
              </h3>
              <ZipDownloadButton 
                exportId={exportId} 
                badgeCount={exportRecord.badgeCount} 
              />
              <p className="text-sm text-gray-600 mt-2">
                Downloads all {exportRecord.badgeCount} badges as a single ZIP file.
              </p>
            </div>

            {/* Individual Downloads */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Individual Files
              </h3>
              <div className="flex gap-4">
                <a
                  href={exportRecord.exportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Download Manifest (JSON)
                </a>
                {manifestData && (
                  <a
                    href={manifestData.badges[0]}
                    download
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Download Sample Badge
                  </a>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Note: Individual badge images can be downloaded by clicking on them
                in the gallery above.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <ExportActions projectId={projectId} exportId={exportId} />
      </div>
    </div>
  );
}
