'use client';

import { handleSignOut } from '@/app/actions/auth';

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        className="text-gray-600 hover:text-gray-900 transition"
      >
        Sign Out
      </button>
    </form>
  );
}
