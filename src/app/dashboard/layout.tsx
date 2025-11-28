import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@/components/sign-out-button';

export const metadata = {
  title: 'Dashboard | Luuj',
  description: 'Manage your badge projects',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 hover:opacity-80 transition"
              >
                <img 
                  src="/icons/Luuj Logo.png" 
                  alt="Luuj" 
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Luuj
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="text-blue-700 hover:text-blue-800 transition font-medium"
              >
                Projects
              </Link>
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
