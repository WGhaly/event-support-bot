const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Get test user
  const testUser = await prisma.user.findUnique({
    where: { email: 'w@w.com' }
  })
  
  if (!testUser) {
    console.error('Test user not found!')
    return
  }
  
  // Get Event Registration module
  const eventModule = await prisma.module.findUnique({
    where: { name: 'event-registration' }
  })
  
  if (!eventModule) {
    console.error('Event Registration module not found!')
    return
  }
  
  // Check if already assigned
  const existing = await prisma.userModule.findFirst({
    where: {
      userId: testUser.id,
      moduleId: eventModule.id
    }
  })
  
  if (existing) {
    console.log('Module already assigned!')
    return
  }
  
  // Assign module
  await prisma.userModule.create({
    data: {
      userId: testUser.id,
      moduleId: eventModule.id,
      isEnabled: true
    }
  })
  
  console.log('✅ Event Registration module assigned to test user!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
