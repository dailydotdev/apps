# Spec: Agents Arena (`/agents/arena`)

## What it is

A live leaderboard showing which AI coding agents and LLMs are winning the
developer mindshare race right now. Powered by real-time sentiment + mention
volume, crowned category winners, and a competitive energy that makes it worth
checking daily and sharing when your tool is on top.

The hook: **"Who's winning the race?"** — not a boring sentiment dashboard, but
a live arena where tools compete for developer love, and the D-Index tells you
who's ahead.

---

## URL Structure

```
/agents/arena                    → main page (Coding Agents tab default)
/agents/arena?tab=llms           → LLMs tab
/agents/arena/[slug]             → per-tool detail page
```

---

## Entity Groups

Each tab maps to a `groupId` on the `sentimentTimeSeries` API.

**Tab: Coding Agents** (`groupId: "coding-agents"`)
```
cursor, copilot, windsurf, cline, claude_code,
codex, aider, opencode, antigravity, kilocode
```

**Tab: LLMs** (`groupId: "llms"`)
```
claude_sonnet, claude_opus, gpt_5, gpt_codex,
deepseek, gemini, llama, qwen, kimi
```

---

## The D-Index

The D-Index is daily.dev's proprietary developer mindshare score. It measures
how much **positive attention** a tool is generating right now — combining raw
mention volume with sentiment polarity.

### Formulas

```typescript
// Raw from API: sentimentScore ∈ [-1, +1], volume = mention count per window

// Headline number — unbounded, rewards viral moments
dIndex = volume_24h × ((sentimentScore + 1) / 2)

// Love score — 0-100, used for bar fill and "Most Loved" crown
sentimentDisplay = Math.round(((sentimentScore + 1) / 2) × 100)

// Momentum — % change vs same 24h window yesterday
momentum = (dIndex_now - dIndex_24h_ago) / dIndex_24h_ago × 100

// Controversy — peaks at high volume + perfectly split sentiment
controversyScore = volume_24h × (1 - Math.abs(sentimentScore))
```

### Why unbounded

The D-Index has no ceiling. When a tool ships something huge or goes viral,
the number should explode — e.g. DeepSeek at peak: `180,000 × 0.62 = 111,600`.
This is intentional. Dramatic spikes are the point.

---

## Crown Categories

Four spotlight titles awarded to the current leader in each category.
Evaluated on a **rolling 24h window** — crowns can change at any moment.

| Crown | Awarded to | Minimum threshold |
|---|---|---|
| 👑 Most Loved | Highest `sentimentDisplay` | 100 mentions/24h |
| 🚀 Fastest Rising | Highest positive `momentum` | 50 mentions/24h |
| 🔥 Most Discussed | Highest raw `volume_24h` | — |
| ⚡ Most Controversial | Highest `controversyScore` | 200 mentions/24h |

**Unclaimed crowns:** If no tool meets the minimum threshold for a category,
the card displays "Unclaimed" with a grayed crown — not hidden. This signals
the category is actively contested and creates anticipation.

**Held for:** Each crown card shows how long the current holder has held it
(e.g. "Held for 31h") — adds drama and a reason to check back.

---

## Page Layout

### Header

Sticky. Shows page title, live freshness indicator, and tab switcher.

```
⚔️  THE ARENA                              ● Live · 2m ago
Real-time developer sentiment · Powered by the D-Index

[ Coding Agents ]  [ LLMs ]
```

- Pulsing green dot when data is fresh (<5min)
- Dot turns amber + "stale" label if last update was >5min ago
- Auto-refreshes every 30s

---

### Tier 1: The Crowns

Four cards in a horizontal scroll row (mobile) or 4-column grid (desktop).
These are the shareable trophies — the reason companies check this page.

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  👑 MOST LOVED   │ │  🚀 FASTEST      │ │  🔥 MOST         │ │  ⚡ MOST         │
│                  │ │     RISING       │ │     DISCUSSED    │ │     CONTROVERSIAL│
│  [Tool Logo]     │ │  [Tool Logo]     │ │  [Tool Logo]     │ │  [Tool Logo]     │
│  Cursor          │ │  Claude Code     │ │  DeepSeek        │ │  Copilot         │
│                  │ │                  │ │                  │ │                  │
│  94 / 100        │ │  ▲ +187%         │ │  111,600 D-Index │ │  Split: 51/49    │
│  Held for 31h    │ │  Held for 4h     │ │  Held for 12h    │ │  Held for 2h     │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
```

Each crown card:
- Crown emoji + category label
- Tool logo + name
- The stat that won it the crown (different per category)
- "Held for Xh" timestamp
- Subtle glow border in the tool's brand color
- Click → `/agents/arena/[slug]`

---

### Tier 2: Full Rankings

Sorted by D-Index descending. Rank positions animate when order changes.

```
 #    Tool           D-Index    Sentiment    Momentum    24h Vol
