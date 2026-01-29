import { addSeconds, isBefore } from "date-fns";

import { prisma } from "@/lib/db";
import { decryptToken, encryptToken } from "@/lib/crypto";
import type { StravaActivity, StravaConnectionPayload } from "@/types/strava";

const STRAVA_BASE = "https://www.strava.com/api/v3";

export async function getStravaConnection(userId: string): Promise<StravaConnectionPayload | null> {
  const connection = await prisma.stravaConnection.findUnique({ where: { userId } });
  if (!connection) return null;

  return {
    id: connection.id,
    userId: connection.userId,
    athleteId: connection.athleteId,
    accessToken: decryptToken(connection.accessTokenEnc),
    refreshToken: decryptToken(connection.refreshTokenEnc),
    expiresAt: connection.expiresAt,
    scopes: connection.scopes,
    lastSyncAt: connection.lastSyncAt
  };
}

export async function refreshStravaToken(connection: StravaConnectionPayload) {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID ?? "",
      client_secret: process.env.STRAVA_CLIENT_SECRET ?? "",
      refresh_token: connection.refreshToken,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Strava token");
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };

  const expiresAt = new Date(data.expires_at * 1000);

  await prisma.stravaConnection.update({
    where: { id: connection.id },
    data: {
      accessTokenEnc: encryptToken(data.access_token),
      refreshTokenEnc: encryptToken(data.refresh_token),
      expiresAt
    }
  });

  return {
    ...connection,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt
  };
}

export async function ensureValidToken(connection: StravaConnectionPayload) {
  const refreshAt = addSeconds(connection.expiresAt, -60);
  if (isBefore(refreshAt, new Date())) {
    return refreshStravaToken(connection);
  }
  return connection;
}

export async function fetchStravaActivities(
  connection: StravaConnectionPayload,
  afterDate: Date
): Promise<StravaActivity[]> {
  const validConnection = await ensureValidToken(connection);
  const activities: StravaActivity[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      after: Math.floor(afterDate.getTime() / 1000).toString(),
      per_page: "50",
      page: page.toString()
    });

    const response = await fetch(`${STRAVA_BASE}/athlete/activities?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${validConnection.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Strava activities");
    }

    const pageData = (await response.json()) as StravaActivity[];
    if (!pageData.length) {
      break;
    }
    activities.push(...pageData);
    page += 1;
  }

  return activities;
}
