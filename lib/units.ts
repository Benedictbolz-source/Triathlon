export function metersToKm(meters: number) {
  return meters / 1000;
}

export function metersToMiles(meters: number) {
  return meters / 1609.34;
}

export function speedToKmh(speedMetersPerSecond: number) {
  return speedMetersPerSecond * 3.6;
}

export function pacePerKm(speedMetersPerSecond: number) {
  if (!speedMetersPerSecond) return 0;
  return 1000 / speedMetersPerSecond / 60;
}

export function pacePer100m(speedMetersPerSecond: number) {
  if (!speedMetersPerSecond) return 0;
  return 100 / speedMetersPerSecond / 60;
}

export function formatPace(minutes: number) {
  if (!minutes || Number.isNaN(minutes)) return "-";
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = Math.floor(seconds % 60);
  return [hours ? `${hours}h` : null, minutes ? `${minutes}m` : null, `${remaining}s`]
    .filter(Boolean)
    .join(" ");
}
