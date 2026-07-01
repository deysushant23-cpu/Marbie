import prisma from "./src/lib/prisma";

async function main() {
  const config = await prisma.siteConfig.findFirst();
  if (!config) return;

  const categories = config.categories as any[];
  
  const updatedCategories = categories.map((cat) => {
    if (cat.slug === "gifting") {
      return { ...cat, image: "/images/gifting_category_banner.png" };
    }
    return cat;
  });

  await prisma.siteConfig.update({
    where: { id: config.id },
    data: { categories: updatedCategories }
  });

  console.log("Gifting category updated successfully!");
}

main().catch(console.error);
