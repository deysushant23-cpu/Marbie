import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return Response.json(customers);
  } catch (error) {
    return Response.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
