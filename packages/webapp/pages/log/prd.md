# daily.dev Log 2025

## Overview

Year-in-review experience showing developers their reading habits, contributions, and growth on daily.dev throughout 2025. Designed for shareability through competitive stats that make users proud to share, building to an archetype reveal as the climax.

---

## Design System: Festival Theme

The visual identity is inspired by **music festival posters, concert merch, and cultural celebration graphics**. It's bold, maximalist, joyful, and unapologetically loud. This isn't minimal tech aesthetic — it's a party for your achievements.

### Design Philosophy

- **Celebratory over corporate** — This is an achievement, treat it like a festival headline
- **Bold over subtle** — Big type, strong colors, visible effects
- **Playful over polished** — Slight rotations, drop shadows, stacked elements
- **Dense but readable** — Maximalist doesn't mean cluttered; hierarchy matters
- **Mobile-first** — Every decision optimized for portrait phone screens

---

### Color Palette

All colors are intentionally vibrant and high-contrast. Use CSS variables for consistency.

| Token | Hex | Usage |
|-------|-----|-------|
| `--fest-bg` | `#1a0a2e` | Deep purple background, used on all cards |
| `--fest-primary` | `#ff6b35` | Orange — ribbons, shadows, banners |
| `--fest-secondary` | `#f7c948` | Golden yellow — labels, dividers, decorations |
| `--fest-accent` | `#e637bf` | Hot pink/magenta — shadows, banners, decorations |
| `--fest-lime` | `#c6f135` | Electric lime — card numbers, highlights, CTAs |
| `--fest-white` | `#ffffff` | Pure white — headlines, badge backgrounds |
| `--fest-cream` | `#fff8e7` | Warm white — optional for softer text |

**Color pairing rules:**
- Headlines: White with colored drop shadows (primary + accent layered)
- Supporting text: Secondary (yellow) or Lime
- Badges/cards: White background with colored box-shadows
- Banners: Gradient of primary → accent → secondary
- Decorative stars: Rotate through secondary, lime, accent, primary

---

### Typography

Two typefaces create contrast between celebration and information:

**Display / Headlines:**
- **Font:** `Dela Gothic One` (Google Fonts)
- **Fallback:** `cursive, system-ui`
- **Usage:** Large numbers, archetype names, main stats
- **Characteristics:** Chunky, bold, slightly playful Japanese-inspired display font

**Body / Labels:**
- **Font:** `Space Mono` (Google Fonts)
- **Fallback:** `monospace`
- **Weight:** 400 (regular), 700 (bold)
- **Usage:** Labels, card indicators, supporting text, navigation
- **Characteristics:** Technical, monospace, creates contrast with display font

**Typography scale:**
| Element | Font | Size | Weight | Additional |
|---------|------|------|--------|------------|
| Hero number | Dela Gothic One | 6rem (mobile: 4.5rem) | 400 | Drop shadow |
| Secondary headline | Dela Gothic One | 2.5rem | 400 | Single shadow |
| Card label | Space Mono | 0.65rem | 400 | letter-spacing: 0.15em, uppercase |
| Card number | Space Mono | 0.85rem | 700 | — |
| Badge value | Dela Gothic One | 1.5rem | 400 | — |
| Badge label | Space Mono | 0.6rem | 400 | letter-spacing: 0.1em, uppercase |
| Body text | Space Mono | 0.9rem | 400 | — |

**Drop shadow formula for headlines:**
```css
text-shadow: 
  4px 4px 0 var(--fest-primary),
  8px 8px 0 var(--fest-accent);
```

---

### Layout Principles

**Container:**
- Full viewport (fixed, inset: 0)
- Content max-width: `380px`
- Padding: `2rem 1.5rem`
- Centered with flexbox
- Background: `--fest-bg`

**Visual hierarchy (top to bottom):**
1. Logo badge with year ribbon (top)
2. Card indicator (e.g., "01 — TOTAL IMPACT")
3. Main headline stack (the hero moment)
4. Decorative divider
5. Secondary stats in badge format
6. Celebration banner (percentile/ranking)
7. Navigation prompt (bottom)

**Rotation & Skew:**
- Apply subtle rotation to elements for "posted/stamped" feel
- Badges: alternate `-1deg` and `1deg`
- Logo badge: `-2deg`
- Banners: `skewY(-2deg)`
- Never exceed `±10deg` — playful, not chaotic

---

### Component Patterns

