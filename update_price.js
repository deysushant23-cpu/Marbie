const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.update({where: {id: 2}, data: {price: 4500}}).then(p => {
  console.log("Updated product 2 price to 4500");
  prisma.$disconnect();
});
