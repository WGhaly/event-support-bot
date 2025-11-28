import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'New Project | Luuj',
  description: 'Create a new badge project',
};

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect('/auth/login');
  }

  const params = await searchParams;
  const errorMessage = params.error
    ? decodeURIComponent(params.error)
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Create New Project</h1>
        <p className="mt-2 text-blue-700/70">
          Start a new badge generation project
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-8">
        {/* HTML Form - Works without JavaScript hydration */}
        <form action="/api/projects" method="POST" className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-blue-900 mb-2"
            >
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="e.g., Annual Conference 2024"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-blue-900 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
              placeholder="Optional: Add details about this project"
            />
            <p className="mt-1 text-xs text-blue-600/60">
              Help your team understand the purpose of this project
            </p>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-blue-100">
            <a
              href="/dashboard"
              className="px-6 py-2.5 text-blue-700 font-semibold hover:text-blue-800 transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
