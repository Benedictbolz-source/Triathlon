import { subDays } from "date-fns";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchStravaActivities, getStravaConnection } from "@/lib/strava";
import { rateLimit } from "@/lib/rate-limit";

const SUPPORTED_TYPES = ["Run", "Ride", "Swim"];

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(`strava-sync:${session.user.email}`, 3, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": limiter.retryAfter?.toString() ?? "60" } }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const connection = await getStravaConnection(user.id);
  if (!connection) {
    return NextResponse.json({ error: "Strava not connected" }, { status: 400 });
  }

  const afterDate = subDays(new Date(), 90);
  const activities = await fetchStravaActivities(connection, afterDate);

  const filtered = activities.filter((activity) => SUPPORTED_TYPES.includes(activity.type));

  await prisma.$transaction(
    filtered.map((activity) =>
      prisma.activity.upsert({
        where: { stravaId: activity.id.toString() },
        update: {
          type: activity.type,
          distanceMeters: activity.distance,
          movingTimeSeconds: activity.moving_time,
          elapsedTimeSeconds: activity.elapsed_time,
          totalElevationGain: activity.total_elevation_gain,
          averageSpeed: activity.average_speed ?? null,
          averageHeartrate: activity.average_heartrate ?? null,
          startDate: new Date(activity.start_date),
          rawJson: activity
        },
        create: {
          userId: user.id,
          stravaId: activity.id.toString(),
          type: activity.type,
          distanceMeters: activity.distance,
          movingTimeSeconds: activity.moving_time,
          elapsedTimeSeconds: activity.elapsed_time,
          totalElevationGain: activity.total_elevation_gain,
          averageSpeed: activity.average_speed ?? null,
          averageHeartrate: activity.average_heartrate ?? null,
          startDate: new Date(activity.start_date),
          rawJson: activity
        }
      })
    )
  );

  await prisma.stravaConnection.update({
    where: { id: connection.id },
    data: { lastSyncAt: new Date() }
  });

  return NextResponse.json({ synced: filtered.length });
}
