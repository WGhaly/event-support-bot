'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface MappingActionsProps {
  projectId: string;
  mappingId: string;
  rowCount: number;
}

export default function MappingActions({
  projectId,
  mappingId,
  rowCount,
}: MappingActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this field mapping?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/field-mappings/${mappingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push(`/dashboard/projects/${projectId}`);
        router.refresh();
      } else {
        alert('Failed to delete field mapping');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete field mapping');
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-6 flex gap-4">
      <Link
        href={`/dashboard/projects/${projectId}`}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
      >
        Back to Project
      </Link>
      <Link
        href={`/dashboard/projects/${projectId}/exports/new?mappingId=${mappingId}`}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Generate Badges ({rowCount})
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? 'Deleting...' : 'Delete Mapping'}
      </button>
    </div>
  );
}
