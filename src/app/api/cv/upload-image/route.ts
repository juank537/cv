import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.join(publicDir, "profile.jpg");
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, path: "/profile.jpg" });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "Error uploading image" }, { status: 500 });
  }
}
