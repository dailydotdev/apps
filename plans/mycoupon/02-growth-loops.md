# MyCoupon — Growth Loops

How the directory acquires users instead of just serving them. Every loop below has a concrete UI surface in the mock-ups.

## Loop 1 — Share-a-deal (content loop)

Every offer card and detail view has a share bar: **Copy link · X/Twitter · WhatsApp/Slack**. The link is personalized (`/deals/cursor-20-credit?ref=tsahi`).

- The tweet is pre-composed and dev-flavored: "Cursor is 30% off for daily.dev members → [link]" — the sharer looks generous, not spammy.
- Logged-out visitors hit the share landing: offer + avatar of who shared it + "Join daily.dev to claim". The offer itself is the signup incentive; no generic value prop needed.
- Sharer feedback: "3 devs claimed via your link" notification + running total on the Your-impact widget. Visible impact is what makes people share twice.

## Loop 2 — Invite-to-unlock (Rakuten-symmetric referral)

Locked **exclusive** offers show a progress meter: "Invite 2 friends → unlock 6 months of Linear". Mechanics:

- Symmetric reward (both sides get the unlock/credit) — sharing reads as a gift.
- Progress is per-offer and visible on the locked card (0/2, 1/2 avatars filling in), which makes the loop legible at a glance.
- Ties into the existing `/settings/invite` referral infra ("3 invites = 1 month Plus" promo already exists — deals become a second, cheaper-to-fund reward currency).

## Loop 3 — Escalating discount ("boost this deal")

Selected offers have a communal boost meter: the discount deepens as more members claim/share it (20% → 25% at 500 claims → 30% at 1,000). Group-buying psychology (Pigeonhole/Groupon) — sharing directly increases *your own* discount, the strongest possible share motive. UI: tiered progress bar on card + detail, "share to boost" CTA.

## Loop 4 — Streak & belonging rewards (retention loop)

- Streak-gated drops: "7-day streak members get today's drop" — deals give streaks a tangible payoff and streaks give deals a daily rhythm.
- Weekly drop cadence ("New drops every Tuesday") creates an appointment; expiring rail creates urgency on the way out.
- Claim milestones feed the existing gamification (first claim, 5 claims, first verified share).

## Loop 5 — SEO, answer engines and agents

Sizing first, because it sets the priority: **68% of US Google searches ended without a click in early 2026** (up from 60% in 2024), yet Google still sends roughly **108x more referral traffic than ChatGPT**, and AI referrals remain about **1% of web traffic**. So classic organic search still carries the volume and AI citation is the fast-growing hedge. Build for both, weight for Google. But do **not** treat SEO as the growth engine on its own: the widely-quoted "$75.5M/quarter Wirecutter" proof point does not survive checking (see `00-research.md` section 2b), RetailMeNot fell 27% month over month as the organic-led incumbent, and every growing site in the category is direct- or affiliate-led. Search is compounding infrastructure; our distribution is the engine.

Three hard technical constraints from the research:

1. **Server-rendered HTML is a prerequisite for AI, and real URLs are a prerequisite for Google.** Two distinct problems, often conflated:
   - *Googlebot renders JavaScript fine* (100% render rate on HTML pages, median 10 seconds to render), so a client-rendered page does get indexed. Our blocker for Google is simply that both deals pages ship `noindex,nofollow`, plus the fact that **crawlers never click**: Google's own ecommerce guidance states its crawlers "don't 'click' buttons and generally don't trigger JavaScript functions that require user actions." Our category filters exist only as component state, so no filtered view exists for Google at all. Every valuable filter combination needs its own URL that renders that state **on load**.
   - *AI crawlers read raw HTML only.* GPTBot, ClaudeBot, PerplexityBot, Meta and Copilot's fetcher do not execute JavaScript, verified independently as recently as mid-2026; only Applebot renders. A grounding test found even Gemini's live URL fetch reads raw HTML, though AI Overviews and AI Mode are the exception because they read Google's already-rendered index. So client-only content is a blank page to ChatGPT, Claude and Perplexity.
   - A JS shell returning HTTP 200 with no content is *worse than a 404*: it looks successful and gets ingested as an empty page. SSR or static generation with content parity is the fix, and neither Google nor Bing treats prerendering-with-parity as cloaking.
   - **`llms.txt` is measurably ignored** (0.1% of AI-bot requests; two studies found no correlation with citations, one at p=0.85). Ship it because it is nearly free, but never count it as the mitigation. SSR is where the leverage is.
2. **Structured data earns rich results, not AI citations.** A controlled study (1,885 pages vs 4,000 controls) found adding schema produced no citation uplift, and Google states no special markup or AI text files are needed for AI features. Ship JSON-LD for classic rich results; do not justify it as AEO.
3. **Evidence density is what actually drives generative-engine citation** (the peer-reviewed GEO work, 10k queries): source citations, direct quotations, and statistics. Our deal pages already have the raw material — real claim counts, community verification timestamps, quotable dev comments. Surface them as text, not just as UI chrome.

- `/deals/[slug]` pages are indexable with OG images rendered per offer (brand logo + "-30%" + daily.dev frame) — every share drops a rich card into X/Slack/WhatsApp.
- The directory page targets "X promo code for developers" queries — coupon SEO is a proven acquisition channel (it's most of Honey's organic funnel).

## Anti-abuse guardrails (design now, enforce later)

- Claims are account-bound, rate-limited, and exclusives require account age/streak so freshly farmed accounts can't drain gift-card pools.
- Referral unlocks require the invitee to activate (verified signup + first session), mirroring Rakuten's spend-threshold rule.
- Limited pools decrement server-side; UI always renders from server truth.

## North-star metrics for the mock (display in Storybook playground)

- Directory WAU, claim rate, share rate per claim, K-factor of share landings, verified-works rate (deal quality), savings delivered ($ ticker).
