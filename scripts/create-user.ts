import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@lujproject.com';
  const password = process.argv[3] || 'admin123456';
  const name = process.argv[4] || 'Admin';

  console.log(`Creating user: ${email}`);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name,
    },
  });

  console.log('✅ User created successfully!');
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
