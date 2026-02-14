# PRD: AI Coding Hub

## Overview

A real-time aggregation feed for developers using AI coding assistants (Cursor, Copilot, Claude Code, Windsurf, Cline, etc.). Think of it as your AI coding Twitter replacement - a single place to catch everything happening in the vibe coding world without endless scrolling across platforms.

The goal: something you'd want to check multiple times per day, not once a month.

## Target Audience

Developers actively using AI coding assistants who currently rely on Twitter/X, Reddit, and Discord to stay current. They want:
- Real-time updates on what's happening right now
- Tactical content they can use immediately (not high-level overviews)
- Breaking news about tool updates, releases, and drama
- The best tweets, threads, and discussions without the noise

## Value Prop

**Real-time signal from everywhere, in one place.** We aggregate tactical AI coding content from Twitter, Reddit, GitHub, YouTube, and newsletters so you don't have to context-switch between platforms.

Two hooks:
1. **Feed** - Check multiple times per day for fresh content
2. **Sentiment** - Check daily to see which tools are winning (shareable, braggable for companies)

## User Stories

### Must-Have

**As an AI-assisted developer, I want to:**
- See a real-time feed of the best AI coding content from across the internet so I can stay current without checking 5 different platforms
- Know immediately when a major tool ships an update or has an outage
- Find tactical tips I can apply to my workflow right now (not theoretical overviews)
- Click through to the original source when something catches my interest
- Check which AI coding tools are trending up or down so I can see the ecosystem pulse at a glance

**Error/Edge Cases:**
- As a first-time visitor, the feed should be immediately useful without sign-in or configuration
- When data sources are down, show stale data with a timestamp rather than errors
- Content should load progressively - show what we have while fetching more

### Future Iteration (Community UGC)
- Community-submitted automation ideas and workflows (inspired by tinkerer.club model)
- Upvoting/curation of community content
- Ready-made automation templates (not just prompts - actual workflows)

## Key Requirements

### Real-Time Aggregated Feed (Core Feature)

The entire page is the feed. No dashboard, no charts - just content.

**Content Types (prioritized):**
1. **Twitter/X** - Tweets and threads from AI coding influencers, official tool accounts, viral discussions
2. **Reddit** - Top posts from r/cursor, r/ChatGPTCoding, r/ClaudeAI, r/LocalLLaMA (AI coding specific)
3. **GitHub** - Releases from major tools, trending AI coding repos, significant issues/discussions
4. **YouTube** - New videos from AI coding channels (ThePrimeagen, Fireship, etc.)
5. **Newsletters/Blogs** - Parsed highlights mentioning AI coding tools

**Feed Behavior:**
- Reverse chronological by default (newest first)
- Update frequency: Every 5 minutes or faster
- Target: 50-100+ items per day (high volume = reason to return)
- No personalization - everyone sees the same feed
- Infinite scroll

**Content Display:**
- Source icon/badge (Twitter, Reddit, GitHub, etc.)
- Timestamp (relative: "2 min ago", "1 hour ago")
- Preview/excerpt with key content visible
- Engagement metrics from source (likes, upvotes, stars)
- One-click to original source
- Expand inline for threads/longer content where possible

**Curation/Quality:**
- Strict scope: ONLY AI coding assistants - no general AI/ML, no LangChain tutorials, no "AI will take your job" takes
- Source allowlist: Verified accounts, known influencers, official tool accounts
- Minimum engagement threshold to filter noise
- Spam/bot detection
- Duplicate detection (same story across sources → group or dedupe)

**Sources to Track:**

*Twitter/X:*
- Official: @cursor_ai, @GitHubCopilot, @AnthropicAI, @windaborned, @caborned
- Influencers: AI coding focused accounts (curated list)
- Hashtags: #cursor, #copilot, #claudecode, #vibecoding, #aicoding

*Reddit:*
- r/cursor
- r/ChatGPTCoding
- r/ClaudeAI
- r/LocalLLaMA (filtered for coding content)

*GitHub:*
- Release feeds for: cursor, continue, aider, cline, cody
- Trending repos with AI coding tags
- Issues/discussions on major tools (high engagement only)

*YouTube:*
- Channel subscriptions for AI coding creators
- Search alerts for tool names + "tutorial", "review", "update"

**Non-Functional:**
- Page load: <2s initial content visible
- Feed refresh: Seamless, no full page reload
- Mobile: First-class experience, designed for quick checks on phone
- Offline: Show cached content if network unavailable

### Live Sentiment Dashboard (Secondary Feature)

A leaderboard-style view of AI coding tool momentum. The "check once a day" hook that also gives tools something to brag about ("We're #1 on daily.dev AI Pulse!").

**Functional:**
- Ranked list of major AI coding tools: Cursor, GitHub Copilot, Claude Code, Windsurf, Cline, Aider, Cody
- Show trending direction (up/down/flat) with visual indicators
- Display key metrics: mentions, sentiment score, momentum change
- "What's hot right now" callout for tools with significant shifts
- Shareable: Tools/companies can screenshot and share their ranking
- Update frequency: Every 15-30 minutes

**Data Sources:**
- Twitter/X: Mention volume, sentiment analysis
- GitHub: Star velocity, release activity
- Reddit: Post volume and sentiment in relevant subreddits
- npm: Download trends (where applicable)

**Non-Functional:**
- Must load in <2s
- Gracefully degrade if one data source fails (show partial data + timestamp)
- Mobile-responsive (simplified card view on mobile)

---

## Content Aggregation Guidelines

Guidelines for aggregating raw content (tweets, posts) into feed items.

### Freshness First

- **Tight time windows** - Don't aggregate content from weeks apart. Users checking multiple times a day want to see what happened in the last few hours, not a monthly digest.
- **One event per item** - Keep items granular. A product launch is one item, a tip thread is another. Don't create mega-summaries that mix unrelated topics.
- **Date-grouped display** - Items should naturally cluster by date (today, yesterday, 2 days ago) so users can quickly scan what's new since their last visit.

### Let Content Speak

- **No "why it matters" commentary** - This adds noise and feels preachy. If you need to explain why something matters, the headline failed.
- **Short summaries** - One or two sentences max. Sometimes empty if the headline IS the content (e.g., a hot take).
- **Quote directly** - Use the author's own words when they're compelling. Don't paraphrase into marketing speak.

### Feed Item Structure

```json
{
  "id": "news-unique-slug",
  "type": "news_item",
  "headline": "Short, scannable headline",
  "summary": "One sentence of context, or empty string",
  "date": "2026-02-05",
  "category": "feature|release|tip|drama|insight|milestone|hot_take",
  "tags": ["tool_name", "topic"],
  "source_tweet_id": "primary_tweet_id",
  "related_tweet_ids": ["supporting_tweet_ids"]
}
```

### Categories

- `product_launch` - New tool or major version
- `feature` - New capability in existing tool
- `release` - Version updates, patches
- `milestone` - User counts, funding, adoption data
- `tips` - Workflow advice from credible sources
- `insight` - Thoughtful commentary on the space
- `hot_take` - Spicy opinions, predictions
- `drama` - Competitive tensions, controversies
- `announcement` - Official company communications
- `endorsement` - Notable person recommends a tool
- `leak` - Unconfirmed but interesting signals

### What NOT to Include

- General AI/ML news unrelated to coding assistants
- "AI will take your job" doomer content
- Low-engagement posts from unknown accounts
- Duplicate coverage of the same event (pick the best source)
- Self-promotional content without substance
