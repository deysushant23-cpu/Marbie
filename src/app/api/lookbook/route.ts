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

export async function GET() {
  try {
    const db = readDB();
    return NextResponse.json(db.lookbook || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lookbook items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = readDB();

    if (!db.lookbook) {
      db.lookbook = [];
    }

    const newItem = {
      id: db.lookbook.length > 0 ? Math.max(...db.lookbook.map((l: any) => l.id)) + 1 : 1,
      name: body.name || "Untitled Lookbook Item",
      category: body.category || "General",
      description: body.description || "",
      images: body.images || ["", "", "", ""]
    };

    db.lookbook.push(newItem);
    writeDB(db);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lookbook item" }, { status: 500 });
  }
}
