'use client'

type Module = {
  id: string
  name: string
  displayName: string
  description: string | null
  icon: string | null
  route: string
  isActive: boolean
  order: number
  _count: { userModules: number }
}

export function ModuleManagementClient({ modules }: { modules: Module[] }) {
  const handleToggleModule = async (moduleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/super-admin/modules/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, isActive: !currentStatus }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error toggling module:', error)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <div
          key={module.id}
          className={`bg-white rounded-lg shadow-md p-6 border-2 transition ${
            module.isActive ? 'border-green-200' : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {module.displayName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{module.name}</p>
            </div>
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                module.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {module.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4">
            {module.description || 'No description'}
          </p>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{module._count.userModules}</span> users enabled
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={module.isActive}
                onChange={() => handleToggleModule(module.id, module.isActive)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            Route: {module.route}
          </div>
        </div>
      ))}
    </div>
  )
}
