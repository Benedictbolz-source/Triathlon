import { subDays, format } from "date-fns";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { formatDuration, metersToKm } from "@/lib/units";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      {
        kpis: [
          { label: "Weekly Time", value: "0h", delta: "Sign in to sync" },
          { label: "Weekly Distance", value: "0 km", delta: "" },
          { label: "Sessions", value: "0", delta: "" },
          { label: "Load", value: "0", delta: "" }
        ],
        weekTrend: [],
        nextSessions: []
      },
      { status: 200 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ kpis: [], weekTrend: [], nextSessions: [] });
  }

  const since = subDays(new Date(), 7);
  const activities = await prisma.activity.findMany({
    where: {
      userId: user.id,
      startDate: { gte: since }
    },
    orderBy: { startDate: "desc" }
  });

  const totalSeconds = activities.reduce((sum, activity) => sum + activity.movingTimeSeconds, 0);
  const totalKm = activities.reduce((sum, activity) => sum + metersToKm(activity.distanceMeters), 0);
  const totalSessions = activities.length;
  const loadProxy = Math.round(totalSeconds / 60);

  const weekTrend = Array.from({ length: 6 }).map((_, index) => ({
    week: `W${index + 1}`,
    total: Math.round(totalKm / 6 + index * 3)
  }));

  const nextSessions = [
    { date: format(new Date(), "EEE dd MMM"), sport: "Swim", title: "Technique + Drills" },
    { date: format(subDays(new Date(), -2), "EEE dd MMM"), sport: "Bike", title: "Tempo Ride" },
    { date: format(subDays(new Date(), -4), "EEE dd MMM"), sport: "Run", title: "Brick Run" }
  ];

  return NextResponse.json({
    kpis: [
      { label: "Weekly Time", value: formatDuration(totalSeconds), delta: "+8%" },
      { label: "Weekly Distance", value: `${totalKm.toFixed(1)} km`, delta: "+5%" },
      { label: "Sessions", value: totalSessions.toString(), delta: "steady" },
      { label: "Load", value: loadProxy.toString(), delta: "+3" }
    ],
    weekTrend,
    nextSessions
  });
}
