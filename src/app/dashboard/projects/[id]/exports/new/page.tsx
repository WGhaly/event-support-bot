'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ExportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  badgeCount: number;
  exportUrl: string | null;
  errorMessage: string | null;
  progress: {
    percentComplete: number;
    estimatedTimeRemaining: number | null;
  };
}

export default function NewExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mappingId = searchParams.get('mappingId');

  const [projectId, setProjectId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setProjectId(p.id));
  }, [params]);

  // Start badge generation
  useEffect(() => {
    if (!mappingId || !projectId || isStarting) return;

    const startGeneration = async () => {
      setIsStarting(true);
      try {
        const response = await fetch('/api/exports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fieldMappingId: mappingId }),
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Server returned ${response.status}: ${text.substring(0, 200)}`);
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to start badge generation');
        }

        setExportStatus(data.data);
      } catch (err) {
        console.error('Badge generation error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsStarting(false);
      }
    };

    startGeneration();
  }, [mappingId, projectId, isStarting]);

  // Poll for status updates
  useEffect(() => {
    if (!exportStatus?.id) return;
    if (exportStatus.status === 'completed' || exportStatus.status === 'failed') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/exports/${exportStatus.id}`);
        const data = await response.json();

        if (response.ok) {
          setExportStatus(data.data);

          // Stop polling when completed or failed
          if (
            data.data.status === 'completed' ||
            data.data.status === 'failed'
          ) {
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('Error polling export status:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [exportStatus?.id, exportStatus?.status]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <h1 className="text-2xl font-bold text-red-900 mb-4">
              Generation Failed
            </h1>
            <p className="text-red-700 mb-6">{error}</p>
            <Link
              href={`/dashboard/projects/${projectId}`}
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!exportStatus) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing badge generation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { status, badgeCount, exportUrl, errorMessage, progress } = exportStatus;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Badge Generation
          </h1>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : status === 'processing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {/* Progress Info */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Generating {badgeCount} badges...
            </p>

            {/* Progress Bar */}
            {(status === 'pending' || status === 'processing') && (
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress?.percentComplete || 0}%` }}
                ></div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              {status === 'processing' && progress && (
                <>
                  <p>Progress: {progress.percentComplete}%</p>
                  {progress.estimatedTimeRemaining && (
                    <p>
                      Estimated time remaining:{' '}
                      {Math.ceil(progress.estimatedTimeRemaining / 1000)} seconds
                    </p>
                  )}
                </>
              )}
              {status === 'pending' && <p>Waiting to start...</p>}
            </div>
          </div>

          {/* Completed State */}
          {status === 'completed' && exportUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                ✓ Generation Complete!
              </h2>
              <p className="text-green-700 mb-4">
                Successfully generated {badgeCount} badges.
              </p>
              <div className="flex gap-4">
                <a
                  href={exportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  View Manifest
                </a>
                <Link
                  href={`/dashboard/projects/${projectId}/exports/${exportStatus.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Export Details
                </Link>
              </div>
            </div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Generation Failed
              </h2>
              <p className="text-red-700 mb-2">
                {errorMessage || 'An unknown error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href={`/dashboard/projects/${projectId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Project
            </Link>
            {status === 'completed' && exportStatus.id && (
              <button
                onClick={async () => {
                  if (confirm('Delete this export?')) {
                    await fetch(`/api/exports/${exportStatus.id}`, {
                      method: 'DELETE',
                    });
                    router.push(`/dashboard/projects/${projectId}`);
                  }
                }}
                className="px-4 py-2 text-red-600 hover:text-red-700"
              >
                Delete Export
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
