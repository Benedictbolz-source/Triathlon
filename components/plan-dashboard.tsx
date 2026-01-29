"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialSessions = [
  { id: "1", title: "Swim Endurance", sport: "Swim", duration: "45 min", intensity: "Easy" },
  { id: "2", title: "Bike Tempo", sport: "Bike", duration: "90 min", intensity: "Moderate" },
  { id: "3", title: "Run Intervals", sport: "Run", duration: "60 min", intensity: "Hard" }
];

export function PlanDashboard() {
  const [sessions, setSessions] = useState(initialSessions);
  const [selectedSession, setSelectedSession] = useState(initialSessions[0]);
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i)), []);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData("text/plain", id);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>, day: Date) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    const session = sessions.find((item) => item.id === id);
    if (!session) return;
    setSelectedSession({ ...session, date: format(day, "yyyy-MM-dd") });
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Plan Calendar</h2>
          <p className="text-sm text-muted-foreground">Drag sessions to adjust your week.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Generate Plan</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Plan Wizard</SheetTitle>
            </SheetHeader>
            <div className="mt-6 grid gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Distance Goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sprint">Sprint</SelectItem>
                  <SelectItem value="Olympic">Olympic</SelectItem>
                  <SelectItem value="70.3">70.3</SelectItem>
                  <SelectItem value="Ironman">Ironman</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="secondary">Generate 16-week Plan</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <Tabs defaultValue="week">
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
        <TabsContent value="week">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-7">
                  {days.map((day) => (
                    <div
                      key={day.toISOString()}
                      className="min-h-[120px] rounded-xl border border-dashed border-border/60 bg-muted/20 p-3"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => onDrop(event, day)}
                    >
                      <p className="text-xs font-semibold text-muted-foreground">
                        {format(day, "EEE dd")}
                      </p>
                      {sessions
                        .filter((session, index) => index === day.getDay() % sessions.length)
                        .map((session) => (
                          <div
                            key={session.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, session.id)}
                            className="mt-2 rounded-lg bg-background p-2 text-xs shadow"
                          >
                            <p className="font-semibold">{session.title}</p>
                            <p className="text-muted-foreground">{session.duration}</p>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <p className="font-semibold">{selectedSession.title}</p>
                <Badge variant="outline">{selectedSession.sport}</Badge>
                <p>Duration: {selectedSession.duration}</p>
                <p>Intensity: {selectedSession.intensity}</p>
                <Input placeholder="Notes" />
                <Button variant="secondary">Save Session</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="month">
          <Card>
            <CardHeader>
              <CardTitle>Month Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Month view is ready for expansion with drag & drop support and load balancing.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
