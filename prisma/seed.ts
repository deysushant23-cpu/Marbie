import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');
  if (!fs.existsSync(dbPath)) {
    console.log('No db.json found. Skipping seed.');
    return;
  }

  console.log('Reading db.json...');
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // Seed Products
  if (data.products && data.products.length > 0) {
    console.log(`Seeding ${data.products.length} products...`);
    for (const p of data.products) {
      await prisma.product.upsert({
        where: { sku: p.sku || `SKU-${p.id}` },
        update: {},
        create: {
          name: p.name,
          category: p.category,
          subcategory: p.subcategory || 'General',
          price: p.price,
          image: p.image,
          badge: p.badge || null,
          isExclusive: p.isExclusive || false,
          sku: p.sku || `SKU-${p.id}`,
          stock: p.stock || 10,
          description: p.description || '',
          dimensions: p.dimensions || '',
          weight: p.weight || '',
          images: p.images || [],
          colors: p.colors || [],
          originalPrice: p.originalPrice || null,
        }
      });
    }
  }

  // Seed Reviews
  if (data.reviews && data.reviews.length > 0) {
    console.log(`Seeding ${data.reviews.length} reviews...`);
    for (const r of data.reviews) {
      await prisma.review.create({
        data: {
          title: r.title,
          author: r.author,
          time: r.time,
          rating: r.rating,
          content: r.content,
          product: r.product,
          verified: r.verified || true,
          flagged: r.flagged || false,
          image: r.image || '',
        }
      });
    }
  }

  // Seed Config
  if (data.config) {
    console.log(`Seeding SiteConfig...`);
    await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: {
        heroCarouselRatio: data.config.heroCarouselRatio,
        featuredProductIds: data.config.featuredProductIds || [],
        productCategories: data.config.productCategories || [],
        labels: data.config.labels,
        marketing: data.config.marketing,
        categories: data.config.categories,
        materials: data.config.materials || [],
        navigation: data.config.navigation,
        footer: data.config.footer,
        carousel: data.carousel || [],
      },
      create: {
        id: 1,
        heroCarouselRatio: data.config.heroCarouselRatio,
        featuredProductIds: data.config.featuredProductIds || [],
        productCategories: data.config.productCategories || [],
        labels: data.config.labels,
        marketing: data.config.marketing,
        categories: data.config.categories,
        materials: data.config.materials || [],
        navigation: data.config.navigation,
        footer: data.config.footer,
        carousel: data.carousel || [],
      }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
