import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { ModuleManagementClient } from './module-management-client'

export default async function ModuleManagementPage() {
  await requireRole('super-admin')

  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          userModules: {
            where: { isEnabled: true },
          },
        },
      },
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Module Management</h2>
        <p className="mt-2 text-gray-600">
          Manage platform modules and their availability
        </p>
      </div>

      <ModuleManagementClient modules={JSON.parse(JSON.stringify(modules))} />
    </div>
  )
}
