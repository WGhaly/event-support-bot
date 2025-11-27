'use client';

import { useState } from 'react';

interface DeleteButtonProps {
  itemType: string;
  itemId: string;
  onDelete: () => void;
}

export function DeleteButton({ itemType, itemId, onDelete }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete this ${itemType}?`)) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/${itemType}s/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete();
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      alert('Error deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm text-red-600 hover:text-red-700 py-2 px-3 disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
