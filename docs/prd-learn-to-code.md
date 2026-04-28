# PRD: Learn to Code Hub

## Overview

Build `/learn-to-code` as daily.dev's answer to "I want to learn to code — where do I start?" A hub page aggregating hundreds of programmatic SEO leaf pages, each curated by an AI agent with AI-native content (prompts-as-tutorials) and live daily.dev feed data. Captures high-impression "learn to code" head terms at the hub and long-tail beginner intent queries at the leaf level.

---

## User Stories

### Must-have

- As a career changer landing from Google, I want to immediately see paths relevant to my situation ("coding for marketers", "learn to code to get a job") so I don't bounce trying to figure out where to start.
- As a beginner on a leaf page (e.g. `/learn-to-code/python`), I want ready-to-paste prompts for Cursor/Claude Code so I can start building something real in 10 minutes, not finish a 20-hour course first.
- As someone who just vibe-coded something, I want to understand what the AI actually built so I'm learning concepts, not just copy-pasting forever.
- As a user exploring the hub, I want to see what's trending in the beginner community right now (live daily.dev content) so the page feels like a living resource, not a static blog post from 2024.
- As a search engine, I want well-structured JSON-LD, internal links between related leaf pages, and fresh content signals so the hub and leaves rank for their target queries.

### Nice-to-have

- As a returning user, I want to pick up where I left off (last visited leaf page surfaced on the hub).
- As a user finishing a beginner leaf page, I want a "what's next" recommendation linking to adjacent leaf pages.

---

## Architecture

### URL Structure

```
/learn-to-code                          ← The hub (aggregates everything below)
├── /learn-to-code/build/todo-app       ← Use case pages
├── /learn-to-code/build/portfolio-site
├── /learn-to-code/automate/email
├── /learn-to-code/automate/spreadsheets
├── /learn-to-code/python               ← Language/tool pages
├── /learn-to-code/javascript
├── /learn-to-code/cursor
├── /learn-to-code/vibe-coding          ← Technique pages
├── /learn-to-code/for/designers        ← Audience pages
├── /learn-to-code/for/marketers
└── ...hundreds more
```

### pSEO Dimensions

| Dimension | Examples | Long-tail queries captured |
|-----------|----------|---------------------------|
| **Use case** | build a todo app, automate tasks, make a website | "how to build a todo app" |
| **Language/tool** | Python, JavaScript, Cursor, Claude Code | "learn python for beginners" |
| **Audience** | designers, marketers, students, career changers | "coding for marketers" |
| **Technique** | vibe coding, pair programming with AI, test-driven | "vibe coding for beginners" |
| **Goal** | get a job, freelance, build a startup, automate work | "learn to code to get a job" |

---

## Hub Page (`/learn-to-code`)

Four sections:

1. **What do you want to build?** — use case cards linking to leaf pages
2. **Popular paths** — top-visited leaves, ranked by traffic (hardcoded initially, analytics-driven later)
3. **Fresh picks** — recently agent-updated pages, sorted by `lastUpdated`
4. **Trending on daily.dev** — dynamic feed data filtered by beginner/programming-basics tags

All sections render server-side at build time. "Trending on daily.dev" hydrates client-side via TanStack Query against existing feed API.

---

## Leaf Pages (`/learn-to-code/[...slug]`)

Dynamic catch-all route. Each leaf page renders:

1. **What & why** — one paragraph, agent-written, no fluff
2. **Start building** — progressive prompt sequence (3–7 prompts), labeled by tool (Cursor / Claude Code / Replit / generic). Prompts are first-class content — the new tutorials.
3. **Understand what you built** — key concepts the AI used, explained in plain language. Turns vibe-coding into actual learning.
4. **Go deeper** — curated external resources (tutorials, courses, videos, docs). Agent-curated, refreshed for dead links.
5. **Tools** — 2–4 AI coding tools recommended for this use case
6. **Communities** — daily.dev squads + relevant subreddits/discords
7. **Related daily.dev content** — dynamic feed filtered by leaf page's tags
8. **Related pages** — internal links to adjacent leaf pages (powers the pSEO linking mesh)

---

## Data Model

Each leaf page consumes a JSON file at `data/learn-to-code/{slug}.json`:

```ts
type LeafPageData = {
  slug: string;           // e.g. "python" or "build/todo-app"
  title: string;
  description: string;    // one paragraph — SEO meta + page intro
  dimension: 'language' | 'usecase' | 'audience' | 'technique' | 'goal';
  tags: string[];         // daily.dev tag slugs for feed + related content
  prompts: Prompt[];
  concepts: Concept[];    // "understand what you built"
  resources: Resource[];
  tools: Tool[];
  communities: Community[];
  relatedSlugs: string[]; // internal linking mesh
  lastUpdated: string;    // ISO date, agent stamps on refresh
};

type Prompt = {
  step: number;
  title: string;
  body: string;           // the actual prompt text
  tools: ('cursor' | 'claude-code' | 'replit' | 'generic')[];
};

type Concept = {
  name: string;
  explanation: string;    // plain language, 2-3 sentences
};

type Resource = {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'docs';
  free: boolean;
};

type Tool = {
  name: string;
  url: string;
  description: string;   // one-line rationale
};

type Community = {
  name: string;
  url: string;
  platform: 'dailydev' | 'reddit' | 'discord' | 'other';
};
```

A manifest file (`data/learn-to-code/manifest.json`) lists all slugs, titles, dimensions, and `lastUpdated`. Used by `getStaticPaths` and the hub page.

---

## The Curation Agent

Separate system that outputs JSON files. Responsibilities:

- Discover and curate quality resources across the web per page
- Generate/curate starter prompts per use case, versioned for different tools
- Write "understand what you built" concept explainers
- Refresh existing recommendations (dead links, outdated content)
- Identify new leaf pages worth creating (trending queries, emerging tools)
- Pull relevant daily.dev content per topic
- Stamp `lastUpdated` on each refresh

---

## Rendering & Performance

- `getStaticProps` + ISR with `revalidate: 3600` for leaf pages
- `fallback: 'blocking'` — pages generate on first request
- Pre-generate top ~50 leaf pages at build time once data is seeded
- Hub: ISR with `revalidate: 300` (5 min)

---

## SEO

- **Leaf JSON-LD**: `HowTo` schema for prompt sequence (each prompt = `HowToStep`), `CollectionPage` for resources, `BreadcrumbList`
- **Hub JSON-LD**: `CollectionPage` of featured leaf pages + `FAQPage` for common questions
- **Title pattern**: `"Learn [Topic] — Prompts, Resources & Community | daily.dev"`
- Canonical URLs enforced, no duplicate content across dimension combos
- `sr-only` anchor links to related leaf pages for link equity

---

## Technical Details

- **Routing**: `pages/learn-to-code/index.tsx` (hub) + `pages/learn-to-code/[...slug].tsx` (all leaves)
- **Feed integration**: Existing `HorizontalFeed` + `TAG_FEED_QUERY` filtered by leaf's tags
- **Squads integration**: Existing Squads API filtered by tags
- **Layout**: `PageWrapperLayout`, `getFooterNavBarLayout(getLayout(...))`, `max-w-6xl`
- **No new GraphQL**: All dynamic data uses existing queries. Leaf content is file-based.

---

## Out of Scope

- User accounts / personalization / progress tracking
- Generating leaf page JSON files (agent's job)
- A/B testing hub layout variants
- Mobile app surfaces
- User-submitted resources or community curation
- Search/filter UI within the hub
- Localization / non-English pages
