import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Deletion endpoint stub" }, { status: 501 });
}
