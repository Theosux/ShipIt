"use client";

import { useEffect, useState } from "react";

import type { AnalyzeIdeasResponse, LeadsPlan, SaasIdea } from "@/lib/types";

// ---- HERO COPY ----
// Edit these four lines to change the headline and pitch.
const HERO_LINE_1 = "Make your first";
const HERO_LINE_2 = "1,000 RON";
const HERO_ACCENT = "without a job.";
const HERO_PITCH =
  "ShipIt mines weekly Reddit threads, surfaces real problems people are paying to solve, and hands you a scored shortlist of side-hustle ideas you can actually start tomorrow.";

const EXAMPLE_SUBREDDITS = ["freelance", "smallbusiness", "programare", "RoAntreprenoriat"];
const LOADING_PHASES = [
  "Scraping this week's top Reddit threads.",
  "Opening the strongest discussions and extracting comment signal.",
  "Grouping complaints into repeatable side-hustle opportunities.",
  "Scoring ideas and packaging the shortlist.",
];
const FINAL_PHASE_BREAKDOWN = [
  "Ranking problems by urgency and willingness to pay.",
  "Matching adjacent solutions and weak spots.",
  "Estimating pricing, time-to-revenue, and effort.",
  "Linking each idea back to source Reddit threads.",
];

const HOW_IT_WORKS = [
  "Decodo scrapes the top weekly subreddit page and post threads.",
  "Cheerio structures titles plus top 2–3 comments from up to 8 higher-signal posts.",
  "Insforge scores each opportunity and returns strict JSON only.",
  "Pick a subreddit, hit the button, and ShipIt returns concise side-hustle opportunities grounded in real weekly Reddit conversations.",
];

function scoreTone(score: number): string {
  if (score >= 8) {
    return "border-emerald-400/40 bg-emerald-500/10 text-emerald-300";
  }

  if (score >= 5) {
    return "border-amber-400/40 bg-amber-500/10 text-amber-300";
  }

  return "border-rose-400/40 bg-rose-500/10 text-rose-300";
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | string[];
}) {
  const values = Array.isArray(value) ? value.filter(Boolean) : [value];

  if (values.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--dim)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-2 text-sm leading-6 text-[var(--muted)]">
        {Array.isArray(value)
          ? values.map((item) => (
              <span
                key={`${label}-${item}`}
                className="rounded-full border border-[var(--border)] bg-black/40 px-3 py-1"
              >
                {item}
              </span>
            ))
          : <p>{value}</p>}
      </div>
    </div>
  );
}

