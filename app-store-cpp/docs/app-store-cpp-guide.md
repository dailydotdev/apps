# daily.dev App Store — Custom Product Pages (CPP) Creative Guide

> Production-ready specification for 6 Custom Product Pages targeting distinct developer segments.
> Based on reverse-engineering the live App Store listing at [apps.apple.com/us/app/daily-dev/id6740634400](https://apps.apple.com/us/app/daily-dev/id6740634400).

---

## Part 1: Extracted Design System from Current Listing

### 1.1 Brand Identity

| Element | Value |
|---------|-------|
| **App Name** | daily.dev |
| **Subtitle** | The feed for developers |
| **Category** | News |
| **Tagline tone** | Confident, developer-native, no-fluff |
| **Voice** | Second-person ("Your feed"), benefit-led, concise |

### 1.2 Color System

The daily.dev brand uses a **dark-first** design system with food-themed color tokens.

#### Primary Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **cabbage-40** (Brand Default) | `#CE3DF3` | Primary accent, CTAs, highlights |
| **cabbage-50** (Brand Bolder) | `#C029F0` | Hover states, emphasis |
| **cabbage-20** (Brand Subtler) | `#E05CF8` | Secondary accent, glows |
| **onion-50** (Secondary) | `#5F37E9` | Gradient endpoints, depth |
| **onion-10** (Subtler) | `#9D70F8` | Light purple accents |

#### Background & Surface (Dark Theme — Default for App Store)

| Token | Hex | Usage |
|-------|-----|-------|
| **pepper-90** | `#0E1217` | Deep background |
| **pepper-80** | `#17191F` | Card surfaces |
| **pepper-70** | `#1C1F26` | Elevated surfaces |
| **pepper-60** | `#22262D` | Secondary surfaces |
| **pepper-50** | `#2D313A` | Borders, dividers |

#### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **salt-0** | `#FFFFFF` | Primary text, headlines |
| **salt-50** | `#CFD6E6` | Secondary text |
| **salt-70** | `#B9C2D9` | Tertiary/muted text |
| **salt-90** | `#A8B3CF` | Placeholder, disabled |

#### Status / Tag Colors

| Purpose | Token | Hex |
|---------|-------|-----|
| Success / Active | avocado-50 | `#1DDC6F` |
| Warning | bun-50 | `#FF7A2B` |
| Error | ketchup-50 | `#D52B20` |
| Info / Links | water-50 | `#3169F5` |
| AI / ML glow | blueCheese-40 | `#2CDCE6` |

#### Key Gradients (for screenshot backgrounds)

```
Hero gradient (cabbage → onion):
  radial-gradient(192.5% 100% at 50% 0%, #CE3DF3 0%, #5F37E9 50%, rgba(63,25,173,0) 100%)

Plus/Premium gradient:
  linear-gradient(135deg, #E769FB 0%, #9E70F8 44.71%, #68A6FD 100%)

Funnel gradient:
  radial-gradient at top, cabbage-40 → onion-50 → pepper-90

Subtle card glow:
  radial-gradient(ellipse, #C029F088 0%, transparent 400px)
```

### 1.3 Typography

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| **Hero headline** | ~32–36px (typo-mega3/large-title) | Bold | Screenshot main headline |
| **Supporting line** | ~17px (typo-body) | Regular | Subtitle / benefit line |
| **Tag / label** | ~13–14px (typo-footnote/subhead) | Bold | UI element labels, tags |
| **Caption** | ~11–12px (typo-caption1/2) | Regular | Micro-copy, metadata |

**Font stack**: Helvetica Neue, Inter, system-ui (sans-serif)

> **For App Store screenshots**: Use **SF Pro Display** (Bold) for headlines and **SF Pro Text** (Regular) for body copy to match iOS-native feel. Fall back to Inter for in-app UI captures.

### 1.4 Device Framing & Visual Treatment

| Element | Specification |
|---------|--------------|
| **Device** | iPhone 15 Pro / Pro Max frame (titanium, rounded corners) |
| **iPad** | iPad Pro frame (thin bezels) |
| **Angle** | Straight-on (0°) for most; slight 5–10° tilt for hero shots |
| **Shadow** | Soft drop shadow: 0 24px 48px rgba(0,0,0,0.4) |
| **Reflection** | None (clean, modern) |
| **Status bar** | Shown with realistic time, signal, battery |
| **Safe area** | Content inset ≥ 80px from edges on all sides |

### 1.5 Screenshot Layout Structure (Inferred from Standard daily.dev Marketing)

The current listing follows a **headline-above-device** layout pattern:

```
┌─────────────────────────┐
│                         │
│   HEADLINE (2 lines)    │  ← Bold, white text, centered
│   Supporting line        │  ← Lighter text, 1 line
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │   Device Frame  │   │  ← iPhone mockup with live UI
│   │   with App UI   │   │
│   │                 │   │
│   │                 │   │
│   └─────────────────┘   │
│                         │
│   ● ● ● (page dots)    │  ← Optional pagination hint
│                         │
└─────────────────────────┘
```

**Background treatment**: Deep dark (`#0E1217` → `#17191F`) with a subtle radial gradient glow in brand cabbage/onion behind the device, creating a "spotlight" effect on the UI.

### 1.6 Copywriting Patterns

| Pattern | Example |
|---------|---------|
| **Lead with benefit** | "Your personalized dev feed" |
| **Quantify trust** | "Used by 1M+ developers" |
| **Stack specificity** | "Tutorials, news, and insights tailored to your tech stack" |
| **Action-oriented** | "Discover", "Stay up to date", "Join" |
| **Anti-pain** | "Replaces the newsletter pile-up" |

### 1.7 Visual Rhythm

- **Headlines**: 3–6 words, single line preferred, max 2 lines
- **Supporting copy**: 8–15 words, single line
- **Screenshots tell a progressive story**: Awareness → Feature → Social Proof → Depth
- **First 2 screenshots**: Must communicate core value prop in under 2 seconds

---

## Part 2: Screenshot Resolutions Required

### iPhone (Required — provide both sets)

| Display | Resolution (Portrait) | Priority |
|---------|-----------------------|----------|
| **6.9" (Pro Max)** | **1320 × 2868 px** | Primary — design at this size |
| **6.7"** | 1290 × 2796 px | Auto-scales from 6.9" |
| **6.5"** | 1284 × 2778 px | Auto-scales from 6.9" |

> **Recommendation**: Design all iPhone screenshots at **1320 × 2868 px**. Apple will scale down for smaller displays.

### iPad (Required)

| Display | Resolution (Portrait) | Priority |
|---------|-----------------------|----------|
| **13" (iPad Pro)** | **2064 × 2752 px** | Primary — design at this size |
| **12.9"** | 2048 × 2732 px | Auto-scales from 13" |

> **Recommendation**: Design all iPad screenshots at **2064 × 2752 px**. Apple will scale down.

### Deliverables per CPP

| Asset | Count | Sizes |
|-------|-------|-------|
| iPhone screenshots | 6–8 per CPP | 1320 × 2868 px |
| iPad screenshots | 6–8 per CPP | 2064 × 2752 px |
| **Total per CPP** | **12–16 assets** | — |
| **Total for 6 CPPs** | **72–96 assets** | — |

---

## Part 3: Full Screenshot Plans for All 6 CPPs

> Each CPP follows the same 8-screenshot sequence structure. Screenshots 1–3 are visible in search results and must be scroll-stopping.

---

### CPP 1: AI / ML Developers

**Ad/Search headline**: "Your AI & ML News Feed"
**Subtitle override (if using CPP promotional text)**: "LLMs, agents, prompts, and ML papers from 500+ sources"

#### Screenshot 1 — Hero / Hook

| Element | Specification |
|---------|--------------|
| **Headline** | Your AI News Feed |
| **Supporting line** | LLMs, agents, prompts & ML papers — updated in real time |
| **UI shown** | Feed view with AI-tagged posts prominently displayed. Posts showing titles like "GPT-5 architecture deep dive", "LangChain vs CrewAI", "New diffusion model paper" |
| **Visual emphasis** | AI/ML tag pills glowing in blueCheese (`#2CDCE6`). Tag filter bar at top showing "AI", "Machine Learning", "LLM" selected |
| **Background** | Deep pepper-90 with radial blueCheese glow behind device |
| **Micro-copy overlay** | "500+ AI sources" badge in top-left corner |

#### Screenshot 2 — Signal Filtering

| Element | Specification |
|---------|--------------|
| **Headline** | Cut Through the Noise |
| **Supporting line** | Only the AI content that matters to you |
| **UI shown** | Tag customization screen with AI-related tags (Machine Learning, LLM, GPT, Agents, Prompt Engineering, Computer Vision, NLP) toggled on. Other tags dimmed |
| **Visual emphasis** | Active tags highlighted with cabbage gradient borders. Counter showing "127 new posts today" |
| **Background** | Gradient fade from blueCheese-subtle to pepper-90 |
| **Micro-copy overlay** | None |

#### Screenshot 3 — Trending Content

| Element | Specification |
|---------|--------------|
| **Headline** | Trending in AI Today |
| **Supporting line** | What 1M+ developers are reading right now |
| **UI shown** | "Most Upvoted" feed tab active, showing high-engagement AI posts with upvote counts (2.4K, 1.8K, 956). Source icons visible (arXiv, Hugging Face blog, OpenAI blog) |
| **Visual emphasis** | Upvote counts highlighted in avocado green. Fire/trending indicators |
| **Background** | Deep pepper-90 with subtle cabbage radial glow |
| **Micro-copy overlay** | "Real-time" timestamp badge on top post |

#### Screenshot 4 — AI Search

| Element | Specification |
|---------|--------------|
| **Headline** | AI-Powered Search |
| **Supporting line** | Ask technical questions, get accurate answers |
| **UI shown** | AI search interface with query "How do transformer attention mechanisms scale?" and a structured answer with source citations |
| **Visual emphasis** | Search bar glowing with cabbage/blueCheese gradient. Answer card with clean formatting |
| **Background** | Dark with subtle blueCheese radial accent |
| **Micro-copy overlay** | None |

#### Screenshot 5 — Research Papers & GitHub

| Element | Specification |
|---------|--------------|
| **Headline** | Papers & Repos in One Feed |
| **Supporting line** | arXiv, GitHub trending, and dev blogs together |
| **UI shown** | Feed showing mixed content: an arXiv paper card, a GitHub repo card with stars count, a blog post from ML blog. Source diversity visible |
| **Visual emphasis** | GitHub star counts and arXiv icons. Source badges prominent |
| **Background** | Pepper-90 with onion gradient glow |
| **Micro-copy overlay** | None |

#### Screenshot 6 — Developer Squads

| Element | Specification |
|---------|--------------|
| **Headline** | Join AI Communities |
| **Supporting line** | Discuss models, share papers, build together |
| **UI shown** | Squads discovery page filtered to AI category. Squad cards showing member counts, recent activity. Squads like "LLM Builders", "ML Paper Club" |
| **Visual emphasis** | Member avatars, activity indicators in avocado green |
| **Background** | Pepper-90 with cabbage radial gradient |
| **Micro-copy overlay** | "50K+ AI developers" badge |

#### Screenshot 7 — Bookmarks & Save

| Element | Specification |
|---------|--------------|
| **Headline** | Save What Matters |
| **Supporting line** | Bookmark and organize your AI reading list |
| **UI shown** | Bookmarks view with organized folders: "ML Papers", "LLM Tutorials", "Agent Architectures". Posts with bookmark icons active |
| **Visual emphasis** | Bookmark icons highlighted in bun/orange (`#FF7A2B`). Folder structure clean |
| **Background** | Consistent dark treatment |
| **Micro-copy overlay** | None |

#### Screenshot 8 — Profile & Social Proof

| Element | Specification |
|---------|--------------|
| **Headline** | Built for Developers |
| **Supporting line** | Trusted by engineers at top AI companies |
| **UI shown** | Developer profile (DevCard) showing AI-related reading streaks, tags, reputation. Company logos subtly visible |
| **Visual emphasis** | DevCard with gradient border (cabbage → onion → water). Streak counter prominent |
| **Background** | Hero gradient (cabbage → onion) fading to pepper-90 |
| **Micro-copy overlay** | "1M+ developers" trust badge |

---

### CPP 2: Frontend / React Developers

**Ad/Search headline**: "Your Frontend Dev Feed"
**Subtitle override**: "React, JS, TypeScript & CSS curated for frontend engineers"

#### Screenshot 1 — Hero / Hook

| Element | Specification |
|---------|--------------|
| **Headline** | Your React & JS Feed |
| **Supporting line** | Curated for frontend engineers who want to stay sharp |
| **UI shown** | Feed with frontend-focused posts: "React 20 — What's New", "CSS Container Queries Deep Dive", "TypeScript 6.0 Migration Guide". React/JS/CSS tag pills visible |
| **Visual emphasis** | Tag pills for React (water blue `#3169F5`), JavaScript (cheese yellow `#FFDF00`), TypeScript (water blue), CSS highlighted |
| **Background** | Deep pepper-90 with water-blue radial glow behind device |
| **Micro-copy overlay** | "1,300+ sources" badge |

#### Screenshot 2 — Stack Personalization

| Element | Specification |
|---------|--------------|
| **Headline** | Matched to Your Stack |
| **Supporting line** | React, Next.js, Tailwind, TypeScript — and more |
| **UI shown** | Tag selection / onboarding screen with frontend tags prominently selected: React, JavaScript, TypeScript, CSS, Next.js, Tailwind CSS, Vue, Svelte. Non-frontend tags visible but unselected |
| **Visual emphasis** | Selected tags with vivid color borders matching their ecosystems. Progress indicator showing personalization |
| **Background** | Gradient from water-blue to pepper-90 |
| **Micro-copy overlay** | None |

#### Screenshot 3 — Practical Tutorials

| Element | Specification |
|---------|--------------|
| **Headline** | Tutorials That Ship |
| **Supporting line** | Practical guides, not theory — from devs who build |
| **UI shown** | Feed showing tutorial-focused posts with code snippet previews. Posts like "Build a drag-and-drop with React DnD", "Animate page transitions in Next.js". Reading time badges visible |
| **Visual emphasis** | Code preview cards with syntax highlighting. Reading time badges in salt-70 |
| **Background** | Pepper-90 with subtle cabbage glow |
| **Micro-copy overlay** | None |

#### Screenshot 4 — Trending Frontend

| Element | Specification |
|---------|--------------|
| **Headline** | What's Trending in Frontend |
| **Supporting line** | The posts frontend devs are upvoting right now |
| **UI shown** | "Most Upvoted" view with high-engagement frontend content. Visible sources: CSS-Tricks, Smashing Magazine, Dan Abramov's blog, Kent C. Dodds |
| **Visual emphasis** | Upvote counts in avocado green. Source logos recognizable |
| **Background** | Dark with subtle water-blue accent |
| **Micro-copy overlay** | None |

#### Screenshot 5 — UI Pattern Discovery

| Element | Specification |
|---------|--------------|
| **Headline** | Discover UI Patterns |
| **Supporting line** | Components, design systems, and CSS tricks |
| **UI shown** | Feed filtered to UI/design content. Posts showing visual thumbnails of UI components, design system updates, accessibility guides |
| **Visual emphasis** | Visual thumbnails prominent. Clean card layout |
| **Background** | Pepper-90 standard |
| **Micro-copy overlay** | None |

#### Screenshot 6 — Communities

| Element | Specification |
|---------|--------------|
| **Headline** | Join Frontend Squads |
| **Supporting line** | React, Vue, Angular communities in one place |
| **UI shown** | Squads page filtered to frontend. Squad cards: "React Developers", "CSS Wizards", "TypeScript Community". Member counts, recent discussions |
| **Visual emphasis** | Squad avatars, member count badges |
| **Background** | Cabbage radial gradient |
| **Micro-copy overlay** | None |

#### Screenshot 7 — Bookmarks

| Element | Specification |
|---------|--------------|
| **Headline** | Your Reading List |
| **Supporting line** | Save and organize the best frontend content |
| **UI shown** | Bookmarks view with folders: "React Patterns", "CSS Tips", "TypeScript Guides" |
| **Visual emphasis** | Bookmark icons in bun orange. Clean folder UI |
| **Background** | Consistent dark |
| **Micro-copy overlay** | None |

#### Screenshot 8 — Profile

| Element | Specification |
|---------|--------------|
| **Headline** | Show Your Expertise |
| **Supporting line** | Build a profile that frontend teams notice |
| **UI shown** | Developer profile with frontend-focused tags, reading streak, reputation score. DevCard variant |
| **Visual emphasis** | DevCard gradient, streak counter, tag badges |
| **Background** | Hero gradient fading to dark |
| **Micro-copy overlay** | "1M+ developers" |

---

### CPP 3: Career Growth

**Ad/Search headline**: "Level Up Your Dev Career"
**Subtitle override**: "Salary insights, interview prep & career advice from thousands of devs"

#### Screenshot 1 — Hero / Hook

| Element | Specification |
|---------|--------------|
| **Headline** | Level Up Your Career |
| **Supporting line** | Salary insights, interview prep & career advice |
| **UI shown** | Feed showing career-focused posts: "How I went from junior to staff in 3 years", "2026 Developer Salary Report", "System Design Interview Cheat Sheet". Career tag highlighted |
| **Visual emphasis** | Career/Growth tag pills in lettuce green (`#92F21D`). High engagement counts visible |
| **Background** | Pepper-90 with lettuce-green radial glow behind device |
| **Micro-copy overlay** | "Bookmarked by thousands" badge |

#### Screenshot 2 — High-Signal Discussions

| Element | Specification |
|---------|--------------|
| **Headline** | Real Career Advice |
| **Supporting line** | From developers who've been there |
| **UI shown** | "Best Discussions" feed tab active. Discussion posts with high comment counts about career topics. Comment previews visible showing thoughtful responses |
| **Visual emphasis** | Comment count badges prominent. Discussion quality indicators |
| **Background** | Subtle lettuce gradient to dark |
| **Micro-copy overlay** | None |

#### Screenshot 3 — Bookmarked Content

| Element | Specification |
|---------|--------------|
| **Headline** | Save Career Insights |
| **Supporting line** | Bookmark the advice that changes your trajectory |
| **UI shown** | Bookmarks view organized by career topics: "Interview Prep", "Salary Negotiation", "Resume Tips", "Side Projects". Populated with relevant saved posts |
| **Visual emphasis** | Bookmark folders with post counts. Bun orange bookmark icons |
| **Background** | Pepper-90 standard |
| **Micro-copy overlay** | None |

#### Screenshot 4 — Developer Profile

| Element | Specification |
|---------|--------------|
| **Headline** | Stand Out to Recruiters |
| **Supporting line** | Build a profile that showcases your growth |
| **UI shown** | Full developer profile page showing skills, achievements, reading activity, reputation. Bio, company info, and DevCard |
| **Visual emphasis** | Profile completeness indicators. Achievement badges. DevCard with gradient |
| **Background** | Cabbage gradient glow |
| **Micro-copy overlay** | None |

#### Screenshot 5 — Community Knowledge

| Element | Specification |
|---------|--------------|
| **Headline** | Learn From Senior Devs |
| **Supporting line** | Career squads with thousands of active members |
| **UI shown** | Squad discussion thread about "How to negotiate a raise as a mid-level dev" with thoughtful replies, upvotes, and engagement |
| **Visual emphasis** | Reply thread UI with author badges. Upvote interactions |
| **Background** | Dark standard |
| **Micro-copy overlay** | None |

#### Screenshot 6 — Personalized Feed

| Element | Specification |
|---------|--------------|
| **Headline** | Your Growth Feed |
| **Supporting line** | Career content matched to your experience level |
| **UI shown** | Feed with career + technical content mix. Tags visible: "Career", "Interview", "Leadership", "Productivity" |
| **Visual emphasis** | Tag diversity, mix of content types |
| **Background** | Pepper-90 |
| **Micro-copy overlay** | None |

#### Screenshot 7 — Reading Streaks

| Element | Specification |
|---------|--------------|
| **Headline** | Stay Consistent |
| **Supporting line** | Build a daily learning habit with streaks |
| **UI shown** | Reading streak UI showing weekly/monthly progress. Calendar heatmap of reading activity. Current streak counter prominent |
| **Visual emphasis** | Streak flame icon, heatmap in avocado green, counter numbers bold |
| **Background** | Dark with avocado accent |
| **Micro-copy overlay** | None |

#### Screenshot 8 — Trust / Social Proof

| Element | Specification |
|---------|--------------|
| **Headline** | Join 1M+ Developers |
| **Supporting line** | The career platform developers trust |
| **UI shown** | Onboarding or home screen showing community stats, company logos of where daily.dev users work, testimonial-style UI elements |
| **Visual emphasis** | Company logos row (Google, Meta, Amazon, etc. if available). Large community stat numbers |
| **Background** | Hero gradient (cabbage → onion) |
| **Micro-copy overlay** | "1 in 50 developers worldwide" |

---

### CPP 4: Software Architecture

**Ad/Search headline**: "Architecture Deep Dives"
**Subtitle override**: "System design, patterns & scalability deep-dives for senior engineers"

#### Screenshot 1 — Hero / Hook

| Element | Specification |
|---------|--------------|
| **Headline** | Architecture Deep Dives |
| **Supporting line** | System design, patterns & scalability for senior engineers |
| **UI shown** | Feed showing architecture-heavy posts: "Scaling to 10M Users: Our Migration Story", "CQRS vs Event Sourcing", "Distributed Systems Patterns". Architecture/System Design tags visible |
| **Visual emphasis** | Tags in onion purple (`#5F37E9`). Post titles emphasizing depth. Long-read indicators |
| **Background** | Pepper-90 with onion-purple radial glow |
| **Micro-copy overlay** | "Senior-level content" badge |

#### Screenshot 2 — Discussion Quality

| Element | Specification |
|---------|--------------|
| **Headline** | Expert Discussions |
| **Supporting line** | Where senior engineers debate design decisions |
| **UI shown** | "Best Discussions" view showing architecture debates. High-quality comments with upvotes. Thread depth visible |
| **Visual emphasis** | Comment quality indicators, deep thread UI. Author reputation badges |
| **Background** | Onion gradient to dark |
| **Micro-copy overlay** | None |

#### Screenshot 3 — Curated Sources

| Element | Specification |
|---------|--------------|
| **Headline** | Trusted Engineering Blogs |
| **Supporting line** | Martin Fowler, InfoQ, Netflix Tech, and 500+ more |
| **UI shown** | Sources page showing high-quality engineering blogs. Source cards with follower counts and post frequency. Recognizable tech company engineering blog icons |
| **Visual emphasis** | Source logos prominent. Follower counts as social proof |
| **Background** | Pepper-90 standard |
| **Micro-copy overlay** | "500+ sources" badge |

#### Screenshot 4 — Long-Form Content

| Element | Specification |
|---------|--------------|
| **Headline** | Long Reads That Matter |
| **Supporting line** | Deep technical content, not clickbait |
| **UI shown** | Feed with reading time badges visible (12 min, 18 min, 25 min). Post cards showing architecture diagrams as thumbnails |
| **Visual emphasis** | Reading time badges prominent. Thumbnail images of system diagrams |
| **Background** | Dark standard |
| **Micro-copy overlay** | None |

#### Screenshot 5 — Bookmarks & Organization

| Element | Specification |
|---------|--------------|
| **Headline** | Build Your Reference Library |
| **Supporting line** | Organize architecture patterns and design docs |
| **UI shown** | Bookmarks with folders: "System Design", "Microservices", "Database Patterns", "Scalability". Rich post previews |
| **Visual emphasis** | Folder structure, post counts per folder |
| **Background** | Pepper-90 |
| **Micro-copy overlay** | None |

#### Screenshot 6 — Architecture Squads

| Element | Specification |
|---------|--------------|
| **Headline** | Architecture Communities |
| **Supporting line** | Join squads where architects share knowledge |
| **UI shown** | Squads discovery showing: "System Design", "Microservices Patterns", "Cloud Architecture". Member counts in thousands |
| **Visual emphasis** | Large member counts, active discussion indicators |
| **Background** | Cabbage radial glow |
| **Micro-copy overlay** | None |

#### Screenshot 7 — Search & Discovery

| Element | Specification |
|---------|--------------|
| **Headline** | Search Any Pattern |
| **Supporting line** | Find architecture decisions and trade-off analyses |
| **UI shown** | Search interface with query "event-driven architecture vs saga pattern" showing relevant results with source quality indicators |
| **Visual emphasis** | Search results with relevance scores, source badges |
| **Background** | Dark with subtle onion glow |
| **Micro-copy overlay** | None |

#### Screenshot 8 — Developer Profile

| Element | Specification |
|---------|--------------|
| **Headline** | Your Engineering Identity |
| **Supporting line** | A profile that reflects your architectural depth |
| **UI shown** | DevCard/Profile showing architecture-focused tags, senior-level reputation, reading depth |
| **Visual emphasis** | DevCard gradient, expertise tags, reputation number |
| **Background** | Hero gradient |
| **Micro-copy overlay** | "1M+ developers" |

---

### CPP 5: DevTools & Productivity

**Ad/Search headline**: "Dev Tools & Productivity"
**Subtitle override**: "Tools, workflows & productivity hacks top developers actually use"

#### Screenshot 1 — Hero / Hook

| Element | Specification |
|---------|--------------|
| **Headline** | Tools Devs Actually Use |
| **Supporting line** | Discover workflows and productivity hacks from top engineers |
| **UI shown** | Feed showing tool-focused posts: "10 VS Code Extensions I Can't Live Without", "Why I Switched to Warp Terminal", "The Best Git Workflow for Teams". DevTools/Productivity tags visible |
| **Visual emphasis** | Tags in bun orange (`#FF7A2B`). Tool icons/logos in post thumbnails |
| **Background** | Pepper-90 with bun-orange radial glow behind device |
| **Micro-copy overlay** | "Updated daily" badge |

#### Screenshot 2 — Signal Filtering

| Element | Specification |
|---------|--------------|
| **Headline** | Filter the Signal |
| **Supporting line** | Only the tools and workflows that matter to you |
| **UI shown** | Tag selection with DevTools-related tags highlighted: "Developer Tools", "Productivity", "CLI", "IDE", "Git", "Docker", "CI/CD", "Terminal" |
| **Visual emphasis** | Selected tags with bright borders. Clean toggle UI |
| **Background** | Bun gradient fade to dark |
| **Micro-copy overlay** | None |

#### Screenshot 3 — Trending Tools

| Element | Specification |
|---------|--------------|
| **Headline** | Trending Tools This Week |
| **Supporting line** | What the dev community is buzzing about |
| **UI shown** | "Most Upvoted" feed showing tool-related posts with massive engagement. Posts about new releases, comparisons, "I built this" tools |
| **Visual emphasis** | Upvote counts in avocado. Source diversity (Product Hunt, GitHub, dev blogs) |
| **Background** | Pepper-90 with subtle cabbage glow |
| **Micro-copy overlay** | None |

#### Screenshot 4 — Workflow Discovery

| Element | Specification |
|---------|--------------|
| **Headline** | Optimize Your Workflow |
| **Supporting line** | Automation, shortcuts, and setup guides |
| **UI shown** | Feed content showing workflow optimization posts. Mix of terminal screenshots, config files, automation diagrams in thumbnails |
| **Visual emphasis** | Diverse content types (video, article, discussion). Clean card layout |
| **Background** | Dark standard |
| **Micro-copy overlay** | None |

#### Screenshot 5 — AI Search for Tools

| Element | Specification |
|---------|--------------|
| **Headline** | Ask About Any Tool |
| **Supporting line** | AI-powered answers for tool comparisons |
| **UI shown** | Search with query "Docker vs Podman for local development" showing structured comparison answer with pros/cons |
| **Visual emphasis** | Search answer formatting. Source citations |
| **Background** | Dark with blueCheese accent |
| **Micro-copy overlay** | None |

#### Screenshot 6 — Communities

| Element | Specification |
|---------|--------------|
| **Headline** | DevTools Communities |
| **Supporting line** | Share setups and get recommendations |
| **UI shown** | Squads: "Terminal Enthusiasts", "VS Code Power Users", "DevOps Tools". Active discussion previews |
| **Visual emphasis** | Member counts, recent post previews |
| **Background** | Cabbage radial gradient |
| **Micro-copy overlay** | None |

#### Screenshot 7 — Save & Organize

| Element | Specification |
|---------|--------------|
| **Headline** | Your Toolbox |
| **Supporting line** | Bookmark tools to try and workflows to adopt |
| **UI shown** | Bookmarks with folders: "To Try", "My Setup", "Team Tools", "Automation" |
| **Visual emphasis** | Folder icons, post counts, clean organization |
| **Background** | Pepper-90 |
| **Micro-copy overlay** | None |

#### Screenshot 8 — Daily Habit

| Element | Specification |
|---------|--------------|
| **Headline** | Stay Ahead, Daily |
| **Supporting line** | 5 minutes a day to discover what's new |
| **UI shown** | Presidential Briefing / daily digest UI showing tool-related daily summary. Reading streak visible |
| **Visual emphasis** | Briefing card with gradient. Streak counter |
| **Background** | Hero gradient |
| **Micro-copy overlay** | "1M+ developers" |

---

### CPP 6: Open Source & Linux

**Ad/Search headline**: "Open Source & Linux Feed"
**Subtitle override**: "Trending repos, GitHub projects & Linux updates in one developer feed"

#### Screenshot 1 — Hero / Hook

| Element | Specification |
|---------|--------------|
| **Headline** | Your Open Source Feed |
| **Supporting line** | Trending repos, GitHub projects & Linux updates |
| **UI shown** | Feed with OSS-focused posts: "This Week's Hottest GitHub Repos", "Linux 7.0 Kernel Changes", "Contributing to Open Source: A Guide". Open Source/GitHub/Linux tags visible |
| **Visual emphasis** | Tags in avocado green (`#1DDC6F`). GitHub star counts visible on repo cards |
| **Background** | Pepper-90 with avocado-green radial glow behind device |
| **Micro-copy overlay** | "Updated in real time" badge |

#### Screenshot 2 — GitHub Integration

| Element | Specification |
|---------|--------------|
| **Headline** | GitHub in Your Feed |
| **Supporting line** | Trending repos and releases, no extra tabs |
| **UI shown** | Feed showing GitHub-sourced content. Repo cards with stars, forks, language badges. Mix of trending repos and release announcements |
| **Visual emphasis** | GitHub-style stats (stars ⭐, forks 🍴). Language color dots. Clean repo card UI |
| **Background** | Avocado gradient to dark |
| **Micro-copy overlay** | None |

#### Screenshot 3 — Linux Ecosystem

| Element | Specification |
|---------|--------------|
| **Headline** | Linux News, Curated |
| **Supporting line** | Kernel updates, distro releases, and sysadmin guides |
| **UI shown** | Feed filtered to Linux content. Posts from sources like LWN.net, Phoronix, OMG Ubuntu. Visible tags: Linux, Ubuntu, Kernel, Sysadmin |
| **Visual emphasis** | Linux-related source logos. Tags in avocado/lettuce green palette |
| **Background** | Pepper-90 with subtle lettuce glow |
| **Micro-copy overlay** | None |

#### Screenshot 4 — Trending This Week

| Element | Specification |
|---------|--------------|
| **Headline** | Trending in Open Source |
| **Supporting line** | The repos and projects developers are watching |
| **UI shown** | "Most Upvoted" showing OSS content. High engagement counts. Posts about new frameworks, libraries, and tools gaining traction |
| **Visual emphasis** | Upvote counts in avocado. Trending indicators |
| **Background** | Dark standard |
| **Micro-copy overlay** | None |

#### Screenshot 5 — Community Discussions

| Element | Specification |
|---------|--------------|
| **Headline** | OSS Communities |
| **Supporting line** | Join squads of open source contributors |
| **UI shown** | Squads: "Open Source Contributors", "Linux Users", "Rust Community", "Go Developers". Discussion previews about contributing, reviewing PRs |
| **Visual emphasis** | Active member counts, contribution-themed discussions |
| **Background** | Cabbage radial gradient |
| **Micro-copy overlay** | "50K+ OSS developers" |

#### Screenshot 6 — Source Discovery

| Element | Specification |
|---------|--------------|
| **Headline** | 500+ OSS Sources |
| **Supporting line** | From GitHub Trending to niche project blogs |
| **UI shown** | Sources page filtered to open source. Source cards showing GitHub, GitLab, Linux-focused blogs, language-specific community blogs |
| **Visual emphasis** | Source logos, follower counts, post frequency stats |
| **Background** | Pepper-90 |
| **Micro-copy overlay** | None |

#### Screenshot 7 — Save & Track

| Element | Specification |
|---------|--------------|
| **Headline** | Track Projects You Care About |
| **Supporting line** | Bookmark repos and updates to revisit |
| **UI shown** | Bookmarks with folders: "Repos to Star", "Linux Setup", "Contribute To", "Release Notes" |
| **Visual emphasis** | Clean folder UI, diverse content types |
| **Background** | Dark standard |
| **Micro-copy overlay** | None |

#### Screenshot 8 — Developer Identity

| Element | Specification |
|---------|--------------|
| **Headline** | Your OSS Identity |
| **Supporting line** | A profile that reflects your open source passion |
| **UI shown** | DevCard/Profile with OSS-focused tags, contribution badges, reading history highlighting open source content |
| **Visual emphasis** | DevCard gradient (avocado → cabbage), OSS tag badges |
| **Background** | Hero gradient |
| **Micro-copy overlay** | "1M+ developers" |

---

## Part 4: Implementation Notes for Designers

### 4.1 File Naming Convention

```
CPP-{segment}/
  ├── iPhone/
  │   ├── 01-hero-1320x2868.png
  │   ├── 02-filter-1320x2868.png
  │   ├── 03-trending-1320x2868.png
  │   ├── 04-search-1320x2868.png
  │   ├── 05-content-1320x2868.png
  │   ├── 06-squads-1320x2868.png
  │   ├── 07-bookmarks-1320x2868.png
  │   └── 08-profile-1320x2868.png
  └── iPad/
      ├── 01-hero-2064x2752.png
      ├── 02-filter-2064x2752.png
      ├── ...
      └── 08-profile-2064x2752.png
```

Segment slugs: `ai-ml`, `frontend-react`, `career-growth`, `software-architecture`, `devtools-productivity`, `open-source-linux`

### 4.2 Design Consistency Checklist

- [ ] **All CPPs use the same Figma master template** — only content layers change
- [ ] **Device frames are identical** across all CPPs (same iPhone 15 Pro mockup, same iPad Pro frame)
- [ ] **Background treatment follows the segment accent color** but same gradient structure
- [ ] **Headline typography**: SF Pro Display Bold, 32–36pt equivalent, white (#FFFFFF), centered
- [ ] **Supporting line**: SF Pro Text Regular, 17pt equivalent, salt-50 (#CFD6E6), centered
- [ ] **Safe zones**: Minimum 80px padding from screenshot edges to any text
- [ ] **Device mockup**: Centered horizontally, positioned in bottom 60% of frame
- [ ] **Headline position**: Top 25–35% of frame
- [ ] **No text overlapping the device notch or Dynamic Island area**

### 4.3 Accent Color Map per CPP

| CPP | Primary Accent | Hex | Gradient Glow |
|-----|---------------|-----|---------------|
| AI / ML | blueCheese | `#2CDCE6` | radial blueCheese → transparent |
| Frontend / React | water | `#3169F5` | radial water → transparent |
| Career Growth | lettuce | `#92F21D` | radial lettuce → transparent |
| Software Architecture | onion | `#5F37E9` | radial onion → transparent |
| DevTools & Productivity | bun | `#FF7A2B` | radial bun → transparent |
| Open Source & Linux | avocado | `#1DDC6F` | radial avocado → transparent |

> The brand cabbage (`#CE3DF3`) remains present in all CPPs as a secondary accent (e.g., on screenshot 6–8 backgrounds) to maintain brand cohesion.

### 4.4 Screenshot Sequence Logic (Same for All CPPs)

| # | Purpose | Copy Focus | UI Focus |
|---|---------|-----------|----------|
| 1 | **Hero / Hook** | Core value prop for segment | Feed with segment-relevant content |
| 2 | **Personalization / Filtering** | "Matched to you" | Tag selection or filter UI |
| 3 | **Trending / Social Proof** | "What devs are reading" | Most upvoted / high engagement |
| 4 | **Unique Feature** | AI search OR deep content | Search or specialized content view |
| 5 | **Content Depth** | Source diversity or content mix | Multi-source feed or repo cards |
| 6 | **Community** | "Join communities" | Squads discovery |
| 7 | **Organization** | "Save & organize" | Bookmarks with folders |
| 8 | **Identity / Trust** | "1M+ developers" | DevCard / profile |

### 4.5 iPad Adaptations

For iPad screenshots (2064 × 2752 px):
- Use the **same headline and copy** as iPhone
- Show the **iPad-optimized UI layout** (wider grid, sidebar navigation if applicable)
- Device frame: iPad Pro with thin bezels
- Background may extend wider but same gradient treatment
- Headlines can be slightly larger (40–44pt equivalent) to fill the wider canvas
- Consider showing **split-view or sidebar layouts** that showcase the tablet advantage

### 4.6 Character Limits

| Element | Limit | Guidance |
|---------|-------|---------|
| Screenshot headline | ~30 chars | 3–6 words max. Must be readable at App Store thumbnail size |
| Supporting line | ~60 chars | Single line. Benefits-focused |
| Micro-copy badge | ~20 chars | "500+ sources", "Updated daily", etc. |
| CPP promotional text | 170 chars | Used in ad creative and search results |

### 4.7 Quality Checklist Before Submission

- [ ] All screenshots are exactly 1320 × 2868 (iPhone) and 2064 × 2752 (iPad)
- [ ] PNG format, RGB color space, no alpha channel
- [ ] No pricing or "Free" text in screenshots (Apple policy)
- [ ] Status bar shows realistic content (time, signal bars, battery)
- [ ] UI content is in English
- [ ] No competitor mentions in copy or visible UI
- [ ] App UI shown is actual or representative of real app functionality
- [ ] Text is legible at 50% zoom (simulates App Store thumbnail)
- [ ] Brand cabbage accent present in at least 2 screenshots per CPP
- [ ] First screenshot headline readable in under 1 second
- [ ] Color contrast ratio ≥ 4.5:1 for all text on backgrounds
- [ ] No truncated text in any UI mockup

### 4.8 A/B Testing Notes

With 6 CPPs, prioritize launch order based on audience size:
1. **AI / ML Developers** — highest growth segment, launch first
2. **Frontend / React Developers** — largest existing audience
3. **Career Growth** — broadest appeal, high conversion potential
4. **DevTools & Productivity** — strong engagement segment
5. **Open Source & Linux** — passionate niche
6. **Software Architecture** — senior audience, high LTV

Track per CPP: **Impression → Tap-through → Install → Day-1 retention** to measure creative effectiveness against the default listing.

---

## Appendix: Current Listing Reference Summary

| Attribute | Current Value |
|-----------|--------------|
| **App Name** | daily.dev |
| **Subtitle** | The feed for developers |
| **Category** | News |
| **Rating** | 4.0 (17 ratings, US) / 5.0 (9 ratings, IL) |
| **Size** | 21.3 MB |
| **Price** | Free with IAP |
| **Subscription** | Monthly $14.99 / Annual $89.99 |
| **Compatibility** | iOS 16.6+, iPadOS 16.6+, macOS 13.5+ (M1) |
| **Version** | 1.15 (Feb 21, 2026) |
| **Developer** | Daily Dev Ltd |
| **Privacy** | Tracks via Identifiers |
| **Promotional text excerpt** | "Used by 1M+ developers. A personalized feed from thousands of sources, matched to your stack." |

---

*Document generated: March 3, 2026*
*For the daily.dev design and growth teams*
