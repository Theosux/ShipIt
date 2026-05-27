# ShipIt 🚀

> **Make your first 1,000 RON without a job.** Mine weekly Reddit conversations for real problems people pay to solve, get a scored shortlist of side-hustle ideas you can ship this week, and pull a copy-paste outreach plan for each one.

ShipIt is a Next.js app built for students who want to earn money on their own terms instead of taking a part-time job. It reads what real people are actively complaining about on Reddit (English **and** Romanian), ranks the complaints by demand and willingness-to-pay, scores each opportunity, and — on demand — hands you a per-idea outreach playbook telling you *which platforms to use* and *how to make the first move*.

Built for the **"How to make your first 1,000 RON without a job"** student challenge.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=flat&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 📚 Table of contents

- [What ShipIt does](#-what-shipit-does)
- [Features](#-features)
- [The pipeline](#-the-pipeline)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Getting API keys](#-getting-api-keys)
- [Multilingual support](#-multilingual-support-english--romanian)
- [Performance & caching](#-performance--caching)
- [Project structure](#-project-structure)
- [API endpoints](#-api-endpoints)
- [Environment variables](#-environment-variables-reference)
- [Tech stack](#-tech-stack)
- [Available scripts](#-available-scripts)
- [License](#-license)

---

## 🎯 What ShipIt does

ShipIt turns a subreddit name into two things:

1. **A scored shortlist of side-hustle ideas** — each one grounded in real complaints from this week's top threads. Every idea comes with a problem statement, a target demand level, existing solutions, user complaints, an opportunity angle, a monetization model, a pricing hint, a revenue estimate, a go-to-market suggestion, and links back to the original Reddit threads that supported the idea.
2. **A per-idea outreach plan** — click "Find leads" on any idea and ShipIt returns 2–5 specific platforms where the target customer hangs out, each with a copy-paste-ready search query, plus a 3–6 step action plan covering prospecting, warming up, the first message, and follow-up.

It works on English subreddits (`r/freelance`, `r/smallbusiness`) **and** Romanian subreddits (`r/programare`, `r/RoAntreprenoriat`). All AI-generated output is forced into English so the analysis stays consistent across languages.

---

## ✨ Features

- 🔍 **Smart weekly Reddit scraping** — fetches top weekly posts and their highest-signal comments from any subreddit via the Decodo API. HTML is parsed with Cheerio.
- 🤖 **AI-powered idea generation** — Insforge AI (`gpt-4o-mini` by default) returns 1–10 validated SaaS / side-hustle ideas, each with full market context.
- 📊 **Opportunity scoring** — every idea ships with a 0–10 score, a verdict (`Weak` / `Decent` / `Strong`), and a demand level (`Low` / `Medium` / `High`).
- 💡 **Per-idea outreach playbook** — the "Find leads" button on each idea opens a modal with platforms, concrete search strategies, and a step-by-step outreach plan.
- 🌐 **Bilingual input, English output** — the AI prompt has an explicit `LANGUAGE RULE` that handles English and Romanian Reddit threads, but always returns the analysis in English. Source thread titles are preserved verbatim so Reddit links match.
- ⚡ **In-memory scrape cache** — re-running the same subreddit within 10 minutes skips the entire scraping phase, so retries are near-instant.
- 🎨 **Dark + orange marketing palette** — sticky brand header, big display headlines (Archivo Black + JetBrains Mono), 60-30-10 color ratio, accessible contrast, two animated modals (How it works / Find leads) with fade + scale + translate-y transitions.
- 🛡️ **Resilient pipeline** — Decodo strategy fallback with caching of the working strategy, AI JSON output is run through `jsonrepair` before Zod validation, sparse subreddits no longer crash the schema.
- ⌨️ **Keyboard & a11y** — modals close on `Escape`, click-outside, or `×`; body scroll is locked while open; ARIA roles wired up.

---

## 🚀 The pipeline

```
   ┌───────────────┐    ┌───────────────┐    ┌────────────────┐    ┌──────────────┐
   │ User picks    │ →  │ Decodo scrape │ →  │ Cheerio        │ →  │ Insforge AI  │ →  ideas[]
   │ a subreddit   │    │ (cached 10 m) │    │ extracts posts │    │ (gpt-4o-mini)│
   └───────────────┘    └───────────────┘    └────────────────┘    └──────────────┘
                                                                          │
                                          ┌───────────────────────────────┘
                                          ▼
   ┌──────────────────┐    ┌────────────────────────┐    ┌────────────────────────────┐
   │ User clicks      │ →  │ POST /api/leads        │ →  │ Insforge AI returns        │ →  modal renders
   │ "Find leads"     │    │ with the chosen idea   │    │ platforms[] + outreach[]   │    platforms + plan
   └──────────────────┘    └────────────────────────┘    └────────────────────────────┘
```

1. **Scrape** — Decodo fetches `old.reddit.com/r/{sub}/top/?t=week`. Three Decodo request strategies are tried in order, with the working one cached for subsequent calls.
2. **Structure** — Cheerio parses the listing and extracts up to **6 top posts** + each post's **top 3 comments** (concurrency 6, single batch).
3. **Cache** — the structured data is cached in-memory for 10 minutes, keyed by the lowercased subreddit name.
4. **Analyze** — the structured data is compacted, the `LANGUAGE RULE`-enforced system prompt is added, and Insforge AI returns strict JSON (validated with Zod, repaired with `jsonrepair` if needed).
5. **Render** — the UI shows scored idea cards with all fields plus the source threads.
6. **Find leads (on-demand, per idea)** — clicking the button hits `/api/leads`, which sends the idea to Insforge with the lead-generation prompt and returns `{ platforms[], outreach_plan[] }`. Results are cached client-side per idea, so re-opening is instant.

---

## 📋 Prerequisites

- **Node.js 20+**
- A **Decodo** API key — [decodo.com](https://visit.decodo.com/oNza7b)
- An **Insforge** API key — [insforge.dev](https://insforge.dev)

---

## 🛠️ Installation

1. **Clone & enter the project**
   ```bash
   git clone <your-repo-url> ShipIt
   cd ShipIt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**

   Create `.env.local` in the project root:
   ```bash
   # Required
   DECODO_API_KEY=your_decodo_api_key_here
   INSFORGE_API_KEY=your_insforge_api_key_here

   # Optional — Insforge tuning
   INSFORGE_URL=https://api.insforge.dev
   INSFORGE_MODEL=openai/gpt-4o-mini
   INSFORGE_RESULTS_TABLE=         # leave empty unless you've created the table
   INSFORGE_TIMEOUT_MS=90000

   # Optional — Decodo tuning
   DECODO_PROXY_POOL=premium
   DECODO_HEADLESS_MODE=html
   DECODO_TIMEOUT_MS=15000
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```

5. **Open the app** at [http://localhost:3000](http://localhost:3000)

---

## 🔑 Getting API keys

### Decodo
1. Sign up at [Decodo](https://visit.decodo.com/oNza7b).
2. Open your dashboard and copy your API key.
3. The `premium` proxy pool is the recommended default — it's faster and more reliable than `residential` for Reddit.

### Insforge
1. Sign up at [insforge.dev](https://insforge.dev).
2. Open your project settings and generate an API key.
3. The default model `openai/gpt-4o-mini` works well for both analysis and leads. Anthropic models work too if you change `INSFORGE_MODEL`.

---

## 🌐 Multilingual support (English + Romanian)

ShipIt ships with two Romanian subreddits in the suggested list (`r/programare`, `r/RoAntreprenoriat`) alongside English ones (`r/freelance`, `r/smallbusiness`). You can also type any subreddit name manually.

How the bilingual flow works:

- **Scraping** is language-agnostic — `old.reddit.com` serves Romanian threads identically, Cheerio handles UTF-8 + Romanian diacritics (ă/â/î/ș/ț) cleanly.
- The system prompt in `lib/insforge.ts` contains an explicit `LANGUAGE RULE` that:
  - Acknowledges input may be English, Romanian, or any other language.
  - **Forces every generated field into English** — `idea_name`, `problem`, `opportunity`, `monetization_model`, `pricing_hint`, `revenue_potential`, `go_to_market`, `user_complaints`, `existing_solutions`, `similar_competitors`, `demand_level`, `verdict`.
  - **Preserves `source_threads.title` and `source_threads.thread_url` exactly as-is**, so the source links in the UI still point to the real Romanian posts.
- The same English-output rule applies to `/api/leads` — outreach plans are always in English.

---

## ⚡ Performance & caching

ShipIt is tuned to land most analyses in 25–40 seconds, with cached retries dropping to under 20 seconds:

| Knob | Value | Why |
|---|---|---|
| `MAX_POSTS` (`lib/reddit.ts`) | 6 | Enough signal for the AI without paying for 8 comment scrapes. |
| `COMMENT_FETCH_CONCURRENCY` | 6 | All comment fetches run in a single batch. |
| `AI_POST_LIMIT` (`lib/insforge.ts`) | 6 | Matches `MAX_POSTS` so AI payload stays small. |
| AI `maxTokens` | 4096 | Enough room for 5–10 fully-fleshed ideas without truncation. |
| Decodo per-request timeout default | 15s | Bad strategies fail fast; healthy requests average 3–8s. |
| Route `maxDuration` | 300s | No more 60s hard wall on outlier runs. |
| Scrape cache TTL | 10 minutes | Repeat analyses of the same subreddit skip scraping. |
| Lead-plan cache | per-idea, client-side | Re-opening "Find leads" on the same idea is instant. |

---

## 📁 Project structure

```
ShipIt/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts          # POST: subreddit → scored ideas
│   │   └── leads/
│   │       └── route.ts          # POST: idea → outreach plan
│   ├── globals.css               # Dark + orange palette, CSS variables
│   ├── icon.svg                  # Favicon (orange "S" square)
│   ├── layout.tsx                # Root layout, font loading
│   └── page.tsx                  # Main UI + both modals
├── lib/
│   ├── env.ts                    # Zod-validated env, default values
│   ├── insforge.ts               # Idea-generation prompt, schema, parser
│   ├── leads.ts                  # Lead-plan prompt, schema, parser
│   ├── reddit.ts                 # Decodo scraping + Cheerio parsing + cache
│   └── types.ts                  # All TS interfaces
├── public/                       # Static assets
├── .env.local                    # Your secrets (create this)
├── next.config.ts                # devIndicators: false, etc.
├── package.json
└── tsconfig.json
```

---

## 🔌 API endpoints

### `POST /api/analyze`

Analyzes a subreddit and returns a scored list of side-hustle ideas.

**Request:**
```json
{ "subreddit": "freelance" }
```

The subreddit name accepts letters, digits, and underscores. The leading `r/` is stripped automatically. Romanian subreddits work the same way (`programare`, `RoAntreprenoriat`).

**Response (shape):**
```json
{
  "subreddit": "freelance",
  "source": {
    "subreddit": "freelance",
    "scrapedAt": "2026-05-27T17:00:00.000Z",
    "posts": [
      {
        "title": "...",
        "comments": ["...", "..."],
        "permalink": "/r/freelance/comments/abc123/...",
        "threadUrl": "https://www.reddit.com/r/freelance/comments/abc123/..."
      }
    ]
  },
  "ideas": [
    {
      "idea_name": "...",
      "problem": "...",
      "demand_level": "High",
      "existing_solutions": ["..."],
      "similar_competitors": ["..."],
      "user_complaints": ["..."],
      "opportunity": "...",
      "monetization_model": "...",
      "pricing_hint": "...",
      "revenue_potential": "...",
      "go_to_market": "...",
      "score": 8,
      "verdict": "Strong",
      "source_threads": [
        { "title": "...", "thread_url": "https://www.reddit.com/r/freelance/..." }
      ]
    }
  ]
}
```

### `POST /api/leads`

Generates a per-idea outreach plan. Called by the "Find leads" button in the UI.

**Request:**
```json
{
  "idea": {
    "idea_name": "...",
    "problem": "...",
    "opportunity": "...",
    "monetization_model": "...",
    "similar_competitors": ["..."],
    "pricing_hint": "...",
    "revenue_potential": "...",
    "go_to_market": "..."
  }
}
```

**Response:**
```json
{
  "platforms": [
    {
      "name": "LinkedIn",
      "why": "B2B decision-makers in this niche are searchable here.",
      "search_query": "(\"freelance\" OR \"contractor\") AND \"invoicing\" — title filter on \"founder\" OR \"owner\""
    },
    {
      "name": "Reddit — r/smallbusiness",
      "why": "Active community of bootstrappers actively venting about this exact problem.",
      "search_query": "site:reddit.com/r/smallbusiness \"invoicing\" OR \"late payments\""
    }
  ],
  "outreach_plan": [
    "Pull 20 prospects from LinkedIn using the search above; export to a CSV.",
    "Spend 3 days engaging with their posts (likes + thoughtful comments) before any DM.",
    "Send a 4-sentence message referencing their specific pain point and a 2-line preview of the solution.",
    "Wait 5 business days, then send one follow-up that adds new value (case study, useful link)."
  ]
}
```

---

## 🎨 Environment variables reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `DECODO_API_KEY` | ✅ | — | Decodo scraper key. |
| `INSFORGE_API_KEY` | ✅ | — | Insforge AI key. |
| `INSFORGE_URL` | ❌ | `https://api.insforge.dev` | Insforge base URL. |
| `INSFORGE_MODEL` | ❌ | `openai/gpt-4o-mini` | Model passed to `insforge.ai.chat.completions.create`. |
| `INSFORGE_RESULTS_TABLE` | ❌ | _(disabled)_ | If set, ideas are persisted to this Insforge table. The table must already exist. |
| `INSFORGE_TIMEOUT_MS` | ❌ | `90000` | Per-AI-request timeout. |
| `DECODO_PROXY_POOL` | ❌ | `premium` | Decodo proxy pool (`premium` recommended over `residential`). |
| `DECODO_HEADLESS_MODE` | ❌ | `html` | Headless rendering hint passed to Decodo. |
| `DECODO_TIMEOUT_MS` | ❌ | `15000` | Per-Decodo-request timeout. Lower = faster fail on bad strategy retries. |

---

## 🏗️ Tech stack

- **Framework** — Next.js 16 (App Router, Node runtime)
- **Language** — TypeScript 5
- **Styling** — Tailwind CSS v4 with CSS variables (`--ink`, `--card`, `--accent`, etc.)
- **Fonts** — Archivo, Archivo Black, JetBrains Mono (via `next/font/google`)
- **Web scraping** — `cheerio` + Decodo scraper API
- **AI** — `@insforge/sdk` (`ai.chat.completions.create`, OpenAI-compatible shape)
- **Validation** — `zod` (input schemas + AI output schemas)
- **JSON safety** — `jsonrepair` (recovers slightly-malformed AI JSON before Zod validation)

---

## 📝 Available scripts

```bash
npm run dev      # Start the dev server on http://localhost:3000
npm run build    # Production build
npm run start    # Start the production server
npm run lint     # Run ESLint
```

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

**Built for the "Make your first 1,000 RON without a job" challenge.**
