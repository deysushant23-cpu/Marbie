import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const config = await prisma.siteConfig.findFirst();
  if (config) {
    const existingCats: any[] = Array.isArray(config.categories) ? config.categories : [];
    
    const requiredCategories = [
      { name: 'Bracelets', slug: 'bracelets' },
      { name: 'Necklaces', slug: 'necklaces' },
      { name: 'Korean', slug: 'korean' },
      { name: 'Bridal', slug: 'bridal' },
      { name: 'Rings', slug: 'rings' },
      { name: 'Earrings', slug: 'earrings' },
      { name: 'Bangles', slug: 'bangles' },
      { name: 'Chains', slug: 'chains' }
    ];

    const newCats = [...existingCats];

    for (const req of requiredCategories) {
      if (!newCats.find(c => c.slug === req.slug || c.name.toLowerCase() === req.name.toLowerCase())) {
        newCats.push({ ...req, image: "" });
      }
    }

    await prisma.siteConfig.update({
      where: { id: config.id },
      data: { categories: newCats }
    });
    console.log("Categories updated successfully!");
  } else {
    console.log("No config found.");
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
