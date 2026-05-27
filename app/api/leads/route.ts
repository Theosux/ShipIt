import { NextResponse } from "next/server";
import { z } from "zod";

import { generateLeadsPlan } from "@/lib/leads";

export const runtime = "nodejs";
export const maxDuration = 300;

const requestSchema = z.object({
  idea: z
    .object({
      idea_name: z.string().trim().min(1),
      problem: z.string().trim().min(1),
      opportunity: z.string().trim().min(1),
      monetization_model: z.string().trim().min(1),
      similar_competitors: z.array(z.string()).default([]),
      pricing_hint: z.string().trim().min(1),
      revenue_potential: z.string().trim().min(1),
      go_to_market: z.string().trim().min(1),
    })
    .passthrough(),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid request payload.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected server error.";
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const plan = await generateLeadsPlan(body.idea);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("[API /leads] Error:", error);
    const message = getErrorMessage(error);
    const status = error instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
