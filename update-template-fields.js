const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fields = [
    { id: 'name', text: 'Name', x: 100, y: 100, fontSize: 24, fontFamily: 'Arial' },
    { id: 'title', text: 'Title', x: 100, y: 150, fontSize: 18, fontFamily: 'Arial' },
    { id: 'company', text: 'Company', x: 100, y: 190, fontSize: 16, fontFamily: 'Arial' }
  ];

  await prisma.template.update({
    where: { id: 'cmihk4dan0001nf3gasg3inak' },
    data: { fields: JSON.stringify(fields) }
  });

  console.log('Template fields updated successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
