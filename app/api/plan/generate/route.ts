import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateTrainingPlanDraft } from "@/lib/plan-generator";
import { planWizardSchema } from "@/schemas/plan";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = planWizardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const draft = generateTrainingPlanDraft(
    new Date(parsed.data.eventDate),
    parsed.data.level,
    parsed.data.distanceGoal
  );

  // Route handler keeps plan generation server-side to protect user data and allow auditing.
  const plan = await prisma.trainingPlan.create({
    data: {
      userId: user.id,
      name: draft.name,
      eventDate: new Date(draft.eventDate),
      level: draft.level,
      distanceGoal: draft.distanceGoal,
      version: 1,
      weekCount: draft.weekCount,
      sessions: {
        create: draft.weeks.flatMap((week) =>
          week.sessions.map((session) => ({
            date: new Date(session.date),
            sport: session.sport,
            sessionType: session.sessionType,
            description: session.description,
            durationMin: session.durationMin,
            intensity: session.intensity,
            distanceKm: session.distanceKm ?? null,
            notes: session.notes
          }))
        )
      }
    },
    include: { sessions: true }
  });

  return NextResponse.json({ plan });
}
