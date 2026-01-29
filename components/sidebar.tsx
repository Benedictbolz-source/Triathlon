import Link from "next/link";
import { Activity, CalendarDays, Gauge, Settings, Waves } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: Gauge },
  { href: "/sport/swim", label: "Schwimmen", icon: Waves },
  { href: "/sport/bike", label: "Radfahren", icon: Activity },
  { href: "/sport/run", label: "Laufen", icon: Activity },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/settings", label: "Einstellungen", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="hidden h-full w-64 flex-col border-r border-border/40 bg-background/80 p-6 backdrop-blur-xl lg:flex">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Triathlon</p>
        <p className="text-2xl font-semibold">Training Dashboard</p>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="rounded-xl border border-border/40 bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">2026 UI System</p>
        <p>Shortcuts & accessibility ready.</p>
      </div>
    </aside>
  );
}
