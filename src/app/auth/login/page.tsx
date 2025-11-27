import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/login-form';

export const metadata = {
  title: 'Login | ID Card Platform',
  description: 'Sign in to your account',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  // Redirect if already authenticated
  // Wrap in try-catch to handle JWT decryption errors from old sessions
  let session;
  try {
    session = await auth();
  } catch (error) {
    // Ignore JWT errors - user will need to log in again
    console.log('Session check failed (old cookie), allowing login');
    session = null;
  }
  
  if (session) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const errorMessage = params.error
    ? decodeURIComponent(params.error)
    : null;
  const successMessage = params.success
    ? decodeURIComponent(params.success)
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <LoginForm error={errorMessage || undefined} />
      </div>
    </div>
  );
}
