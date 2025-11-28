import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export const metadata = {
  title: 'Settings | Luuj',
  description: 'Manage your account settings and modules',
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect('/auth/login');
  }

  const params = await searchParams;
  const successMessage = params.success ? decodeURIComponent(params.success) : null;
  const errorMessage = params.error ? decodeURIComponent(params.error) : null;

  // Get user with their modules
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: true,
      userModules: {
        include: {
          module: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  // Get all active modules
  const allModules = await prisma.module.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  // Get user's active module IDs
  const userModuleIds = user.userModules.map((um) => um.moduleId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-3">
                <img src="/icons/luuj-logo.png" alt="Luuj" className="h-10 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-blue-700 hover:text-blue-900 font-medium transition"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-950">Account Settings</h1>
          <p className="mt-2 text-blue-700/70">
            Manage your modules and account preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-950 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-blue-600/70">Name</label>
              <p className="text-blue-950 font-medium">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-blue-600/70">Email</label>
              <p className="text-blue-950 font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-blue-600/70">Role</label>
              <p className="text-blue-950 font-medium">{user.role.displayName}</p>
            </div>
          </div>
        </div>

        {/* Modules Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <h2 className="text-xl font-semibold text-blue-950 mb-2">My Modules</h2>
          <p className="text-sm text-blue-600/70 mb-6">
            Select which modules you want to use in your workspace
          </p>

          <form action="/api/user/modules" method="POST" className="space-y-4">
            {allModules.map((module) => {
              const isActive = userModuleIds.includes(module.id);
              return (
                <label
                  key={module.id}
                  className="flex items-start p-4 bg-blue-50/50 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="modules"
                    value={module.id}
                    defaultChecked={isActive}
                    className="mt-1 h-5 w-5 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{module.icon}</span>
                      <div>
                        <span className="font-semibold text-blue-950 block">
                          {module.displayName}
                        </span>
                        <p className="text-sm text-blue-600/70 mt-1">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30"
              >
                Save Changes
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 border-2 border-blue-200 text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