#### Logo Badge
```
┌─────────────────┐ ← White background, rounded 4px
│  [daily.dev]    │ ← Logo (black), height 20px
└─────────────────┘
     rotated -2deg
```

#### Card Indicator
```
01 — TOTAL IMPACT
↑     ↑
lime  white, 70% opacity, uppercase, spaced
```

#### Headline Stack
Three-line stacked headlines, each revealed with staggered animation:
```
      YOU READ        ← Small (1rem), yellow, letter-spacing: 0.3em
        847           ← Hero (6rem), white, layered drop shadow
       POSTS          ← Medium (2.5rem), lime, single shadow
```

#### Stat Badges
White rectangles with colored box-shadows, alternating rotation:
```
┌─────────┐        ┌─────────┐
│   62h   │        │   234   │
│ READING │        │  DAYS   │
└─────────┘        └─────────┘
    ↳ shadow: 3px 3px 0 primary    ↳ shadow: 3px 3px 0 accent
    ↳ rotate: -1deg                ↳ rotate: 1deg
```

#### Celebration Banner
Full-width gradient banner with skew:
```
╔══════════════════════════════════════╗
║      TOP   91%   OF DEVS             ║ ← skewY(-2deg)
╚══════════════════════════════════════╝
         ↳ gradient: primary → accent → secondary
```

#### Decorative Divider
```
────── ◆ ──────
   ↑    ↑    ↑
yellow  accent (spinning)  yellow
```

---

### Animation & Motion Design

**Core principle:** Animations should feel like a **poster coming to life** — elements pop in with energy but settle quickly.

**Primary easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — Spring-like, overshoots slightly
**Secondary easing:** `ease-out` — For simpler fades

#### Entry Animations (per card)

Stagger elements appearing from top to bottom:

| Element | Delay | Duration | Animation |
|---------|-------|----------|-----------|
| Card indicator | 0.3s | 0.6s | Fade + slide down |
| Headline row 1 | 0.4s | 0.8s | Fade + slide up + slight rotation |
| Headline row 2 | 0.6s | 0.8s | Fade + slide up + slight rotation |
| Headline row 3 | 0.8s | 0.8s | Fade + slide up + slight rotation |
| Divider | 1.0s | 0.6s | Fade |
| Stat badges | 1.2s | 0.8s | Fade + scale from 0.9 |
| Banner | 1.5s | 0.8s | Fade + slide up |
| Navigation | 1.8s | 0.6s | Fade |

**Headline reveal keyframes:**
```css
@keyframes headlineReveal {
  from {
    opacity: 0;
    transform: translateY(20px) rotate(-2deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
}
```

**Number counting:** Animate from 0 to final value over 1.5-2s with ease-out

#### Ambient Animations (always running)

| Element | Animation | Duration | Timing |
|---------|-----------|----------|--------|
| Background burst | Slow rotation | 120s | linear, infinite |
| Decorative stars | Float up/down + slight rotate | 4s | ease-in-out, infinite, staggered delays |
| Divider icon (◆) | Full rotation | 3s | linear, infinite |
| Navigation arrow | Bounce right | 1s | ease-in-out, infinite |

**Star float keyframes:**
```css
@keyframes starFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(10deg); }
}
```

#### Card-to-Card Transitions

When navigating between cards:
- **Exit:** Current card fades out + slides left (0.3s)
- **Enter:** New card fades in + slides from right (0.5s)
- **Background:** Burst rotation continues seamlessly (never resets)
- **Stars:** Maintain position, don't reset

---

### Effects & Decorative Elements

#### Background Burst
Slow-rotating radial pattern creating subtle depth:
```css
background: repeating-conic-gradient(
  from 0deg at 50% 50%,
  var(--fest-bg) 0deg 10deg,
  rgba(230, 55, 191, 0.08) 10deg 20deg
);
animation: rotate 120s linear infinite;
```
Position: `inset: -50%` (oversized to avoid edge visibility during rotation)

#### Floating Stars
4 decorative Unicode stars scattered in corners:
- Characters: `✦` `★` `✴` `✦`
- Size: 1.25rem – 2rem
- Colors: Cycle through secondary, lime, accent, primary
- Position: Corners, avoiding content overlap
- Animation: Floating with staggered delays

#### Zigzag Patterns (optional)
Geometric accents using CSS gradients:
- Position: Edges of screen, partially cut off
- Opacity: 40%
- Rotation: `±15deg`

---

### Archetype Card Special Treatment (Card 8)

