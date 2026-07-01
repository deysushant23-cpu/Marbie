import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "collections.json");

function readData() {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const fileData = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(fileData);
}

function writeData(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const newCollection = await request.json();
    const data = readData();
    data.push(newCollection);
    writeData(data);
    return NextResponse.json({ success: true, collection: newCollection });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create collection" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      writeData(body);
      return NextResponse.json({ success: true, collections: body });
    }

    const targetSlug = body.originalSlug || body.slug;
    const updatedCollection = { ...body };
    delete updatedCollection.originalSlug;
    
    let data = readData();
    data = data.map((c: any) => c.slug === targetSlug ? updatedCollection : c);
    writeData(data);
    return NextResponse.json({ success: true, collection: updatedCollection });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    let data = readData();
    data = data.filter((c: any) => c.slug !== slug);
    writeData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete collection" }, { status: 500 });
  }
}
