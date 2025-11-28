import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { AdminManagementClient } from './admin-management-client'

export default async function AdminManagementPage() {
  await requireRole('super-admin')

  const admins = await prisma.user.findMany({
    where: {
      role: {
        name: {
          in: ['admin', 'super-admin'],
        },
      },
    },
    include: {
      role: true,
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

  const roles = await prisma.role.findMany({
    where: {
      name: {
        in: ['admin', 'super-admin'],
      },
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Admin Management</h2>
        <p className="mt-2 text-gray-600">
          Manage administrator accounts and permissions
        </p>
      </div>

      <AdminManagementClient
        admins={JSON.parse(JSON.stringify(admins))}
        roles={JSON.parse(JSON.stringify(roles))}
      />
    </div>
  )
}
