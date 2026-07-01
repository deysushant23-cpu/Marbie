import prisma from "./src/lib/prisma";

async function main() {
  const config = await prisma.siteConfig.findFirst();
  console.log(JSON.stringify(config?.categories, null, 2));
}
main().catch(console.error);