function LinkField({
  label,
  items,
}: {
  label: string;
  items: Array<{ title: string; thread_url: string }>;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--dim)]">
        {label}
      </p>
      <div className="space-y-2 text-sm leading-6 text-[var(--muted)]">
        {items.map((item, index) => (
          <a
            key={`${item.thread_url}-${index}`}
            href={item.thread_url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-[var(--border)] bg-black/40 px-4 py-3 transition hover:border-[var(--accent)] hover:bg-black/60"
            title={item.title}
          >
            <span className="line-clamp-2 font-medium text-[var(--paper)]">{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function SourcePill({ title, url }: { title: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition hover:border-[var(--accent)] hover:bg-black/60"
      title={title}
    >
      <span className="line-clamp-2 text-sm font-medium leading-6 text-[var(--muted)]">{title}</span>
    </a>
  );
}

function IdeaCard({
  idea,
  onFindLeads,
}: {
  idea: SaasIdea;
  onFindLeads: (idea: SaasIdea) => void;
}) {
  return (
    <article className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--accent)]">
            {idea.verdict} Signal
          </p>
          <h2 className="font-display text-2xl tracking-tight text-[var(--paper)] sm:text-3xl">
            {idea.idea_name}
          </h2>
        </div>
        <div
          className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${scoreTone(
            idea.score,
          )}`}
        >
          Score {idea.score}/10
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <Field label="Problem" value={idea.problem} />
        <Field label="Demand" value={idea.demand_level} />
        <Field label="Existing Solutions" value={idea.existing_solutions} />
        <Field label="Similar Competitors" value={idea.similar_competitors} />
        <Field label="User Complaints" value={idea.user_complaints} />
        <Field label="Opportunity" value={idea.opportunity} />
        <Field label="Monetization" value={idea.monetization_model} />
        <Field label="Pricing Hint" value={idea.pricing_hint} />
        <Field label="Revenue Potential" value={idea.revenue_potential} />
        <Field label="Go To Market" value={idea.go_to_market} />
        <LinkField label="Source Threads" items={idea.source_threads} />
      </div>

      <div className="mt-6 flex justify-end border-t border-[var(--border)] pt-5">
        <button
          type="button"
          onClick={() => onFindLeads(idea)}
          className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5"
        >
          Find leads →
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [subreddit, setSubreddit] = useState("freelance");
  const [lastSubreddit, setLastSubreddit] = useState("freelance");
  const [result, setResult] = useState<AnalyzeIdeasResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalPhaseStep, setFinalPhaseStep] = useState(0);
  const [showHow, setShowHow] = useState(false);
  const [activeLeadIdea, setActiveLeadIdea] = useState<SaasIdea | null>(null);
  const [leadsByIdea, setLeadsByIdea] = useState<Record<string, LeadsPlan>>({});
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  async function openLeads(idea: SaasIdea) {
    setActiveLeadIdea(idea);
    setLeadsError(null);

    if (leadsByIdea[idea.idea_name]) {
      return;
    }

    setLeadsLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const payload = (await response.json()) as LeadsPlan & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to generate leads plan.");
      }

      setLeadsByIdea((prev) => ({ ...prev, [idea.idea_name]: payload }));
    } catch (requestError) {
      setLeadsError(
        requestError instanceof Error ? requestError.message : "Unexpected error.",
      );
    } finally {
      setLeadsLoading(false);
    }
  }

  useEffect(() => {
    if (!activeLeadIdea) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveLeadIdea(null);
    };
    window.addEventListener("keydown", handler);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeLeadIdea]);

  useEffect(() => {
    if (!showHow) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowHow(false);
    };
    window.addEventListener("keydown", handler);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [showHow]);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      setElapsedSeconds(seconds);
      setLoadingStep(Math.min(LOADING_PHASES.length - 1, Math.floor(seconds / 4)));
      if (seconds >= 12) {
        setFinalPhaseStep(Math.min(FINAL_PHASE_BREAKDOWN.length - 1, Math.floor((seconds - 12) / 3)));
      }
    }, 800);

    return () => window.clearInterval(interval);
  }, [loading]);

  async function runAnalysis(nextSubreddit = subreddit) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subreddit: nextSubreddit.trim().replace(/^r\//i, ""),
        }),
      });

      const payload = (await response.json()) as AnalyzeIdeasResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Request failed.");
      }

      setResult(payload);
      setLastSubreddit(nextSubreddit);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected request error.");
    } finally {
      setLoading(false);
    }
  }

  const normalizedSubreddit = subreddit.trim().replace(/^r\//i, "") || "freelance";

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(11,11,14,0.85)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <a href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--accent)] font-display text-lg text-[var(--ink)]">
              S
            </div>
            <span className="font-display text-xl text-[var(--paper)]">ShipIt</span>
          </a>
        </div>
      </header>

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-16 sm:px-8 lg:px-10">
        {/* HERO */}
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
          <h1 className="font-display tracking-[-0.03em] leading-[0.96] text-[clamp(56px,9vw,144px)]">
            <span className="block">{HERO_LINE_1}</span>
            <span className="block">{HERO_LINE_2}</span>
            <span className="block text-[var(--accent)]">{HERO_ACCENT}</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-7 text-[var(--muted)] sm:text-xl sm:leading-8">
            {HERO_PITCH}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#run"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5"
            >
              Find me an idea →
            </a>
            <button
              type="button"
              onClick={() => setShowHow(true)}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] px-5 py-3 text-sm font-bold text-[var(--paper)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              See how it works
            </button>
          </div>
        </section>

        {/* APP RUN SECTION */}
        <section id="run" className="scroll-mt-24">
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
            <div className="space-y-5">
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                  Pick a subreddit
                </p>
                <h2 className="mt-3 font-display text-3xl tracking-tight text-[var(--paper)] sm:text-4xl">
                  Find an idea you can ship this week.
                </h2>
              </div>

              <label className="block space-y-2">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--dim)]">
                  Subreddit
                </span>
                <input
                  value={subreddit}
                  onChange={(event) => setSubreddit(event.target.value)}
                  placeholder="freelance"
                  className="w-full rounded-2xl border border-[var(--border)] bg-black/40 px-4 py-3 text-base text-[var(--paper)] outline-none transition placeholder:text-[var(--dim)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/20"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {EXAMPLE_SUBREDDITS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSubreddit(item)}
                    className="rounded-full border border-[var(--border)] bg-black/30 px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    r/{item}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => runAnalysis()}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-[10px] bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? "Mining Reddit..." : "Find me an idea →"}
                </button>

                <button
                  type="button"
                  onClick={() => runAnalysis(lastSubreddit)}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-[10px] border border-[var(--border)] bg-transparent px-5 py-3 text-sm font-bold text-[var(--paper)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Retry Last Run
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-[28px] border border-rose-400/40 bg-rose-500/10 p-5 text-rose-200">
              <p className="font-bold">Analysis failed</p>
              <p className="mt-2 text-sm leading-6">{error}</p>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--accent)]">
                    Analysis In Flight
                  </p>
                  <h2 className="font-display text-2xl tracking-tight text-[var(--paper)] sm:text-3xl">
                    Working through r/{normalizedSubreddit}
                  </h2>
                  <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
                    {LOADING_PHASES[loadingStep]}
                  </p>
                </div>
                <div className="rounded-[24px] border border-[var(--border)] bg-black/40 px-5 py-4 text-sm text-[var(--muted)]">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[var(--dim)]">
                    Elapsed
                  </p>
                  <p className="mt-2 font-display text-2xl text-[var(--paper)]">{elapsedSeconds}s</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-2 rounded-full bg-[var(--accent)] transition-all duration-700"
                  style={{ width: `${Math.min(92, 24 + loadingStep * 22 + elapsedSeconds * 2)}%` }}
                />
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-4">
                {LOADING_PHASES.map((phase, index) => {
                  const active = index <= loadingStep;

                  return (
                    <div
                      key={phase}
                      className={`rounded-[22px] border px-4 py-4 text-sm leading-6 transition ${
                        active
                          ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--paper)]"
                          : "border-[var(--border)] bg-black/30 text-[var(--dim)]"
                      }`}
                    >
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">
                        Step {index + 1}
                      </p>
                      <p className="mt-2">{phase}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-black/30 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[var(--dim)]">
                      Step 4 Breakdown
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      The last step still does a lot of work, so this breaks it down into smaller visible tasks.
                    </p>
                  </div>
                  <div className="rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">
                    {loadingStep < 3 ? "Queued" : "Running"}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {FINAL_PHASE_BREAKDOWN.map((item, index) => {
                    const active = loadingStep > 3 || (loadingStep === 3 && index <= finalPhaseStep);

                    return (
                      <div
                        key={item}
                        className={`rounded-[20px] border px-4 py-4 text-sm leading-6 transition ${
                          active
                            ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--paper)]"
                            : "border-[var(--border)] bg-black/40 text-[var(--dim)]"
                        }`}
                      >
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">
                          4.{index + 1}
                        </p>
                        <p className="mt-2">{item}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {result ? (
            <div className="mt-6 space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--accent)]">
                    Results
                  </p>
                  <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--paper)]">
                    r/{result.subreddit} produced {result.ideas.length} validated ideas
                  </h2>
                </div>
                <p className="text-sm text-[var(--dim)]">
                  Analyzed {result.source.posts.length} deduplicated source threads and their strongest comments.
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {result.ideas.map((idea) => (
                  <IdeaCard
                    key={`${idea.idea_name}-${idea.problem}`}
                    idea={idea}
                    onFindLeads={openLeads}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--accent)]">
                      Source Threads
                    </p>
                    <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--paper)]">
                      Review the original Reddit discussions
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--dim)]">
                    Open the original threads to validate the signal and dig deeper before building.
                  </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  {result.source.posts.map((post, index) => (
                    <SourcePill key={`${post.permalink}-${index}`} title={post.title} url={post.threadUrl} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      {/* "How it works" modal */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity duration-200 ${
          showHow ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setShowHow(false)}
        aria-hidden={!showHow}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-title"
          onClick={(event) => event.stopPropagation()}
          className={`relative w-full max-w-2xl rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] transition-all duration-200 sm:p-8 ${
            showHow ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                How it works
              </p>
              <h2
                id="how-title"
                className="mt-3 font-display text-3xl tracking-tight text-[var(--paper)] sm:text-4xl"
              >
                Behind the scenes.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowHow(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-lg leading-none text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <ol className="mt-6 space-y-3">
            {HOW_IT_WORKS.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-4 rounded-[20px] border border-[var(--border)] bg-black/30 px-4 py-3 text-sm leading-6 text-[var(--muted)]"
              >
                <span className="mt-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                  0{index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* "Find leads" modal */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity duration-200 ${
          activeLeadIdea ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setActiveLeadIdea(null)}
        aria-hidden={!activeLeadIdea}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leads-title"
          onClick={(event) => event.stopPropagation()}
          className={`relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] transition-all duration-200 sm:p-8 ${
            activeLeadIdea ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-[var(--accent)]">
                Find leads
              </p>
              <h2
                id="leads-title"
                className="mt-3 font-display text-2xl tracking-tight text-[var(--paper)] sm:text-3xl"
              >
                {activeLeadIdea?.idea_name ?? "Find leads"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveLeadIdea(null)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-lg leading-none text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="mt-6">
            {leadsLoading ? (
              <div className="space-y-3">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--dim)]">
                  Generating your outreach plan…
                </p>
                <div className="h-20 animate-pulse rounded-[20px] border border-[var(--border)] bg-black/30" />
                <div className="h-20 animate-pulse rounded-[20px] border border-[var(--border)] bg-black/30" />
                <div className="h-16 animate-pulse rounded-[20px] border border-[var(--border)] bg-black/30" />
              </div>
            ) : leadsError ? (
              <div className="rounded-[20px] border border-rose-400/40 bg-rose-500/10 p-4 text-rose-200">
                <p className="font-bold">Couldn&apos;t generate plan</p>
                <p className="mt-2 text-sm leading-6">{leadsError}</p>
              </div>
            ) : activeLeadIdea && leadsByIdea[activeLeadIdea.idea_name] ? (
              <div className="space-y-6">
                <section>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--dim)]">
                    Where to look
                  </p>
                  <div className="mt-3 space-y-3">
                    {leadsByIdea[activeLeadIdea.idea_name].platforms.map((platform, index) => (
                      <div
                        key={`${platform.name}-${index}`}
                        className="rounded-[20px] border border-[var(--border)] bg-black/30 px-4 py-4"
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                            0{index + 1}
                          </span>
                          <h3 className="font-display text-base text-[var(--paper)] sm:text-lg">
                            {platform.name}
                          </h3>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{platform.why}</p>
                        <div className="mt-3 rounded-[14px] border border-[var(--border)] bg-black/50 px-3 py-2">
                          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--dim)]">
                            Search / find
                          </p>
                          <p className="mt-1 font-mono text-xs leading-5 text-[var(--paper)] sm:text-sm">
                            {platform.search_query}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[var(--dim)]">
                    Outreach plan
                  </p>
                  <ol className="mt-3 space-y-2">
                    {leadsByIdea[activeLeadIdea.idea_name].outreach_plan.map((step, index) => (
                      <li
                        key={`${step}-${index}`}
                        className="flex items-start gap-4 rounded-[20px] border border-[var(--border)] bg-black/30 px-4 py-3 text-sm leading-6 text-[var(--muted)]"
                      >
                        <span className="mt-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                          0{index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
