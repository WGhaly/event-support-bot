const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      role: true,
      userModules: {
        include: {
          module: true
        }
      }
    }
  })
  
  console.log('\n=== LOCAL DATABASE USERS ===')
  users.forEach(user => {
    console.log(`\n${user.name} (${user.email}) - ${user.role.name}`)
    console.log(`  Modules: ${user.userModules.map(um => um.module.displayName).join(', ') || 'None'}`)
  })
  
  console.log('\n=== ALL MODULES ===')
  const modules = await prisma.module.findMany()
  modules.forEach(m => {
    console.log(`- ${m.displayName} (${m.name}): ${m.isActive ? 'Active' : 'Inactive'}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
