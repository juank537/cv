import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CVData } from "@/lib/cv-types";

const CV_PATH = path.join(process.cwd(), "data", "cv.json");

export async function GET() {
  try {
    const data = fs.readFileSync(CV_PATH, "utf-8");
    const cv: CVData = JSON.parse(data);
    return NextResponse.json(cv);
  } catch {
    return NextResponse.json({ error: "Error reading CV data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cv: CVData = await request.json();
    fs.writeFileSync(CV_PATH, JSON.stringify(cv, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error saving CV data" }, { status: 500 });
  }
}
