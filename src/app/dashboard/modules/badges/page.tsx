import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  // Fetch user's projects
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          templates: true,
          datasets: true,
          exports: true,
        },
      },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">My Projects</h1>
          <p className="mt-2 text-blue-700/70">
            Manage your badge generation projects
          </p>
        </div>
        <Link
          href="/dashboard/modules/badges/projects/new"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
        >
          + New Project
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            No projects yet
          </h2>
          <p className="text-blue-700/70 mb-6">
            Get started by creating your first badge generation project
          </p>
          <Link
            href="/dashboard/modules/badges/projects/new"
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: typeof projects[number]) => (
            <Link
              key={project.id}
              href={`/dashboard/modules/badges/projects/${project.id}`}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all group hover:scale-[1.02]"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-2 group-hover:text-blue-700 transition">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-blue-700/70 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-xs text-blue-600 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {project._count.templates} templates
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  {project._count.datasets} datasets
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                  {project._count.exports} exports
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-100">
                <p className="text-xs text-blue-600/60">
                  Updated {formatDate(project.updatedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
