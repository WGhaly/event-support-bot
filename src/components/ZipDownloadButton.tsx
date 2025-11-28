'use client';

import { useState } from 'react';

interface ZipDownloadButtonProps {
  exportId: string;
  badgeCount: number;
}

export function ZipDownloadButton({ exportId, badgeCount }: ZipDownloadButtonProps) {
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const createZip = async () => {
    console.log('[ZIP] Starting ZIP creation for export:', exportId);
    setIsCreatingZip(true);
    setError(null);
    setProgress('Starting ZIP creation...');

    try {
      console.log('[ZIP] Fetching:', `/api/exports/${exportId}/zip`);
      const response = await fetch(`/api/exports/${exportId}/zip`, {
        method: 'POST',
      });

      console.log('[ZIP] Response status:', response.status);
      console.log('[ZIP] Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        console.error('[ZIP] Response not OK:', response.status, response.statusText);
        // Try to parse error as JSON
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          console.error('[ZIP] Error data:', data);
          throw new Error(data.error?.message || 'Failed to create ZIP');
        }
        throw new Error(`Failed to create ZIP: ${response.status} ${response.statusText}`);
      }

      console.log('[ZIP] Getting blob from response...');
      // Get ZIP blob from response
      const blob = await response.blob();
      console.log('[ZIP] Blob size:', blob.size, 'bytes');
      console.log('[ZIP] Blob type:', blob.type);
      
      // Create temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      console.log('[ZIP] Created blob URL:', blobUrl);
      setZipUrl(blobUrl);
      setProgress('');

      // Auto-download
      console.log('[ZIP] Triggering download...');
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `badges-${exportId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('[ZIP] Download triggered successfully');
      
      // Clean up blob URL after a delay
      setTimeout(() => {
        console.log('[ZIP] Cleaning up blob URL');
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (err) {
      console.error('[ZIP] Error creating ZIP:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProgress('');
    } finally {
      console.log('[ZIP] Setting isCreatingZip to false');
      setIsCreatingZip(false);
    }
  };

  return (
    <div className="space-y-4">
      {!zipUrl ? (
        <div>
          <button
            onClick={createZip}
            disabled={isCreatingZip}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {isCreatingZip ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating ZIP...
              </span>
            ) : (
              `Download All as ZIP (${badgeCount} badges)`
            )}
          </button>
          {progress && (
            <p className="text-sm text-gray-600 mt-2">{progress}</p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-2">Error: {error}</p>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium mb-2">
            ✓ ZIP file created successfully!
          </p>
          <a
            href={zipUrl}
            download
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Download ZIP Again
          </a>
        </div>
      )}
    </div>
  );
}
