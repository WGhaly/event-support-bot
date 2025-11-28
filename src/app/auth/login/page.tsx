import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/login-form';

export const metadata = {
  title: 'Login | Luuj',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/icons/luuj-logo.png" 
              alt="Luuj" 
              className="h-20 w-auto"
            />
          </div>
          <p className="text-xl font-semibold text-blue-900 mb-1">Welcome Back</p>
          <p className="mt-2 text-blue-700/70">Sign in to your account</p>
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