The archetype reveal is the climax — it gets extra drama:

**Build-up sequence:**
1. Background darkens slightly
2. Text lines appear one at a time (slower pacing)
3. Pause before reveal (500ms of anticipation)
4. Archetype name SLAMS in with:
   - Larger scale (7rem+)
   - Extra shadow layers
   - Brief screen shake or pulse
   - Emoji scales up separately
5. Description fades in below

**Archetype-specific colors (optional):**
| Archetype | Accent Override |
|-----------|-----------------|
| NIGHT_OWL | Deep blue glow |
| SCHOLAR | Warm gold |
| PULSE_READER | Electric cyan |
| OPINIONIST | Hot pink |
| COLLECTOR | Rich purple |
| STREAK_WARRIOR | Fire orange/red |

---

### Share Image Specifications

Generated images for social sharing:

**Dimensions:** 1080 × 1920px (9:16 Instagram story ratio)

**Layout:**
- Background: `--fest-bg` solid
- Top: daily.dev logo badge
- Center: Main stat or archetype (large)
- Bottom: "app.daily.dev/log" URL

**Typography in image:**
- Embed fonts or convert to paths
- Maintain drop shadow effects
- Include decorative stars

**File format:** PNG with transparency OFF

---

### Responsive Breakpoints

| Breakpoint | Adjustments |
|------------|-------------|
| < 380px | Hero number: 4.5rem, Medium headline: 2rem |
| ≥ 380px | Hero number: 6rem, Medium headline: 2.5rem |
| ≥ 500px (rare) | Can slightly increase padding |

---

### Accessibility Notes

- Ensure 4.5:1 contrast ratio for all text (test yellow on purple)
- Animations respect `prefers-reduced-motion` — disable ambient loops, keep essential reveals
- All decorative elements have `aria-hidden="true"`
- Interactive areas have minimum 44x44px tap targets

---

### Implementation Checklist

- [ ] CSS variables defined at root
- [ ] Google Fonts loaded: Dela Gothic One, Space Mono
- [ ] Background burst animation
- [ ] Floating star decorations
- [ ] Logo badge component
- [ ] Headline stack with staggered animations
- [ ] Number counting animation hook
- [ ] Stat badge component
- [ ] Celebration banner component
- [ ] Card transition logic
- [ ] Share image generation
- [ ] Reduced motion media query

---

## Global Mechanics

**Navigation:**
- Tap anywhere to advance
- Swipe left/right to navigate
- Progress dots show position
- Can skip forward/backward

**Sharing:**
- "Share this" button appears after each card's stats reveal
- Generates image with: daily.dev logo, stat, competitive ranking, app.app.daily.dev/log URL
- Options: LinkedIn, Twitter/X, Copy link, Download image

**Persistent:**
- daily.dev logo at top of every screen

---

## Flow: 9 Cards

### Card 1: Total Impact

**Stats:**
- Total posts read
- Total reading time
- Days active

**Competitive stat:**
- "That's more than X% of developers on daily.dev"

**Copy:**
- "You read 847 posts this year"
- "That's 62 hours of learning"
- "You showed up 234 days"

---

### Card 2: When You Read

**Stats:**
- Peak reading hour (e.g., "23:47")
- Peak day of week
- Activity heatmap

**Competitive stat (pick ONE based on strongest pattern):**
- Night readers: "TOP 8% of late-night readers"
- Early birds: "TOP 15% of early risers"
- Weekend warriors: "TOP 12% of weekend readers"
- Consistency: "TOP 22% for daily consistency"

**Copy:**
- "Your brain was hungriest at 23:47"
- "Thursdays were your power day"

---

### Card 3: Topic Evolution

**Concept:** Month-by-month animated journey showing how interests changed

**Stats:**
- Monthly top topic (Jan → Dec)
- Key pivot moments
- Total unique tags explored

**Animation:**
- Auto-plays through months
- Can tap/drag to scrub timeline
- Topics flow into each other

**Competitive stat:**
- "Your interests evolved more than X% of developers"

**Copy:**
- "January: #python → March: #fastapi → June: #system-design → December: #rust"
- "Your big pivot: July — when you discovered #kubernetes"
- "You explored 47 different topics"

---

### Card 4: Favorite Sources

**Stats:**
- Top 3 sources (podium style)
- Total unique sources discovered
- Posts read from top source

**Competitive stat:**
- "TOP X% loyalty to [Source]"
- "You discovered more sources than X% of readers"

