import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { UserManagementClient } from './user-management-client'

export default async function UserManagementPage() {
  await requireRole('super-admin')

  const users = await prisma.user.findMany({
    include: {
      role: true,
      userModules: {
        include: {
          module: true,
        },
      },
      _count: {
        select: {
          projects: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
        <p className="mt-2 text-gray-600">
          Manage user accounts and module access
        </p>
      </div>

      <UserManagementClient 
        users={JSON.parse(JSON.stringify(users))} 
        modules={JSON.parse(JSON.stringify(modules))}
      />
    </div>
  )
}
