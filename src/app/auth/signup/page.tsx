import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Sign Up | Luuj',
  description: 'Create your free account',
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Redirect if already authenticated
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const errorMessage = params.error
    ? decodeURIComponent(params.error)
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/icons/LUUJ LOGO.png" 
              alt="Luuj" 
              className="h-20 w-auto"
            />
          </div>
          <p className="text-xl font-semibold text-blue-900 mb-1">Get Started Free</p>
          <p className="mt-2 text-blue-700/70">Create your account in seconds</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* HTML Form - Works without JavaScript hydration */}
        <form action="/api/auth/signup" method="POST" className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-blue-900 mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="John Smith"
            />
          </div>

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
              autoComplete="new-password"
              minLength={6}
              className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="At least 6 characters"
            />
            <p className="mt-1 text-xs text-blue-600/60">
              Must be at least 6 characters long
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all focus:ring-4 focus:ring-blue-200 shadow-lg shadow-blue-500/30"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-700/70">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              Sign in
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
      </div>
    </div>
  );
}
