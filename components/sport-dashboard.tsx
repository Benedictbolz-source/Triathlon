"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ranges = [
  { label: "4 weeks", value: "4" },
  { label: "8 weeks", value: "8" },
  { label: "12 weeks", value: "12" }
];

type SportDashboardProps = {
  sport: string;
};

export function SportDashboard({ sport }: SportDashboardProps) {
  const [range, setRange] = useState("8");
  const [filters, setFilters] = useState({ indoor: false, outdoor: false, hr: false });
  const chartData = useMemo(
    () =>
      Array.from({ length: Number(range) }).map((_, index) => ({
        week: `W${index + 1}`,
        metric: Math.round(40 + Math.random() * 60)
      })),
    [range]
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{sport} Overview</h2>
          <p className="text-sm text-muted-foreground">Insights and trends per discipline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filters.indoor ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, indoor: !prev.indoor }))}
          >
            Indoor
          </Button>
          <Button
            variant={filters.outdoor ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, outdoor: !prev.outdoor }))}
          >
            Outdoor
          </Button>
          <Button
            variant={filters.hr ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, hr: !prev.hr }))}
          >
            HR Data
          </Button>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              {ranges.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Sessions", value: "6", delta: "+2" },
          { label: "Total Time", value: "6h 24m", delta: "+12%" },
          { label: "Key Metric", value: sport === "Schwimmen" ? "1:48/100m" : "4:32/km", delta: "steady" }
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
              <p className="text-2xl font-semibold">{item.value}</p>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{item.delta}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="metric" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
