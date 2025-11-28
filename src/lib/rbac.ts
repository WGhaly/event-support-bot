import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type UserRole = 'super-admin' | 'admin' | 'user'

export interface RolePermissions {
  canManageAdmins: boolean
  canManageUsers: boolean
  canManageModules: boolean
  canAccessAllModules: boolean
  canViewAnalytics: boolean
  canConfigureSystem: boolean
}

/**
 * Get the current authenticated user with role information
 */
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user) return null

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
  })

  return user
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false

  return session.user.role === role
}

/**
 * Check if the current user has any of the specified roles
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false

  return roles.includes(session.user.role as UserRole)
}

/**
 * Check if the current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole('super-admin')
}

/**
 * Check if the current user is an admin or super admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasAnyRole(['super-admin', 'admin'])
}

/**
 * Get permissions for the current user's role
 */
export async function getPermissions(): Promise<RolePermissions | null> {
  const user = await getCurrentUser()
  if (!user) return null

  try {
    return JSON.parse(user.role.permissions) as RolePermissions
  } catch {
    return null
  }
}

/**
 * Check if a specific permission is granted
 */
export async function hasPermission(
  permission: keyof RolePermissions
): Promise<boolean> {
  const permissions = await getPermissions()
  if (!permissions) return false

  return permissions[permission]
}

/**
 * Check if the current user can access a specific module
 */
export async function canAccessModule(moduleName: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Super admins can access everything
  if (user.role.name === 'super-admin') return true

  // Check if module exists and is globally active
  const module = await prisma.module.findUnique({
    where: { name: moduleName },
  })

  if (!module || !module.isActive) return false

  // Check if user has access to this module
  const userModule = user.userModules.find(
    (um) => um.module.name === moduleName && um.isEnabled
  )

  return !!userModule
}

/**
 * Get all modules accessible by the current user
 */
export async function getAccessibleModules() {
  const user = await getCurrentUser()
  if (!user) return []

  // Super admins can see all active modules
  if (user.role.name === 'super-admin') {
    return prisma.module.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
  }

  // Regular users see only their enabled modules
  const enabledModuleIds = user.userModules
    .filter((um) => um.isEnabled)
    .map((um) => um.moduleId)

  return prisma.module.findMany({
    where: {
      id: { in: enabledModuleIds },
      isActive: true,
    },
    orderBy: { order: 'asc' },
  })
}

/**
 * Require authentication and redirect if not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

/**
 * Require a specific role or throw an error
 */
export async function requireRole(role: UserRole) {
  const hasRequiredRole = await hasRole(role)
  if (!hasRequiredRole) {
    throw new Error('Forbidden: Insufficient permissions')
  }
}

/**
 * Require any of the specified roles or throw an error
 */
export async function requireAnyRole(roles: UserRole[]) {
  const hasRequiredRole = await hasAnyRole(roles)
  if (!hasRequiredRole) {
    throw new Error('Forbidden: Insufficient permissions')
  }
}

/**
 * Require a specific permission or throw an error
 */
export async function requirePermission(permission: keyof RolePermissions) {
  const hasRequiredPermission = await hasPermission(permission)
  if (!hasRequiredPermission) {
    throw new Error('Forbidden: Insufficient permissions')
  }
}
