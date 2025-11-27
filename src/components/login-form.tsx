'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/app/actions/auth';

export default function LoginForm({ error: initialError }: { error?: string }) {
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError(undefined);
    setLoading(true);

    try {
      const result = await loginAction(formData);
      
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // If no error, the action will redirect automatically
    } catch (err) {
      // Ignore NEXT_REDIRECT errors as they are expected behavior in Next.js 15
      if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
        return; // Let the redirect happen
      }
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-blue-900 mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-blue-900 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={6}
            className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all focus:ring-4 focus:ring-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-blue-700/70">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-blue-600 font-semibold hover:text-blue-700 transition"
          >
            Sign up free
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-sm text-blue-600/60 hover:text-blue-700 transition"
        >
          ← Back to home
        </Link>
      </div>
    </>
  );
}

