"use client";

import { signIn } from "next-auth/react";
import { Activity } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 text-white">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-soft-xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Activity className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-semibold">Triathlon Training Plan</h1>
        <p className="mt-3 text-sm text-white/70">
          Verbinde Strava, synchronisiere deine Aktivitäten und plane deine nächste Bestleistung.
        </p>
        <Button className="mt-8 w-full" onClick={() => signIn("strava")}>
          Mit Strava anmelden
        </Button>
      </div>
    </div>
  );
}