──────────────────────────────────────────────────────────────────
 1 🥇  Cursor         2,088     ████░ 87     ▲ +12%      2.4k
       ▁▂▃▄▅▆▇▇▆▅
──────────────────────────────────────────────────────────────────
 2 🥈  Claude Code    1,547     ███░░ 71     ▲  +5%      1.8k
       ▁▁▂▃▄▄▅▆▇▇
──────────────────────────────────────────────────────────────────
 3 🥉  Copilot        1,203     ███░░ 68      ━   0%     1.5k
       ▃▃▃▃▃▄▄▄▄▄
──────────────────────────────────────────────────────────────────
 4     Windsurf         454     ██░░░ 51     ▼  -8%       890
       ▅▄▄▃▃▂▂▂▁▁
──────────────────────────────────────────────────────────────────

─── EMERGING ──────────────────────────────────────────────────────
      Antigravity     Not enough data yet              < 50 mentions
      Kilocode        Not enough data yet
```

Each established row:
- Rank + medal (🥇🥈🥉 for top 3)
- Tool logo + name
- **D-Index** — the headline number, ticks live on update
- Sentiment bar (colored: green >70, amber 40–70, red <40) + numeric score
- Momentum delta with colored arrow (green/red/gray)
- 24h mention volume
- 7-point sparkline (7-day daily trend)

Live update behavior:
- D-Index number briefly flashes green (up) or red (down) on change
- Row slides up/down with transition when rank order changes

---

### Emerging Tools Section

Tools below the minimum data threshold are shown at the bottom, separated by
a divider, with no D-Index score. As volume crosses the threshold, they
graduate into the main rankings with an animation.

---

## Data Layer

### Primary query (on mount + every 30s)

```graphql
query ArenaData($groupId: ID!, $lookback: String!) {
  sentimentTimeSeries(
    resolution: QUARTER_HOUR
    groupId: $groupId
    lookback: $lookback
  ) {
    start
    resolutionSeconds
    entities {
      nodes {
        entity
        timestamps
        scores    # sentiment [-1, +1]
        volume    # mention count
      }
    }
  }
}
```

- Called twice on mount: once per tab group (`coding-agents`, `llms`)
- `lookback: "48h"` to have enough history for momentum calculation
- Refetched every 30s via TanStack Query `refetchInterval`

From the response we derive:
- **Current window** (latest data point) → `dIndex`, `sentimentDisplay`
- **Previous window** (latest point from 24h prior) → `momentum`
- **Last 7 daily buckets** → sparkline data

### Highlights query (lazy, on tool card click)

```graphql
query ToolHighlights($entity: String!, $after: String) {
  sentimentHighlights(entity: $entity, first: 20, after: $after) {
    items {
      url
      text
      author { handle avatarUrl }
      metrics { likeCount retweetCount impressionCount }
      createdAt
      sentiments { score highlightScore }
    }
    cursor
  }
}
```

Only fired when navigating to `/agents/arena/[slug]`.

---

## Real-Time Behavior

| Event | Behavior |
|---|---|
| Data refresh (every 30s) | D-Index values update; changed values flash green/red |
| Rank position change | Row slides up/down with CSS transition |
| New crown holder | Crown card updates; brief confetti burst on the card |
| Tool graduates from Emerging | Animates into main rankings with highlight flash |
| Stale data (>5min) | Live dot → amber; "Last updated" text goes muted |
| API down / error | Show last known data with timestamp; no error state shown |

---

## Per-Tool Detail Page: `/agents/arena/[slug]`

High-level shape (full spec separate):

- **Hero:** tool name, logo, current crown(s) if held
- **Live stats:** D-Index, sentiment score, current rank, 24h volume
- **Sentiment chart:** 48h time series (line chart, 15min resolution)
- **Top highlights:** paginated list of top tweets/posts, sorted by
  `highlightScore`, showing author, text, engagement metrics
- **Back:** breadcrumb to `/agents/arena`

---

## Open Questions

- **Slug mapping:** The API uses entity keys like `claude_code`. We need a
  mapping from slug (URL-safe) to entity key and display name/logo.
  Define this as a static config file.
- **Crown sharing:** OG image generation per crown card deferred to future
  iteration.
