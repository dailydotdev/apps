# Community Sentiment — Feature Context (WIP, DO NOT COMMIT)

> Working doc for a mockup. Captures the raw idea + open questions. Not a PRD yet.

## The idea (in Ido's words, paraphrased)

daily.dev aggregates and personalizes content for developers. A missing layer is
**community sentiment**: for any post/item, what does the developer community actually
*think* about it? We can scrape the places the community lives outside daily.dev —
X/Twitter, Hacker News, Reddit, etc. — and aggregate that sentiment into progressive layers.

### Layered model (revised)
- **Surface (L0/L1):** a plain-English **TL;DR of the sentiment** + the **metric**. That's it.
  Must be immediately understandable — plain language, nothing fancy.
- **L2+ (deeper, on demand):** a **modular set of building blocks**, of which we surface
  only the ones relevant to the item's sentiment *shape* (a consensus item shows different
  blocks than a divisive one). Defined blocks:
  - **Pros & cons** (coalition vs opposition)
  - **Sentiment by source** (how X vs HN vs Lobsters differ — often the highest-signal block)
  - **Open questions + hottest debate/flashpoint**
  - _Notable highlights / verbatim quotes = **L3**, optional._
- **Signal metric:** simple, high-signal, plain-language (exact form to try in mockup).

### North star
Target = **busy developers**. Maximize signal, minimize time spent. Every layer must earn
its place by saving the reader from going and reading the threads themselves.

## Design principles (carried from AI Pulse PRD, likely applicable)
- No preachy "why it matters" commentary.
- Short. Quote directly when the community's own words are punchy.
- Freshness first — sentiment is time-sensitive; don't blend takes from weeks apart.
- Granular — one idea per element.

## Open questions (to resolve before/with the mockup)
_(answers to be filled in)_

1. **Surface** — Where does this live? Feed card teaser, post detail page, dedicated
   panel/drawer, or a new standalone view?
2. **Coverage** — Which items get a sentiment layer? All posts, or only ones with enough
   external discussion? What's the threshold, and what does an item with *no* sentiment show?
3. **Sources** — Which platforms for the mockup (X, HN, Reddit, others)? Do we attribute
   (named accounts, avatars, links back) or keep it anonymized/aggregated?
4. **The metric** — How do we visualize consensus vs controversy? One number, a spectrum,
   a distribution? What makes something "controversial" vs "disagreed"?
5. **Generation reality** — For now this is a static mockup with believable fake data,
   right? (No live scraping/LLM pipeline yet.)
6. **Blend** — External sentiment only, or also fold in daily.dev's own signals
   (upvotes/comments) into the same view?
7. **Positioning** — Free feature, engagement driver, or a Plus/monetized layer?
8. **Item scope** — Just article posts, or also releases, threads, videos, AI Pulse items?

## Decisions
- **Surface:** Post detail page section is the hero (L0/L1 live here), with a compact
  teaser on the feed card as the entry point (glance → expand).
- **Attribution is layer-dependent:** the *surface* layer (L0) is mostly **aggregated**;
  we can pull a few **highlights**. Deeper layers can carry more receipts (quotes/links).
- **Metric:** two axes deemed too complex. Need something **easy to grasp yet high-signal**
  (exact form TBD).
- **Sources (v1):** X, Hacker News, Lobsters.
- **Scope/positioning:** external-only, **free** engagement layer; daily.dev's own
  votes/comments stay shown separately as today.
- **Freshness:** try a recency/velocity treatment in the mockup, decide from there
  (risk: too much for the surface).
- **Empty state:** below a chatter threshold, **hide the section entirely** — its presence
  should itself mean "there's real signal here".
- **Item coverage:** potentially every post; not locked yet. Mock a general case.
- **Mockup depth:** build the full experience including a **defined L2**.

## Mockup plan
- **Target surface:** the **new post page** (there are two post-page variations currently —
  build on the new one). Place sentiment **widget(s)** in the post page.
- **Interaction:** DECIDED — **inline collapsible** expansion, not a dedicated page. The
  sentiment is about the post being read, so a page adds a navigation tax that fights the
  save-time goal; "Deep dive" unfolds L2 in place. A dedicated page/modal is reserved for a
  future heavy L3 (thread readers, lots of verbatim quotes) or if we want it shareable/SEO'd.
- **Content to mock:** one realistic example (e.g. a hot framework release) with believable
  fake data across X / HN / Lobsters; show surface (TL;DR + plain-language metric) and the
  modular L2 blocks.
- **Positioning:** external-only, free; keep daily.dev's native votes/comments separate.

## Target surface (identified)
- **New post page = the redesign**, `PostFocusCard`
  (`packages/shared/src/components/post/focus/PostFocusCard.tsx`), a single-column focus card.
- Toggled by GrowthBook flag **`post_redesign`** (`featurePostRedesign`,
  `packages/shared/src/lib/featureManagement.ts:40`), switched in
  `packages/webapp/pages/posts/[id]/index.tsx:202-311`. Old = per-type `Content` (`PostContent` etc).
- **Insertion point:** in the single content column, after `FocusCardActionBar`
  (~`PostFocusCard.tsx:558`) and before the `PostDiscussionPanel` discussion block (~L560) —
  i.e. below content/engagement, above comments.
- **Widget pattern to follow:** inline-in-column (no aside on the new layout), like
  `PostSidebarAdWidget variant="inline"` (L547); new subcomponents go in `.../post/focus/`.
- **Caveat:** `PostFocusCard` is shared by the post **modal** too. If sentiment should only
  show on the full page, gate it (modal passes `onClose`; the page does not).
