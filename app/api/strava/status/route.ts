import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ connected: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { stravaConnection: true }
  });

  return NextResponse.json({
    connected: Boolean(user?.stravaConnection),
    lastSyncAt: user?.stravaConnection?.lastSyncAt ?? null
  });
}
