import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Roles
  console.log('Creating roles...')
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super-admin' },
    update: {},
    create: {
      name: 'super-admin',
      displayName: 'Super Administrator',
      description: 'Full platform control - manage admins, users, and modules',
      permissions: JSON.stringify({
        canManageAdmins: true,
        canManageUsers: true,
        canManageModules: true,
        canAccessAllModules: true,
        canViewAnalytics: true,
        canConfigureSystem: true,
      }),
    },
  })

  await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Limited management - view users and configure modules',
      permissions: JSON.stringify({
        canManageAdmins: false,
        canManageUsers: true,
        canManageModules: false,
        canAccessAllModules: true,
        canViewAnalytics: true,
        canConfigureSystem: false,
      }),
    },
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      displayName: 'User',
      description: 'Standard access - use enabled modules',
      permissions: JSON.stringify({
        canManageAdmins: false,
        canManageUsers: false,
        canManageModules: false,
        canAccessAllModules: false,
        canViewAnalytics: false,
        canConfigureSystem: false,
      }),
    },
  })

  console.log('✓ Roles created')

  // Create Modules
  console.log('Creating modules...')
  const badgeModule = await prisma.module.upsert({
    where: { name: 'badge-creation' },
    update: {},
    create: {
      name: 'badge-creation',
      displayName: 'Badge Creation',
      description: 'Create and manage event badges with templates and data imports',
      icon: 'Badge',
      route: '/dashboard/modules/badges',
      isActive: true,
      order: 1,
    },
  })

  // Placeholder for future modules
  await prisma.module.upsert({
    where: { name: 'attendee-management' },
    update: {},
    create: {
      name: 'attendee-management',
      displayName: 'Attendee Management',
      description: 'Manage event attendees, registrations, and check-ins',
      icon: 'Users',
      route: '/dashboard/modules/attendees',
      isActive: false, // Not yet implemented
      order: 2,
    },
  })

  const eventModule = await prisma.module.upsert({
    where: { name: 'event-registration' },
    update: {},
    create: {
      name: 'event-registration',
      displayName: 'Event Registration',
      description: 'Create events, build registration forms, and manage attendees',
      icon: 'Calendar',
      route: '/dashboard/modules/events',
      isActive: true,
      order: 2,
    },
  })

  await prisma.module.upsert({
    where: { name: 'attendee-management' },
    update: { order: 3 },
    create: {
      name: 'attendee-management',
      displayName: 'Attendee Management',
      description: 'Manage event attendees, registrations, and check-ins',
      icon: 'Users',
      route: '/dashboard/modules/attendees',
      isActive: false,
      order: 3,
    },
  })

  await prisma.module.upsert({
    where: { name: 'schedule-management' },
    update: { order: 4 },
    create: {
      name: 'schedule-management',
      displayName: 'Schedule Management',
      description: 'Create event schedules, manage sessions and speakers',
      icon: 'CalendarDays',
      route: '/dashboard/modules/schedule',
      isActive: false,
      order: 4,
    },
  })

  console.log('✓ Modules created')

  // Create Super Admin User
  console.log('Creating super admin user...')
  const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10)
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@luuj.com' },
    update: {},
    create: {
      email: 'superadmin@luuj.com',
      passwordHash: hashedPassword,
      name: 'Super Admin',
      roleId: superAdminRole.id,
      isActive: true,
    },
  })

  // Enable all modules for super admin
  await prisma.userModule.upsert({
    where: {
      userId_moduleId: {
        userId: superAdmin.id,
        moduleId: badgeModule.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      moduleId: badgeModule.id,
      isEnabled: true,
    },
  })

  await prisma.userModule.upsert({
    where: {
      userId_moduleId: {
        userId: superAdmin.id,
        moduleId: eventModule.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      moduleId: eventModule.id,
      isEnabled: true,
    },
  })

  console.log('✓ Super admin user created')

  // Create a test regular user
  console.log('Creating test user...')
  const testUserPassword = await bcrypt.hash('12345678', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'w@w.com' },
    update: {
      roleId: userRole.id,
    },
    create: {
      email: 'w@w.com',
      passwordHash: testUserPassword,
      name: 'Test User',
      roleId: userRole.id,
      isActive: true,
    },
  })

  // Enable badge module for test user
  await prisma.userModule.upsert({
    where: {
      userId_moduleId: {
        userId: testUser.id,
        moduleId: badgeModule.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      moduleId: badgeModule.id,
      isEnabled: true,
    },
  })

  console.log('✓ Test user created')

  console.log('\n✅ Database seeded successfully!')
  console.log('\nCredentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Super Admin:')
  console.log('  Email: superadmin@luuj.com')
  console.log('  Password: SuperAdmin123!')
  console.log('\nTest User:')
  console.log('  Email: w@w.com')
  console.log('  Password: 12345678')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
