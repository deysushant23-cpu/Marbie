const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findUnique({where: {id: 2}}).then(p => {
  console.log(p);
  prisma.$disconnect();
});
