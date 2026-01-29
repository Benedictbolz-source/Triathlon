"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type OverviewResponse = {
  kpis: {
    label: string;
    value: string;
    delta: string;
  }[];
  weekTrend: { week: string; total: number }[];
  nextSessions: { date: string; sport: string; title: string }[];
};

const fetchOverview = async (): Promise<OverviewResponse> => {
  const response = await fetch("/api/overview");
  if (!response.ok) {
    throw new Error("Failed to load overview");
  }
  return response.json();
};

export function Overview() {
  const { data, isLoading } = useQuery({ queryKey: ["overview"], queryFn: fetchOverview });

  if (isLoading || !data) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-72" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-3xl">{kpi.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{kpi.delta}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Volume Trend</CardTitle>
          <CardDescription>Distance across all sports</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.weekTrend}>
              <defs>
                <linearGradient id="volume" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#2563eb" fill="url(#volume)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Next 7 days</CardTitle>
          <CardDescription>Upcoming sessions from your plan</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {data.nextSessions.map((session) => (
            <div key={`${session.date}-${session.title}`} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{session.title}</p>
                <p className="text-xs text-muted-foreground">{session.date}</p>
              </div>
              <Badge variant="outline">{session.sport}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
