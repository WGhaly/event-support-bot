import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@/components/sign-out-button';

export const metadata = {
  title: 'Dashboard | Luuj',
  description: 'Event Management Platform',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/login');
  }

  const isSuperAdmin = session.user?.role === 'super-admin';
  const isAdmin = session.user?.role === 'admin' || isSuperAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="hover:opacity-80 transition"
              >
                <img 
                  src="/icons/luuj-logo.png" 
                  alt="Luuj" 
                  className="h-12 w-auto"
                />
              </Link>
              <Link
                href="/dashboard"
                className="text-blue-700 hover:text-blue-800 transition font-medium"
              >
                Modules
              </Link>
              {isSuperAdmin && (
                <Link
                  href="/super-admin"
                  className="text-purple-700 hover:text-purple-800 transition font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Super Admin
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-700 font-medium">
                {session.user?.name || session.user?.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
