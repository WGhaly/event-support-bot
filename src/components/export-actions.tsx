'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ExportActionsProps {
  projectId: string;
  exportId: string;
}

export function ExportActions({ projectId, exportId }: ExportActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Delete this export? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/exports/${exportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete export');
      }

      router.push(`/dashboard/modules/badges/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to delete export:', error);
      alert('Failed to delete export. Please try again.');
    }
  };

  return (
    <div className="flex gap-4">
      <Link
        href={`/dashboard/modules/badges/projects/${projectId}`}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
      >
        Back to Project
      </Link>
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Delete Export
      </button>
    </div>
  );
}
