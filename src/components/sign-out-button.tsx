'use client';

import { handleSignOut } from '@/app/actions/auth';

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-blue-700 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all"
      >
        Sign Out
      </button>
    </form>
  );
}
