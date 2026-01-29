import { notFound } from "next/navigation";

import { SportDashboard } from "@/components/sport-dashboard";

const sportLabels: Record<string, string> = {
  swim: "Schwimmen",
  bike: "Radfahren",
  run: "Laufen"
};

export default function SportPage({ params }: { params: { type: string } }) {
  const label = sportLabels[params.type];
  if (!label) {
    notFound();
  }
  return <SportDashboard sport={label} />;
}
