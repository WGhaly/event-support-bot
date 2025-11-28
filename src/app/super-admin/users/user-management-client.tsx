'use client'

import { useState } from 'react'

type User = {
  id: string
  email: string
  name: string | null
  role: { name: string; displayName: string }
  isActive: boolean
  createdAt: string
  _count: { projects: number }
  userModules: Array<{
    moduleId: string
    isEnabled: boolean
    module: { id: string; name: string; displayName: string }
  }>
}

type Module = {
  id: string
  name: string
  displayName: string
  isActive: boolean
}

export function UserManagementClient({
  users,
  modules,
}: {
  users: User[]
  modules: Module[]
}) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/super-admin/users/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const handleManageModules = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleToggleModule = async (userId: string, moduleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/super-admin/users/toggle-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, moduleId, isEnabled: !currentStatus }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error toggling module:', error)
    }
  }

  return (
    <div>
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'No name'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role.name === 'super-admin' ? 'bg-purple-100 text-purple-800' :
                    user.role.name === 'admin' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.displayName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user._count.projects}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleManageModules(user)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Modules
                    </button>
                    {user.role.name !== 'super-admin' && (
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        className={`font-medium ${
                          user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.isActive ? 'Disable' : 'Enable'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Module Management Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Manage Modules for {selectedUser.name || selectedUser.email}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {modules.map((module) => {
                const userModule = selectedUser.userModules.find(
                  (um) => um.moduleId === module.id
                )
                const isEnabled = userModule?.isEnabled ?? false

                return (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{module.displayName}</h4>
                      <p className="text-sm text-gray-500">
                        Status: {module.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleModule(selectedUser.id, module.id, isEnabled)}
                        className="sr-only peer"
                        disabled={!module.isActive}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
