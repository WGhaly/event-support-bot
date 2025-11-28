import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole('super-admin')
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      projects: {
        orderBy: { createdAt: 'desc' },
      },
      userModules: {
        include: {
          module: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  // Redirect if not a regular user
  if (user.role.name !== 'user') {
    redirect('/super-admin/users')
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/super-admin/users"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to User Management
        </Link>
        <h2 className="text-3xl font-bold text-gray-900">User Details</h2>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
            <p className="text-lg text-gray-900">{user.name || 'No name'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
            <p className="text-lg text-gray-900">{user.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              {user.role.displayName}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Active' : 'Disabled'}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
            <p className="text-lg text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Projects</h3>
            <p className="text-lg text-gray-900">{user.projects.length}</p>
          </div>
        </div>

        {/* Module Access */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Module Access</h3>
          <div className="flex flex-wrap gap-2">
            {user.userModules.length > 0 ? (
              user.userModules
                .filter((um) => um.isEnabled)
                .map((um) => (
                  <span
                    key={um.moduleId}
                    className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800"
                  >
                    {um.module.displayName}
                  </span>
                ))
            ) : (
              <span className="text-sm text-gray-500">No modules assigned</span>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Projects</h3>
          <p className="mt-1 text-sm text-gray-600">
            All projects created by this user across all modules
          </p>
        </div>

        {user.projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">
              This user hasn't created any projects yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {user.projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