**Copy:**
- "Your holy trinity: dev.to, hackernews, pragmaticeng"
- "You discovered 89 different sources"
- "47 posts from dev.to alone"

---

### Card 5: Community Engagement

**Stats:**
- Upvotes given
- Comments written
- Posts bookmarked

**Competitive stats (show where user is top 50%):**
- "TOP 15% upvoters"
- "TOP 8% commenters"
- "TOP 20% for curating content"

**Copy:**
- "You upvoted 234 posts — spreading the love"
- "You wrote 18 comments"
- "You bookmarked 89 posts for later"

---

### Card 6: Your Contributions (OPTIONAL)

**Show only if:** User has created at least 1 post

**Stats:**
- Posts created
- Total views received
- Comments received on posts
- Upvotes received on posts
- Reputation earned

**Competitive stats:**
- "TOP X% content creator on daily.dev"
- "Your posts reached X developers"
- "TOP X% for generating discussion"

**Copy:**
- "You created 12 posts this year"
- "Your content was viewed 8,432 times"
- "You sparked 247 comments"
- "You earned 1,892 reputation"

**If no contributions:** Skip card entirely

---

### Card 7: Your 2025 Records

**Stats (pick 2-3 most impressive):**

*Time-based:*
- Active X% of the year (days/365)
- Longest streak
- Most consistent day ("Read every Tuesday for 8 months")

*Intensity:*
- Most posts in single day
- Longest reading session
- Topic marathon ("34 posts about System Design in one week")

*Time-of-day:*
- Latest night read ("3:47 AM")
- Earliest morning read ("5:12 AM")

*Growth:*
- Fastest growing month ("March was 3x your average")
- Most improved topic

**Competitive stats:**
- "You were active X% of the year — TOP Y%"
- "Only Z% of developers binged harder"
- "Your consistency beat X% of readers"

**Copy:**
- "You showed up 67% of the year (245/365 days)"
- "Biggest binge: 34 posts on March 12th"
- "Your 3:47 AM read was... committed"

---

### Card 8: Archetype Reveal (THE CLIMAX)

**Pre-reveal buildup:**
1. "We've seen how you read..."
2. "We know when you read..."
3. "We tracked what you love..."
4. "Now let's see WHO you are..."
5. [Pause]
6. **REVEAL**

**Archetypes:**

**NIGHT_OWL 🦉**
- Trigger: 40%+ reading between 9pm-5am
- Description: "While others sleep, you level up."
- Stat: "Only 12% of developers read as late as you"

**SCHOLAR 📚**
- Trigger: Read time in top 20%, prefers long-form/tutorials
- Description: "You don't skim. You study."
- Stat: "2.3x longer average read time than most"

**PULSE_READER ⚡**
- Trigger: High % news/releases, early engagement with trending
- Description: "First to know. Always."
- Stat: "4 hours faster to breaking news than average"

**OPINIONIST 🎤**
- Trigger: High opinion piece engagement, active commenter
- Description: "Hot takes need witnesses."
- Stat: "5x more comments than average reader"

**COLLECTOR 🗃️**
- Trigger: High volume, diverse tags (10+), lots of bookmarks
- Description: "Bookmarks: ∞. Read later: TBD."
- Stat: "3x more topics explored than most"

**STREAK_WARRIOR 🔥**
- Trigger: Reading streak in top 10%
- Description: "Rain or shine. You show up."
- Stat: "Outlasted 94% of developers"

---

### Card 9: Share Your Story

**Header:** "Time to flex."

**Display:**
- Archetype (icon + name + description)
- Competitive stat badge
- Quick stats: posts | streak | rank
- Social proof: "X developers have shared their Log"

**Share buttons:**
- LinkedIn
- Twitter/X
- Copy Link
- Download Image

**Pre-formatted share content:**
```
I'm a NIGHT_OWL 🦉 on daily.dev

📚 847 posts read
🔥 47-day streak  
⚡ Only 12% of developers read as late as me

What's your developer archetype?
→ app.daily.dev/log
```

---

## Competitive Stats Rules

**Hierarchy (most to least shareable):**
1. Global Rank — "#12,847 of 487K developers"
2. Percentile — "TOP 3%"
3. Multiplier — "2.3x more than average"
4. Beat X% — "Beat 94% of developers"
5. Only X% — "Only 8% read this late"

**Display rules:**
- Show only when user is top 50% for that metric
- Always frame positively
- Use specific numbers ("TOP 8%" not "top readers")
