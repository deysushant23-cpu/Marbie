import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "db.json");

function readDB() {
  const fileData = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(fileData);
}

function writeDB(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = readDB();
    const item = db.lookbook?.find((l: any) => l.id === parseInt(id));

    if (!item) {
      return NextResponse.json({ error: "Lookbook item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lookbook item" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = readDB();

    const index = db.lookbook?.findIndex((l: any) => l.id === parseInt(id));

    if (index === -1 || index === undefined) {
      return NextResponse.json({ error: "Lookbook item not found" }, { status: 404 });
    }

    const updatedItem = {
      ...db.lookbook[index],
      name: body.name !== undefined ? body.name : db.lookbook[index].name,
      category: body.category !== undefined ? body.category : db.lookbook[index].category,
      description: body.description !== undefined ? body.description : db.lookbook[index].description,
      images: body.images !== undefined ? body.images : db.lookbook[index].images
    };

    db.lookbook[index] = updatedItem;
    writeDB(db);

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lookbook item" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = readDB();

    const initialLength = db.lookbook?.length || 0;
    db.lookbook = db.lookbook?.filter((l: any) => l.id !== parseInt(id)) || [];

    if (db.lookbook.length === initialLength) {
      return NextResponse.json({ error: "Lookbook item not found" }, { status: 404 });
    }

    writeDB(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lookbook item" }, { status: 500 });
  }
}
