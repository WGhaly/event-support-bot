const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mappings = {
    name: 'name',
    title: 'title',
    company: 'company'
  };

  const fieldMapping = await prisma.fieldMapping.create({
    data: {
      templateId: 'cmihk4dan0001nf3gasg3inak',
      datasetId: 'cmihk4eio00018m3y3dwqrw76', // Get this from dataset we created
      mappings: JSON.stringify(mappings)
    }
  });

  console.log('Field mapping created:', fieldMapping.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
