import { createClient } from "@insforge/sdk";
import { jsonrepair } from "jsonrepair";
import { z } from "zod";

import { getServerEnv } from "@/lib/env";
import type { LeadsPlan, SaasIdea } from "@/lib/types";

const platformSchema = z.object({
  name: z.string().trim().min(1),
  why: z.string().trim().min(1),
  search_query: z.string().trim().min(1),
});

const planSchema = z.object({
  platforms: z.array(platformSchema).min(2).max(5),
  outreach_plan: z.array(z.string().trim().min(1)).min(3).max(6),
});

const LEADS_PROMPT = `You are a senior growth strategist who specializes in early-stage lead generation and cold outreach for solo founders.

You receive a single startup idea (JSON). Your job is to return two things:

1) "platforms": 2 to 5 SPECIFIC online places where the target customer for this idea is most likely to be found and reachable. Pick what actually fits this idea — LinkedIn, Twitter/X, Instagram, a specific subreddit, Indie Hackers, Product Hunt, Discord communities, Slack groups, industry forums, niche directories, etc. Prefer a mix of broad (LinkedIn) and specific (a named subreddit, community, or hashtag) when relevant.

For each platform:
- "name": the platform or community name (e.g. "LinkedIn", "Reddit — r/smallbusiness", "Twitter/X", "Indie Hackers", "Discord — Indie Worldwide").
- "why": 1 short sentence explaining WHY the target customer hangs out there.
- "search_query": a concrete, copy-paste-ready search string, filter strategy, or community pointer the founder can use TODAY (specific keywords, boolean operators, advanced filters, hashtag, subreddit, group name). Be specific. No vague advice.

2) "outreach_plan": a 3 to 6 step action plan, written as short imperative sentences the founder can execute manually starting today. Cover prospecting (finding the first ~20 leads), warming up the relationship, sending the first message, and following up. Be specific to this idea, not generic.

ALL output MUST be written in clear, natural English regardless of the input language.

Return STRICT JSON ONLY, in this exact shape:

{
  "platforms": [
    { "name": "", "why": "", "search_query": "" }
  ],
  "outreach_plan": [""]
}

Do not include any prose, markdown, or commentary outside the JSON.`;

function extractMessageContent(response: unknown): string {
  const record = response as Record<string, unknown>;

  const directContent =
    (record?.choices as Array<Record<string, unknown>> | undefined)?.[0]?.message &&
    typeof ((record.choices as Array<Record<string, unknown>>)[0].message as Record<string, unknown>).content === "string"
      ? (((record.choices as Array<Record<string, unknown>>)[0].message as Record<string, unknown>).content as string)
      : undefined;

  if (directContent) {
    return directContent;
  }

  const nestedData = record?.data as Record<string, unknown> | undefined;
  const nestedChoices = nestedData?.choices as Array<Record<string, unknown>> | undefined;

  if (
    nestedChoices?.[0]?.message &&
    typeof (nestedChoices[0].message as Record<string, unknown>).content === "string"
  ) {
    return (nestedChoices[0].message as Record<string, unknown>).content as string;
  }

  if (typeof nestedData?.response === "string") {
    return nestedData.response;
  }

  if (typeof record?.response === "string") {
    return record.response;
  }

  throw new Error("Insforge AI response did not contain a readable message payload.");
}

function parsePlan(raw: string): LeadsPlan {
  const withoutCodeFence = raw.replace(/```json|```/gi, "").trim();
  const start = withoutCodeFence.indexOf("{");
  const end = withoutCodeFence.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Insforge AI response did not include a JSON object.");
  }

  const candidate = withoutCodeFence.slice(start, end + 1);

  try {
    return planSchema.parse(JSON.parse(candidate));
  } catch {
    try {
      return planSchema.parse(JSON.parse(jsonrepair(candidate)));
    } catch (repairError) {
      throw new Error(
        repairError instanceof Error
          ? `Failed to parse leads plan JSON: ${repairError.message}`
          : "Failed to parse leads plan JSON.",
      );
    }
  }
}

type IdeaInput = Pick<
  SaasIdea,
  | "idea_name"
  | "problem"
  | "opportunity"
  | "monetization_model"
  | "similar_competitors"
  | "pricing_hint"
  | "revenue_potential"
  | "go_to_market"
>;

function compactIdea(idea: IdeaInput) {
  return {
    idea_name: idea.idea_name,
    problem: idea.problem,
    opportunity: idea.opportunity,
    monetization_model: idea.monetization_model,
    similar_competitors: idea.similar_competitors,
    pricing_hint: idea.pricing_hint,
    revenue_potential: idea.revenue_potential,
    go_to_market: idea.go_to_market,
  };
}

export async function generateLeadsPlan(idea: IdeaInput): Promise<LeadsPlan> {
  const env = getServerEnv();

  const insforge = createClient({
    baseUrl: env.insforgeUrl,
    anonKey: env.insforgeApiKey,
    isServerMode: true,
    timeout: env.insforgeTimeoutMs,
    retryCount: 1,
    headers: {
      Authorization: `Bearer ${env.insforgeApiKey}`,
      "X-API-Key": env.insforgeApiKey,
    },
  });

  const response = await insforge.ai.chat.completions.create({
    model: env.insforgeModel,
    temperature: 0.4,
    maxTokens: 900,
    messages: [
      { role: "system", content: LEADS_PROMPT },
      { role: "user", content: JSON.stringify(compactIdea(idea)) },
    ],
  } as never);

  const raw = extractMessageContent(response);
  return parsePlan(raw);
}
