export type StravaActivity = {
  id: number;
  name: string;
  type: "Run" | "Ride" | "Swim" | string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed?: number;
  average_heartrate?: number;
  start_date: string;
  sport_type?: string;
};

export type StravaConnectionPayload = {
  id: string;
  userId: string;
  athleteId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string;
  lastSyncAt: Date | null;
};
