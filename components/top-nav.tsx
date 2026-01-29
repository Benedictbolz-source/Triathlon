"use client";

import * as React from "react";
import { CalendarDays, LogOut, RefreshCw, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ranges = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" }
];

type StatusResponse = {
  connected: boolean;
  lastSyncAt: string | null;
};

export function TopNav() {
  const { data } = useSession();
  const [range, setRange] = React.useState("30");
  const queryClient = useQueryClient();

  const statusQuery = useQuery<StatusResponse>({
    queryKey: ["strava-status"],
    queryFn: async () => {
      const response = await fetch("/api/strava/status");
      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }
      return response.json();
    }
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/strava/sync", { method: "POST" });
      if (!response.ok) {
        throw new Error("Sync failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      queryClient.invalidateQueries({ queryKey: ["strava-status"] });
    }
  });

  return (
    <header className="flex flex-col gap-4 border-b border-border/40 bg-background/80 px-6 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
          <p className="text-lg font-semibold">Triathlon Training Plan</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {ranges.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending || !statusQuery.data?.connected}
        >
          <RefreshCw className="h-4 w-4" />
          {syncMutation.isPending ? "Syncing" : "Sync Activities"}
        </Button>
        <div className="flex items-center gap-2 rounded-full border border-border/40 px-3 py-2 text-sm">
          <User className="h-4 w-4" />
          <span>{data?.user?.name ?? data?.user?.email ?? "Athlete"}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
