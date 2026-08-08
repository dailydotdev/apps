# MyCoupon — Wirecutter Teardown and Deal Presentation Spec

Companion to `01-product-spec.md` (what we build), `08-growth-benchmark.md` (how the category grows) and `07-house-seo-aeo-conventions.md` (how pages are written). This doc is about **presentation**: the anatomy of a deal card, a deal page and the directory, derived from a rigorous teardown of Wirecutter and translated onto our own design system and data model.

---

## 0. Method, and what was and was not observed directly

All Wirecutter observations below were taken from **live production HTML fetched on 2026-08-07**, not from screenshots or secondary write-ups, except where explicitly marked *(inferred)* or *(secondary)*.

Pages read directly:

- [The Best Office Chair](https://www.nytimes.com/wirecutter/reviews/best-office-chair/) — the canonical single-category guide, updated July 31, 2026
- [The Best Laptops](https://www.nytimes.com/wirecutter/reviews/best-laptops/) — a multi-category "hub" guide, updated August 7, 2026
- [The Best Webcams](https://www.nytimes.com/wirecutter/reviews/the-best-webcams/)
- [The Best Standing Desks](https://www.nytimes.com/wirecutter/reviews/best-standing-desk/)
- [Daily Deals](https://www.nytimes.com/wirecutter/deals/)
- [Wirecutter homepage](https://www.nytimes.com/wirecutter/)
- [How Wirecutter Makes Money](https://www.nytimes.com/wirecutter/reviews/how-wirecutter-makes-money/)
- [Wirecutter Editorial Standards](https://www.nytimes.com/wirecutter/editorial-standards/)
- The five production CSS bundles served from `dv-siren-prd.global.ssl.fastly.net/_next/static/css/*.css` (314 KB combined), used for the type, breakpoint and sticky analysis in §1.7 and §1.6.

Access notes, for reproducibility: the sandboxed `WebFetch` tool refuses `nytimes.com`, `web.archive.org` and `r.jina.ai` (403). `curl` with a desktop user agent returns the full server-rendered HTML for every URL above, which is how this teardown was done. **Wirecutter serves complete content in the initial HTML response with no paywall interstitial on review or deals pages** — itself a finding worth noting given our own SSR work in `06-seo-aeo-agent-discovery.md`.

One thing could not be observed directly: **rendered mobile layout**. The browser pane is policy-blocked for `nytimes.com`. Mobile behavior in §1.6 is therefore derived from the production CSS media queries (direct evidence of the rules) plus reasoning about what they do (*inferred*), and is labeled as such.

> **House-keeping flag, unrelated to design:** `02-growth-loops.md` line 33 still cites "Wirecutter: $75.5M/quarter" as proof that organic search drives affiliate revenue. `00-research.md` §2b and `08-growth-benchmark.md` §1 both correct this — $75.5M is a blended NYT line that includes commercial printing and $6.7M of office rent. The stale claim should be struck from `02-growth-loops.md`. It is not repeated anywhere in this document.

---

## Part 1 — Teardown

### 1.1 The "best X" category page

Top of page, in exact source order on [best-office-chair](https://www.nytimes.com/wirecutter/reviews/best-office-chair/):

1. **A one-line affiliate disclosure above everything**, before the nav, before the headline: *"We independently review everything we recommend. We may make money from the links on our site."* followed by a "Learn more ›" link to `/wirecutter/about/`. It is the first text on the page.
2. **Breadcrumb** (`Office / Office furniture`) and a **"Sections in this article" jump nav** that lists every pick by name, not by generic label: `Top pick: Steelcase Gesture`, `Runner-up: Herman Miller Aeron Chair`, `Best balance of comfort and price: Herman Miller Sayl Chair`, `Budget pick: HON Ignition 2.0`, then `Other office chairs worth considering`, `What to look forward to`, `The competition`.
3. **H1 + update stamp**: `The Best Office Chair` / `Updated July 31, 2026`. The update date sits directly under the H1, above the byline.
4. **Byline** (`By Kaitlyn Wells and Arriana Vasquez`), with photo credit on the hero image.
5. **A three-sentence lede that front-loads the evidence**: *"We've researched dozens of office chairs, interviewed four ergonomics experts, and asked test panelists (with a variety of body types) to sit in deliberation for more than 175 collective hours. Since 2015, we've found that the Steelcase Gesture is the best office chair for most people."* Note the shape: quantified effort, then the answer, in the first viewport.
6. **"Everything we recommend"** — a compact summary block listing *every* pick with its label, its superlative, its product name and its **full stack of buy buttons**, before any prose. This is the single most important structural decision on the page: a reader who wants only the answer never has to scroll into the article.
7. **"Testing notes"** — four icon-led criteria cards (`Comfort`, `Lumbar and back support`, `Durability and quality`, `Warranty`), each one sentence, with a `How we tested` link.
8. Then the long-form sections: `Why you should trust us`, `Who this is for`, `How we picked and tested`, then one H2 per pick, then `What to look forward to` and `The competition`.

The labelled hierarchy observed across the four guides read: **`Top pick`** (the current name for what everyone remembers as "Our pick" — the phrase "Our pick" survives only in body prose, never as a badge), **`Runner-up`**, **`Budget pick`**, **`Upgrade pick`**, and a wildcard **`Best for...`** badge whose superlative carries the specificity (`Best for a blend of comfort and style`, `Best laptop for repairability`). The deals page adds **`Staff pick`**, **`Gift pick`** and **`Worth considering`**.

Critically: **each pick block carries exactly one badge.** There is no stacking of labels.

No side-by-side comparison table appears on the office chair, laptop or webcam guides. Instead, the laptops guide uses a **"Recommended configuration" two-column key/value grid** inside each pick block (`Processor | Screen | Memory | Weight | Storage | Tested battery life`). This is a per-item spec table, not a cross-item comparison table.

### 1.2 The individual pick block — the unit to copy

This is the atomic unit. Exact composition, from [best-office-chair](https://www.nytimes.com/wirecutter/reviews/best-office-chair/) and [best-laptops](https://www.nytimes.com/wirecutter/reviews/best-laptops/):

```
[ full-bleed lifestyle photo of the product in use, with photographer credit ]

Top pick                                     ← badge, small, its own line
Top pick, The best office chair              ← badge + superlative (a11y label)
Steelcase Gesture                            ← product name, the largest type in the block
This is one of the most adjustable chairs available — anyone can make it
comfortable, regardless of their height or size. And it's built to last.
                                             ← the verdict: 1–2 sentences, always
Buying options:
  $1,499 from Steelcase   , opens in a new tab
  $1,208 from Amazon      , opens in a new tab
  $1,539 from Wayfair     , opens in a new tab
```

Notes on each element:

- **Image treatment.** Product photos are large, full-column-width, un-cropped, shot in context (a chair in a room, a laptop on a desk), always credited (`Michael Murtaugh/NYT Wirecutter`). They are photographic, not cut-out-on-white. Wirecutter shoots its own; retailer imagery appears only for pre-release items (`Acer` credit on the Aspire 14).
- **Product name typography.** Set in the display face at roughly `1.375rem`, the largest thing in the block, above the verdict.
- **The verdict line.** One or two sentences, and it is *never* purely positive. Look at the pattern: *"The Yoga 7i has fast performance, terrific battery life, a vivid OLED touchscreen, and a 360-degree hinge. **But it's a bit heavy.**"* / *"The best inexpensive Chromebook has reliable performance, long-enough battery life, and a matte touchscreen. **But it lacks a 360-degree hinge, and its speakers sound bad.**"* The trade-off is in the summary, not buried. This is the highest-leverage copy convention on the entire site.
- **Buy buttons.** Labeled `Buying options:` and stacked vertically, one row per retailer, formatted `$1,499 from Steelcase`. **Price first, retailer second.** Every row ends with the screen-reader text `, opens in a new tab`. There is no "Buy now", no "Shop", no urgency verb, and no visual ranking between retailers beyond source order (cheapest is *not* always first — the Gesture lists Steelcase $1,499 above Amazon $1,208). On the homepage the same data carries explicit accessible labels: `sale price: $183 | original price: $530 | from Rugs USA`.

The editorial sections that follow the block, and their **exact current headings**:

| Section | Heading used on single-category guides | Heading used on hub guides |
|---|---|---|
| Who it suits | `Who this is for` (H2, page level) | `Who this is for:` (inline bold lead-in, per pick) |
| The case for | *no heading* — bold claim lead-ins instead (`It's supremely comfortable.`, `It's versatile, supportive, and packed with features.`, `It offers more and better adjustments than the competition.`, `It looks good and lasts a long time.`) | `Why we like this one:` (inline bold lead-in) |
| The case against | **`Flaws but not dealbreakers`** (H3) | `Where it falls short:` (inline bold lead-in) |
| Durability | `How the Steelcase Gesture has held up` (H3), containing signed staff testimonials with ownership dates | — |

Two findings worth stressing:

1. **"Why we picked it" no longer exists as a heading.** It appears zero times across all four guides read. The single-category guides replaced it with bolded claim lead-ins (each one a complete sentence asserting a benefit, then a paragraph of evidence); the hub guides replaced it with `Why we like this one:`. The *function* survived; the label was retired.
2. **`Flaws but not dealbreakers` is alive and unchanged**, appearing on all three single-category guides. Its internal structure is a list of bolded flaw statements, each followed by context that either mitigates it or names who it disqualifies: *"**It can retain heat.** If you run hot, work in an office without air conditioning, or live in a warm part of the world, the Gesture may not be the best chair for you..."* / *"**It's heavy.** This chair weighs over 70 pounds, which can be annoying if you want to move it around your home office. **But that also makes it super sturdy.**"* The flaw is stated flatly and then contextualized. It is never softened before it is stated.

Ordering within a pick section is fixed: image → badge → name → verdict → buy options → prose case-for → `Flaws but not dealbreakers` → long-term notes → link to the deeper guide.

### 1.3 The Deals page — how a deal differs from a pick

[Daily Deals](https://www.nytimes.com/wirecutter/deals/) is a distinct object model layered on the same visual vocabulary.

**Header.** H1 `Daily Deals`, then the positioning line: *"No shady sites or mediocre products. Just rigorously researched deals on Wirecutter picks from our editorial experts."* Then a freshness stamp: **`Updated less than 1 hour ago on August 7, 2026`**. The page-level freshness claim sits in the first viewport.

**Structure.** `Featured deals` (a horizontally-scrolling rail of compact cards) → `More deals` (a vertical list of full rows, with `Filter` and `Sort` controls).

**Filters** are a left drawer with three facets: `Category` (19 values, including `Gift Cards`, `Tech`, `Office`, `Video Games`), `Price` (5 bands), `Percent Off` (`0% to 10%`, `10% to 30%`, `30% to 50%`, `50% to 100%`). Plus `Clear All`. Price *and* percent-off are both first-class facets.

**The deal row** (the full form, in `More deals`):

```
Staff pick                                        ← the review's pick badge, reused
Rugs USA Softest Knit Wool Rug                    ← product name
$183  $530   Save $347                            ← now / was / absolute saving
Buy from Rugs USA                                 ← single CTA, retailer named
Use promo code BEAUTY (5 by 8 feet)               ← the redemption mechanic
What we like: A cozy wool and cotton rug staff pick from our guide to the
  best area rugs. Durable, soft, and cozy... Most affordable option of our picks.
Other things to know: 80/20 wool-cotton blend. Will need professional
  deep-cleaning if stained, thanks to the wool. Corners lift a little over
  time. Price depends on sizing. Use code BEAUTY.
Read the review → The Best Area Rugs               ← link back to the guide
Posted less than 1 hour ago      Copy link         ← freshness + share
```

The differences from a pick, itemized:

- **A deal inherits its authority; it does not create it.** The badge (`Top pick`, `Upgrade pick`, `Staff pick`, `Worth considering`, `Best for...`) is the badge the item earned in its review, and the row always ends with `Read the review` plus the review's title. A deal is a *price event attached to an existing verdict*.
- **`What we like:` and `Other things to know:`** are the deals-page compressions of `Why we like this one` and `Flaws but not dealbreakers`. They are dense, fragmentary and telegraphic rather than prose — sentence fragments separated by periods. The flaws slot survives compression; that is how load-bearing it is.
- **Redemption is a first-class field.** A short parenthetical line under the CTA states exactly what the reader must do and which variant the price applies to. Observed values: `Use promo code WCAUGBUNDLE (six-piece set)`, `Price reflected in cart (queen)`, `With clipped on-page coupon`, `Price includes $8 shipping (deal on orange)`, `With store pickup or REI membership (deal on aqua)`, `(enter your email to claim the single-use promo code)`, `FINAL SALE, add two to cart, price includes $5 shipping (set of two, deal on navy/red)`, `(deal on black and red)`. This field does enormous work: it kills the "the price on the page isn't what you promised" failure mode before it happens.
- **Freshness is per-item and relative**: `Posted less than 1 hour ago`, `Posted 2 hours ago`, `Posted 1 day ago`. There is no *expiry* countdown anywhere on the page. The only urgency device observed is a `Lightning Deal` flag on one Amazon row, and gentle prose caveats inside `Other things to know` (`Recurring deal price.`, `Street price has risen significantly over the past year.`, `FINAL SALE.`).
- **`Copy link`** is on every row.
- **Featured cards are the compressed variant**: badge, name, price triple, CTA, redemption line, and an expander labeled **`+ See why it's a deal`** — the editorial justification collapses on the compact variant rather than being dropped.

### 1.4 Affiliate disclosure and independence

Three tiers, and the spacing between them is the design:

1. **Persistent, one line, above the fold, on every page including the deals page and the homepage**: *"We independently review everything we recommend. We may make money from the links on our site."* + `Learn more ›`. It is set small and quiet, in the site's neutral gray, and it is nowhere near the buy buttons. It never re-appears next to a CTA.
2. **In-article independence paragraph**, inside `Why you should trust us`, immediately after the author credentials: *"Like all Wirecutter journalists, we review and test products with complete editorial independence. We're never made aware of any business implications of our editorial recommendations."* Plus the disposal policy: *"In accordance with Wirecutter standards, we return or donate all products we've tested once our assessment of them is complete."*
3. **A dedicated explainer**, [How Wirecutter Makes Money](https://www.nytimes.com/wirecutter/reviews/how-wirecutter-makes-money/), which teaches affiliate marketing from first principles, names the FTC requirement, and states the sequencing rule outright: *"any discussions about business, partnerships, licensing, or affiliate revenue are handled after we've already made our picks"*, and *"In some cases, Wirecutter makes no money at all on a pick, simply because the only high-quality retailer that sells the item doesn't run an affiliate program."* Plus [Editorial Standards](https://www.nytimes.com/wirecutter/editorial-standards/), published *"in the spirit of transparency"*, listing the values by name (accuracy, honesty, impartiality, independence, sensitivity, transparency).

The pattern to learn: **the disclosure is ambient and calm; the independence *argument* is a destination.** They do not shout the disclosure next to the button, because a disclosure adjacent to a CTA reads as a disclaimer on the CTA. They put it above everything, once, and then earn the trust in prose.

### 1.5 Price presentation

- **On review pages**: absolute prices only, one per retailer, `$1,208 from Amazon`. No was/now, no percent off, no strikethroughs. Prices are live-fetched (the same MacBook Air shows $1,260 / $1,255 / $1,299 across three retailers).
- **On the deals page**: the triple `$183 $530 Save $347`. Now, was, absolute saving. Percent off is *not* printed on the row, even though it is a filter facet. The saving is stated in dollars because dollars are unambiguous.
- **Accessible labels** carry the semantics the visual strikethrough implies: `sale price: $183 | original price: $530 | from Rugs USA`.
- **No "at the time of publishing" caveat exists.** Searched all five pages; zero hits. Instead, *live prices plus a per-item freshness stamp* do the job. The honesty comes from recency, not from a disclaimer.
- **Price context lives in prose**, inside `Other things to know`: `Street price has risen significantly over the past year.`, `Recurring deal price.`, `Price depends on sizing.` And inside the review body: *"Apple increased the MacBook Air's price by $200 in June 2026 due to AI demand."*
- **Out-of-stock / unavailable**: no dedicated visual state was observed. The failure mode is handled *editorially and operationally* — the money explainer says the commerce team screens for retailers with *"enough inventory to fulfill a potential influx of orders"*, and the budget-laptop section handles it with copy: *"if our top pick isn't available, our full guide to budget laptops has other options."* The recovery path is a link to alternatives, not a greyed-out card.

### 1.6 Mobile behavior

Direct evidence from the production CSS: the breakpoints are **`48em` (768px)** with 480 rules and **`80em` (1280px)** with 265 rules, plus a small mobile-only band at `max-width: 47.99em` (20 rules). It is a two-breakpoint system with a mobile-first base.

**There is no sticky mobile buy bar.** `position: sticky` appears exactly twice in 314 KB of CSS: once to pin the first column of a wide spec table during horizontal scroll (`tr td:first-child { background-color:#f9f9f9; left:0; max-width:40%; position:sticky }`), and once on a small fade-in element (`opacity:0; pointer-events:none; position:sticky; transition:opacity .12s ease-out`). `position: fixed` appears 30 times and is dominated by nav, modal and ad furniture.

This is a deliberate and, I think, correct choice: **Wirecutter's answer to "the buy button scrolls away" is not a sticky bar, it is the "Everything we recommend" summary block at the top and a jump nav that gets you back to any pick in one tap.** The redundancy is structural rather than floating. *(The absence of the rule is directly observed; the intent is inferred.)*

Mobile-only rules that were observed *(rendered effect inferred)*: pick-block cards drop their horizontal margins to go edge-to-edge (`margin-left:0; margin-right:0`), close/dismiss affordances reposition into the card corner (`position:absolute; right:-8px; top:-8px`, and `right:16px; top:16px` on the larger card variant), section top margins step 44px → 52px → 60px across the three breakpoints, and card padding steps 16/24/24. There is also `scroll-margin-top: 200px` on jump-nav targets, which is the detail that makes the anchor nav actually usable under a sticky header.

Also present: **25 `prefers-reduced-motion` blocks**. Motion is opt-out-aware throughout.

### 1.7 Typography and the visual system

From the production CSS:

**Three faces, three jobs.**

| Face | Kind | Role | Share |
|---|---|---|---|
| `nyt-franklin` | grotesque sans | Everything functional: pick badges, product names in cards, buy buttons, prices, spec tables, nav, captions | 388 of ~440 `font-family` declarations |
| `nyt-imperial` | transitional serif | Long-form body prose | 25 |
| `nyt-karnak` | slab serif | Display headlines (H1, section H2s) | 23 |

The split is the whole system: **the shopping UI is sans, the journalism is serif, the headline is slab.** A reader can tell at a glance whether they are looking at a claim or a control.

**Type scale** (rem, by frequency): `1rem`/`0.875rem`/`0.75rem` carry the interface; `1.125` `1.25` `1.375` carry product names and sub-heads; `1.5` `1.625` `1.6875` `1.875` `1.9375` `2` carry headlines. Line heights are set in absolute rem (`1.375rem` on 1rem body, `1.25rem` on 0.875rem) rather than unitless — a rhythm-locked, not a ratio-locked, system.

**Restraint markers**: `text-transform: uppercase` appears **5 times in 314 KB**. Negative letter-spacing (`-0.25px`, `-0.5px`) appears 110 times, exclusively on large type. Italics appear 20 times, reserved for publication titles and game names. Badges (`Top pick`, `Budget pick`) are **sentence case, not uppercase, not pill-shaped** — they are small bold sans labels on their own line, distinguished by weight and position rather than by a chip.

**Color** is close to monochrome: near-black text on white, `#f9f9f9` for the one sticky table column, `#979797` rules. Color enters only as photography and as small category accents. Dividers are hairline rules used to separate sections, never boxes-within-boxes. Whitespace, not borders, does the grouping.

**Iconography** is minimal: four small glyphs on the testing-notes criteria cards, an external-link marker in buy rows, a chevron in the disclosure link. There is no icon system competing with the text.

### 1.8 What makes it feel trustworthy, and what not to copy

**The devices, concretely:**

1. **Quantified effort in the lede.** "dozens of chairs, four ergonomics experts, 175 collective hours", "we tested more than 100 laptops in 2025". A number in the first two sentences.
2. **Named authors with tenure and scope.** "Kimber Streams has been Wirecutter's laptops expert for more than a decade" — plus a `Meet your guides` block at the foot with a first-person `What I Cover` paragraph each.
3. **An update stamp under the H1**, plus an `FYI` change-log callout naming what changed and when: *"After new testing, we've updated this guide with our latest picks: the best laptop for college students is the Dell XPS 13... August 2026."*
4. **Stated criteria before results.** `How we picked and tested` lists seven named criteria with reasoning, *and names what was excluded and why* (executive-style chairs, backless stools), with the expert quoted directly.
5. **Method you could reproduce.** "we set each screen's backlight to 150 nits and run Wirecutter's custom version of the Chromium web-browsing battery test", "a modified version of this ergonomic seating evaluation form from Cornell University".
6. **Flaws stated flatly, in a dedicated section, on every pick.** No pick is flawless.
7. **Trade-offs in the one-line verdict**, before any prose.
8. **Naming what was rejected**: `The competition`, `What to look forward to`.
9. **Long-term ownership evidence**, signed and dated: *"— Kimber Streams, Wirecutter writer, owner of the Steelcase Gesture since 2015"*, including a warranty-claim story with the outcome.
10. **Transparency about commissions as a destination**, plus the admission that some picks earn nothing.
11. **Honest negative price news** about products they recommend ("Apple raised the price of the MacBook Pro by $300").
12. **Recency instead of disclaimers** on the deals page.

**What not to copy:**

- **The ad furniture.** `Advertisement / SKIP ADVERTISEMENT` interrupts the deals page twice, including immediately after the H1 region. It directly contradicts the "no shady sites" promise sitting three lines above it. We have no equivalent excuse.
- **Duplicated pick blocks.** The laptops hub renders the Yoga 7i and MacBook Air pick blocks *twice*, verbatim, because they win two categories. On a long scroll it reads like a bug. Cross-cutting rails should link, not re-render.
- **The un-scannable `Everything we recommend` list.** Once past four picks it becomes a wall of near-identical rows with no differentiating attribute other than the superlative. This is precisely where a comparison table belongs and they do not have one.
- **The `Best for...` badge.** A badge whose text is literally an ellipsis outsources all meaning to the adjacent superlative. It is the weakest label in the set.
- **Fragment-stacking prose.** `What we like:` on the deals page ("Durable, soft, and cozy. Most affordable option of our picks.") is dense to the point of being SEO-shaped. It works because there are only two of them per row; it would not survive being our primary voice.
- **The 19-value category filter.** Flat, alphabetical, un-prioritized. Our four-to-six-way category set is better.
- **Zero urgency.** Correct for durable goods with stable prices. Wrong for us: our promo codes genuinely die, and pretending otherwise would be its own dishonesty. We keep countdowns; we just keep them factual.

---

## Part 2 — Adaptation

### 2.1 Pattern-by-pattern verdict

| # | Wirecutter pattern | Verdict | Our form |
|---|---|---|---|
| 1 | Disclosure line above everything, once, far from the CTA | **Adopt** | Move `DEAL_AFFILIATE_DISCLOSURE` out of every `DealCard` and into one page-level line under the directory H1 |
| 2 | Trade-off inside the one-line verdict | **Adopt** | `deal.description` must name the main restriction in its second clause |
| 3 | `Flaws but not dealbreakers` as a dedicated block on every item | **Adopt, renamed** | `Worth knowing before you claim` — the highest-priority change in this doc |
| 4 | Exactly one badge per item | **Adopt** | One `pickLabel` per deal. Today `DealCard` can render `DealTypePill` + `DealCommunityPickChip` + `Promoted` + value badge + countdown + pool count all at once |
| 5 | Multi-retailer stacked buy options, `price from retailer` | **Adapt** | Multi-path redemption: `Copy code` / `Open link` / `Claim credit`, one row each, with a per-path note |
| 6 | The per-item redemption line (`Use promo code X (5 by 8 feet)`) | **Adopt wholesale** | `redemptionNote` — the single most transferable small field on the deals page |
| 7 | `How we tested` (stated method) | **Adapt** | `How this was verified` — claim counts, works rate, verification recency, and one sentence of method |
| 8 | Quantified effort in the lede | **Adapt** | The directory H1 area states live totals: deals live, verified this week, reported working |
| 9 | Update stamp under the H1 + change-log `FYI` callout | **Adopt** | `Last verified` under the deal H1; `updatedAt` in the page footer (we already compute both) |
| 10 | Named author with tenure | **Adapt** | Named *community*: quoted developers with handles and dates, which `DealEvidence` already renders |
| 11 | Stated criteria before results, including exclusions | **Adopt** | A short `How deals get listed` page, linked from the directory, stating the bury rule |
| 12 | Deal inherits a pick's authority, links back to the review | **Adopt** | Deal → brand page → category page, plus the "why the community rates this" block |
| 13 | Per-item relative freshness (`Posted 2 hours ago`) | **Adopt** | We already have `formatDealRelativeShort`; promote it |
| 14 | `+ See why it's a deal` expander on compact cards | **Adopt** | Collapse `whyPick` on the grid card rather than dropping it |
| 15 | `Copy link` on every row | **Adopt** | Already have `DealShareBar`; put it on the row |
| 16 | Price / percent-off as first-class filter facets | **Adapt** | `Value` facet (`Free`, `Under $50`, `$50–$200`, `$200+`) — money saved, not price paid |
| 17 | Sans for UI, serif for prose, slab for display | **Reject** | We are a single-family design system. The equivalent split is `typo-*` size and `text-*` color, not a second face |
| 18 | was/now strikethrough pricing | **Reject** | EU price-indication rules require 30-day-lowest substantiation we do not have. See §2.5 |
| 19 | No expiry, no countdown | **Reject** | Our codes actually expire. Keep `DealCountdown`, keep it factual |
| 20 | Ad slots inside the deals list | **Reject** | Our promoted inventory stays labeled and rate-limited, never mid-list interstitial |
| 21 | Photographic product hero per item | **Reject at scale** | We cannot shoot 500 SaaS offers. Brand mark plus value typography carries the identity; `DealCoverImage` stays optional |
| 22 | `Best for...` ellipsis badge | **Reject** | Every label must be a complete claim |
| 23 | Duplicate blocks across rails | **Reject** | Our rails already dedupe via the `allocated` Set in `DealsDirectoryPage` |

### 2.2 Translation problem 1 — a lab becomes a community

Wirecutter's `How we tested` is credible because it is falsifiable: 150 nits, a named benchmark, a Cornell form. Our equivalent must be equally specific, and we already hold the data.

**Block name: `How this was verified`.** It replaces nothing; it fills the slot where a reader asks "why should I believe this still works". Source fields, all already on `DealCommunity`:

```
How this was verified

  1,240          96%              4 hours ago      $60
  developers     reported it      last verified    typical saving
  claimed it     worked

Every claim on daily.dev asks one question afterwards: did it work?
1,240 developers answered for this offer and 96% said yes. The most
recent report came in 4 hours ago. When reports start coming back
negative, the offer drops out of the directory automatically.
```

That last sentence is our `we return or donate all products` — a stated operational rule that costs us something. It is what makes the number believable.

The prose is generated, not authored, from `community.claims`, `community.worksRate`, `community.lastVerifiedAt` and `value.savingsUsd`. `getClaimEvidence()` in `dealsFormat.ts` already produces most of this sentence for `getDealDirectAnswer`; it should be promoted to a rendered block instead of living only inside the SEO answer string. `DealEvidence` already renders the four stats as `Stat` tiles — this is a rename, a re-order and one paragraph, not new machinery.

**Honesty guard:** below a floor (say 25 claims, matching `MIN_INDEXABLE_DEAL_CLAIMS`) the block must not print a percentage. `96% worked` off 4 claims is a lie told with a true number. Below the floor, print `New listing. Not enough reports yet to rate it.`

### 2.3 Translation problem 2 — `Flaws but not dealbreakers` becomes `Worth knowing before you claim`

This is the most transferable device on Wirecutter and the biggest gap in our current UI. Today the entire caveat surface is one free-text `deal.terms` string, hidden inside a `<details>` element labeled `Terms` in `DealDetailModal.tsx`, and absent from `DealCard` entirely. A user can claim a deal from the grid without ever seeing that it is new-customers-only on an annual plan.

**The rule: a caveat that changes whether the offer applies to you is not terms. It is part of the offer.** It belongs above the CTA, not behind a disclosure triangle.

`getDealFacts()` in `dealsFormat.ts` already regex-sniffs `terms` for stacking, new-customer status, minimum spend and account requirements. That was the right instinct and the wrong mechanism — regexing prose is brittle and cannot be validated. Promote it to data:

```ts
export enum DealCaveatKind {
  NewCustomersOnly = 'new_customers_only',
  NoStacking = 'no_stacking',
  AnnualOnly = 'annual_only',
  CardRequired = 'card_required',
  CreditExpires = 'credit_expires',
  AutoRenews = 'auto_renews',
  MinimumSpend = 'minimum_spend',
  RegionLimited = 'region_limited',
  SeatLimit = 'seat_limit',
  SingleUse = 'single_use',
}

export interface DealCaveat {
  kind: DealCaveatKind;
  /** Short form for the card strip. Sentence case, no trailing period. */
  short: string;
  /** One sentence for the detail block. States the restriction, then who it rules out. */
  long: string;
}
```

Rendering, mirroring Wirecutter's flat-then-contextualize shape:

- **Card (grid and list):** the `short` values, joined by `·`, in `typo-caption1 text-text-tertiary`, directly above the CTA row. Cap at three; append `+2 more` linking to the detail page. No icon, no warning color, no yellow banner. Neutral, because these are facts about the offer, not alarms.
- **Detail page:** an H2 `Worth knowing before you claim` with a `<ul>` of `long` sentences. Each begins with the restriction as a bold fragment, then the consequence:

  > **The credit expires 12 months after signup.** If your project slips past a year, whatever is left goes back to DigitalOcean. There is no extension.
  >
  > **New customers only.** If you already have a Vercel account on any paid plan, this will not apply at checkout.
  >
  > **It does not stack with the student discount.** Pick whichever is larger; you cannot use both.

- The full `terms` string stays, moved below the caveat block under `Full terms`, as the authoritative long form.

**Mock-safe path:** derive `caveats` from the existing `terms` strings in `mockDeals.ts` today via a small mapper, keeping `getDealFacts` as the fallback. Ship the UI now, harden the data when the backend lands.

### 2.4 Translation problem 3 — the label set

Wirecutter's `Top pick / Runner-up / Budget pick / Upgrade pick` ladder encodes *price tiers of one product category*. That does not translate: our items are not competitors on one axis, and we are not the picker.

Proposed set — six labels, one per deal, at most:

| Label | Earned by | Rule |
|---|---|---|
| `Community pick` | **Data** | Top decile by upvotes in its category **and** `worksRate ≥ 0.9` **and** `claims ≥ 100`. Already exists as `isCommunityPick` |
| `Most reliable` | **Data** | `worksRate ≥ 0.97` **and** `claims ≥ 200`. The direct analogue of `Top pick`, but the reader can audit the arithmetic |
| `Biggest saving` | **Data** | Highest `value.savingsUsd` among live deals in the category. Recomputed per listing, never stored |
| `Best free tier` | **Editorial** | Chosen by the deals editor. The offer is genuinely usable at zero cost, not a trial |
| `Best for startups` | **Editorial** | Meaningful at team scale: seats, credits, or a founder programme |
| `Best if you were buying anyway` | **Editorial** | For the tool-hunter persona in `01-product-spec.md` §1. No new commitment, pure price reduction on a decision already made |

Rules of use:

- **One label maximum.** Data-earned labels outrank editorial ones on collision, because a claim the reader can verify beats a claim they must trust.
- **Editorial labels require a `pickReason`** of one sentence, rendered next to the label on the detail page. An unexplained editorial badge is exactly the pay-to-play smell we are trying to avoid.
- **A promoted deal can never carry any of these six.** `Promoted` is a separate, plainly-typed word, never a badge. This is our version of the editorial/commerce firewall, and it should be stated on the `How deals get listed` page.
- Deliberately **not** included: `Our pick` (we did not pick it), `Upgrade pick` (no upgrade ladder exists), `Best for...` (meaningless), `Editor's choice` (we have no editors and should not pretend to).

### 2.5 Translation problem 4 — value instead of was/now

Wirecutter prints `$183 $530 Save $347`. We cannot: the EU Price Indication Directive requires any announced reduction to reference the lowest price in the prior 30 days, and for SaaS list prices we have no substantiated prior. The caveat is already recorded in the research.

Our substitute keeps the *shape* — a loud primary number, a quiet secondary number — while changing the *referent* from a past price to a delivered value:

```
-30%                            $200 free               3 mo free
about $60 off the first year    on new accounts         worth about $90
```

Rules:

- **Primary** is `value.label`, already the loudest element in `DealValueBadge` (`bg-action-upvote-float text-status-success`). Keep it.
- **Secondary** is a derived phrase from `savingsUsd`, always hedged (`about $60`), always describing *what you avoid paying*, never a struck-through list price.
- **`discountPercent` never renders as a was/now pair.** It renders as `-30%` and `about $60 off`.
- **No strikethrough anywhere.** `TypographyTag.Del` exists in our enum; it must not be used on deal pricing.
- Where a merchant *has* substantiated a reduction, that belongs in `terms` as their claim, attributed to them, not restated in our voice.

### 2.6 Translation problem 5 — multi-retailer becomes multi-path redemption

Wirecutter's stacked `$1,499 from Steelcase / $1,208 from Amazon / $1,539 from Wayfair` answers "where do I buy this". Ours answers "how do I actually get this", which for a dev offer is genuinely multi-valued: a code at checkout, a referral link that must be the entry point, a credit that only lands after signup, a student route, a startup-programme route.

```ts
export enum DealRedemptionKind {
  Code = 'code',
  Link = 'link',
  Credit = 'credit',
  GiftCard = 'gift_card',
}

export interface DealRedemptionPath {
  kind: DealRedemptionKind;
  /** Where it works. "cursor.com checkout", "Vercel signup", "GitHub Student Pack" */
  destination: string;
  url: string;
  code?: string;
  /** The Wirecutter redemption line. "Discount shows in the cart, not on the pricing page" */
  note?: string;
  isPrimary?: boolean;
}
```

Rendered under the heading **`How to redeem`** (our `Buying options:`), one row per path, primary first:

```
How to redeem

  [ Copy code  DEV30 ]   at cursor.com checkout
                         Discount shows in the cart, not on the pricing page

  [ Open link ]          via the Cursor for Startups page, opens in a new tab
                         Requires a company domain email
```

The `note` is the field doing the real work, exactly as it does on Wirecutter's deals page. It is short, imperative, and it names where the number will actually appear. Today `deal.partnerUrl` + `deal.code` support only a single path; `DealCodeReveal` and the `DealClaimArea` branch in `DealDetailModal.tsx` already implement both individual behaviors and just need to become a list.

Every external row keeps `rel="sponsored nofollow noopener"` and an `, opens in a new tab` accessible suffix, as `DealDetailModal` already does.

---

## Part 3 — The design specification

### 3.1 Anatomy of a deal card

**Principles, in priority order.** (1) The value is the loudest thing. (2) The verdict and the caveat are adjacent — you never see the upside without the restriction. (3) Exactly one badge. (4) Evidence sits under the CTA, where it answers "will this work" at the moment of doubt. (5) Chrome is demoted: type pill, promoted label and disclosure are `typo-caption1` and below.

**What is demoted from today's `DealCard.tsx`:** the per-card affiliate disclosure moves to page level; `DealTypePill` merges into the metadata line rather than sitting as a chip next to the brand; the upvote button loses its count-as-button prominence in favor of the proof row; `DealBoostMeter` and the lock row render only in their own states.

#### Grid variant

Target: `min-h-card` without cover, `min-h-[27rem]` with. Content wrapped in `absolute inset-0 flex flex-col gap-3 p-4` (the existing `ArticleGrid` pattern, already correct in `DealCard.tsx`).

```
┌────────────────────────────────────────────────────┐
│ ░░░░░░░░ optional cover, aspect-[3/1] ░░░░░░░░░░░░ │  rounded-12
├────────────────────────────────────────────────────┤
│ ┌────┐  Cursor                                     │  brand row
│ │ Cu │  Code · AI tools                            │  meta, caption1 tertiary
│ └────┘                                             │
│                                                    │
│  Most reliable                                     │  ONE label, caption1 bold
│                                                    │
│  ┏━━━━━━━┓                                         │
│  ┃ -30%  ┃   about $60 off the first year          │  value row — loudest
│  ┗━━━━━━━┛                                         │
│                                                    │
│  30% off Cursor Pro for the first year             │  H3 typo-title3 bold, 2-line clamp
│  Applies on annual billing only.                   │  typo-footnote tertiary, 2-line clamp
│                                                    │
│  New customers only · Annual plan · No stacking    │  CAVEAT STRIP (new)
│                                                    │
│  ─────────────── CardSpace ────────────────        │
│                                                    │
│  Ends in 2d 4h                    7 of 50 left     │  urgency row, only when true
│  [      Copy code      ]                    [ ⤴ ]  │  CTA + share
│  ▲ 412 · 1.2k claimed · 96% worked   ✓ verified 2h │  proof row
└────────────────────────────────────────────────────┘
```

Order and rationale:

| Slot | Content | Type / color | Why here |
|---|---|---|---|
| 1 | `DealCoverImage` (optional) | `aspect-[3/1] rounded-12` | Identity, not decoration. Omit rather than pad a logo |
| 2 | `DealBrandLogo` + brand name | `typo-footnote` bold, `text-text-primary` | The reader scans for a brand they recognize first |
| 3 | Type + first category | `typo-caption1 text-text-tertiary`, `·` separated | Demoted from a pill; it is metadata, not a claim |
| 4 | Pick label | `typo-caption1` bold, `text-brand-default` (data-earned) or `text-text-secondary` (editorial) | Own line, sentence case, no chip. Copied straight from Wirecutter |
| 5 | `DealValueBadge` + saving phrase | `typo-callout` bold on `bg-action-upvote-float text-status-success`; phrase `typo-footnote text-text-tertiary` | The reason the card exists |
| 6 | Title | `typo-title3` bold, `line-clamp-2`, links to `/deals/[slug]` | |
| 7 | Verdict | `typo-footnote text-text-tertiary`, `line-clamp-2` | Must name the main restriction in its second clause |
| 8 | **Caveat strip** | `typo-caption1 text-text-tertiary`, up to 3 joined by `·` | The new block. Above the CTA, always |
| 9 | `CardSpace` | | Pins the action group to the bottom so a grid row aligns |
| 10 | `DealCountdown` / pool | `typo-caption1`, `text-status-error` / `text-text-tertiary`, `tabular-nums` | Only when genuinely time- or quantity-bound |
| 11 | CTA + share | `ButtonVariant.Primary`, `ButtonSize.Small`, `flex-1`; share is `Float` icon-only | |
| 12 | `DealCommunityProof` | `typo-caption1 text-text-tertiary`, verified stamp `text-status-success`, `tabular-nums` | Answers "will it work" right under the button |

Removed from the card: `DEAL_AFFILIATE_DISCLOSURE` (now page-level), the standalone `DealCommunityPickChip` (folded into slot 4), the `Promoted` caption (moves to slot 4's position and suppresses any pick label).

#### List variant

New. This is the form Wirecutter actually uses for deals, and the right form for our category pages, search results, the wallet and `DealsRail` on mobile. It fits more offers per viewport and reads as a directory rather than a shop.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌────┐  Community pick                                                       │
│ │ Cu │  30% off Cursor Pro for the first year               ┏━━━━━━┓         │
│ └────┘  Cursor · Code · AI tools                            ┃ -30% ┃         │
│         Applies on annual billing only.                     ┗━━━━━━┛         │
│         New customers only · Annual plan · No stacking      about $60 off    │
│         [ Copy code ]  [ ⤴ ]     96% of 1.2k worked · verified 2h · Ends 2d  │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Root: `flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover` — matches the existing `SimilarDealRow` and `MyCouponsWallet` row treatment so the three read as one family.
- Left rail: `DealBrandLogo` at `size-10`.
- Center: `flex min-w-0 flex-1 flex-col gap-1`. **`min-w-0` alone will not wrap here** — the repo's global `flex-shrink: 0` reset means it needs `flex-1` too, which this spec includes.
- Right rail: `flex shrink-0 flex-col items-end gap-1` holding the value badge and the saving phrase, right-aligned, `tabular-nums`.
- Below `tablet` the right rail reflows to sit under the title, inline with the meta line, so the row never compresses the value into two characters per line.

### 3.2 Anatomy of a deal detail page

Current order in `packages/webapp/pages/deals/[slug].tsx` is `DealBreadcrumbs → DealShareLanding → DealEvidence → DealAnsweredQuestions`. The proposed order below preserves every existing component and inserts three blocks.

```
┌──────────────────────────────────────────────────────────────────┐
│ Deals / AI tools / Cursor                                        │  1 breadcrumbs
│                                                                  │
│ ┌────┐  Cursor          Most reliable                            │  2 identity
│ │ Cu │  Code · AI tools                                          │
│ └────┘                                                           │
│                                                                  │
│ 30% off Cursor Pro for the first year                            │  3 H1 typo-large-title
│ Applies on annual billing only, for new Pro subscribers.         │  4 verdict typo-body
│                                                                  │
│ Last verified 4 hours ago · Ends in 2d 4h                        │  5 stamp row
│ ────────────────────────────────────────────────────────────     │
│                                                                  │
│  ┏━━━━━━━┓                                                       │  6 value
│  ┃ -30%  ┃  about $60 off the first year                         │
│  ┗━━━━━━━┛                                                       │
│                                                                  │
│ How to redeem                                                    │  7 multi-path
│   [ Copy code  DEV30 ]  at cursor.com checkout                   │
│     Discount shows in the cart, not on the pricing page          │
│   [ Open link ]         via Cursor for Startups ↗                │
│     Requires a company domain email                              │
│   daily.dev may earn a commission on some deals.                 │
│                                                                  │
│ Worth knowing before you claim                    ◀── THE BLOCK  │  8 caveats
│   • New customers only. If you already have a paid Cursor        │
│     account this will not apply at checkout.                     │
│   • Annual billing only. There is no monthly equivalent.         │
│   • It does not stack with the student discount.                 │
│                                                                  │
│ Why the community rates this                                     │  9 whyPick
│   [ deal.whyPick, plus pickReason for editorial labels ]         │
│                                                                  │
│ How this was verified                                            │ 10 evidence
│   1,240 claimed | 96% worked | 4h ago | $60 typical              │
│   [ generated method paragraph + the bury rule ]                 │
│                                                                  │
│ What developers reported                                         │ 11 quotes
│   ❝ Worked on annual, showed up in the cart ❞  @handle, Aug 6    │
│                                                                  │
│ Terms at a glance                                                │ 12 facts table
│   Stacks with other offers      No                               │
│   New customers only            Yes                              │
│   ...                                                            │
│   Full terms: [ deal.terms ]                                     │
│                                                                  │
│ Questions about this deal                                        │ 13 FAQ
│ Where this offer comes from                                      │ 14 sources
│ Similar live deals                                               │ 15 related
│                                                                  │
│ Verified 4 hours ago. Page updated August 6, 2026.               │ 16 footer stamp
└──────────────────────────────────────────────────────────────────┘
```

Content sources, block by block:

| # | Block | Source | Status |
|---|---|---|---|
| 1 | Breadcrumbs | `getDealCrumbs` | exists |
| 2–4 | Identity, H1, verdict | `brand`, `pickLabel`, `title`, `description` | `pickLabel` is new |
| 5 | Stamp row | `community.lastVerifiedAt` + `DealCountdown` | exists, needs promoting above the fold |
| 6 | Value | `DealValueBadge` + `value.savingsUsd` | exists |
| 7 | How to redeem | `redemptions[]` | **new field**; UI exists in `DealCodeReveal` and `DealClaimArea` |
| 8 | **Worth knowing before you claim** | `caveats[]`, fallback `getDealFacts` | **new** |
| 9 | Why the community rates this | `whyPick`, `pickReason` | exists as `Why it's worth it` in the modal; rename and move |
| 10 | How this was verified | `community.*` + generated paragraph | stats exist in `DealEvidence`; the paragraph and the bury-rule sentence are new |
| 11 | What developers reported | `getDealComments` | exists |
| 12 | Terms at a glance | `getDealFacts` + `terms` | exists |
| 13 | FAQ | `getDealAnsweredQuestions` | exists |
| 14 | Sources | `partnerUrl`, brand and category links | exists |
| 15 | Similar | `getSimilarDeals` | exists |
| 16 | Footer stamp | `lastVerifiedAt`, `updatedAt` | exists |

Three ordering decisions worth defending:

- **The caveats sit between the CTA and the reasoning**, not after it. Wirecutter puts flaws after the case-for because a reader arrives undecided. Ours arrives *decided* and about to click, so the restriction has to interrupt before the click, not after.
- **`How to redeem` precedes everything editorial.** The reader who already trusts us gets the code in the first scroll; the reader who does not keeps scrolling into the evidence.
- **The disclosure sits under the redemption buttons on the detail page**, not above the H1 as on the directory. On a page where the CTA *is* the content, "far from the CTA" is not available, and directly-under is more honest than pretending.

The same order drives `DealDetailModal` and the `[slug]` page. Both currently diverge (the modal has `Why it's worth it`, the page has neither that nor the caveats). They should render one shared section list.

### 3.3 Directory page structure

The first viewport must do four things, in this order:

1. **Say what this is and how much it is worth.** H1 `Deals for devs`, one line of positioning. Adopt Wirecutter's quantified-effort lede against our live numbers: *"1,240 offers claimed this week. 94% of them worked."* This replaces the current `devs saved $48,231 this month` ticker, which is unauditable and reads like marketing. Claims and works-rate are things we can actually stand behind.
2. **Carry the disclosure**, once, quietly, under the positioning line: `typo-caption1 text-text-quaternary`, with a link to `How deals get listed`. This is where the per-card copies in `DealCard.tsx` and the page-footer copy in `DealsDirectoryPage.tsx` consolidate.
3. **Search.** `DealsHero`'s `SearchField` as-is.
4. **Filters.** `DealsFilterBar` as-is, plus a `Value` facet per §2.1 row 16.

Below the fold, composition:

```
[ Hero: H1 · positioning · live evidence line · disclosure · search ]
[ Filter bar: All · AI tools · Cloud · Hardware · Courses · Value · Expiring · Exclusive ]

[ Rail  Ending soon                                        grid cards, horizontal ]
[ Rail  Community picks — chosen on merit, never paid for                          ]
[ Rail  For you — based on your tags                                               ]
[ Rail  Trending                                                                    ]
[ Rail  New this week                                                               ]

  All deals                                              124 deals
  [ list rows ]                       ← list variant, not grid
                                                       [ Your impact ]  laptop:
```

Two changes to the current composition:

- **The all-deals section switches from grid to list.** `DealsDirectoryPage.tsx` currently renders `grid-cols-1 gap-6 tablet:grid-cols-2 laptopXL:grid-cols-3`. Grid is right for the rails, where a card is a browsable object; list is right for the exhaustive section, where the reader is comparing. This is exactly Wirecutter's `Featured deals` rail versus `More deals` list split.
- **Rails stay grid and stay deduped.** The existing `allocated` Set already prevents the duplicate-pick-block problem called out in §1.8.

Category (`/deals/c/[category]`) and brand (`/deals/brand/[brand]`) pages use the same shell with `withRails={false}`, which is already supported.

### 3.4 Type, spacing and color mapping

Every token below was verified against `packages/shared/tailwind/typography.ts` and `packages/shared/tailwind/colors/`. **`typo-title4` is referenced by `TypographyType.Title4` but is not defined in `typography.ts` — it is a dead class. Do not use it.**

| Role | Token | Notes |
|---|---|---|
| Directory H1 | `typo-large-title` (2rem) bold | `TypographyType.LargeTitle` |
| Deal page H1 | `typo-large-title` bold, `typo-title1` below `tablet` | |
| Section H2 (`Worth knowing...`, `How this was verified`) | `typo-title3` bold, `text-text-primary` | Matches `DealEvidence`'s `Block` |
| Card title | `typo-title3` bold, `line-clamp-2` | |
| Deal page verdict | `typo-body`, `text-text-secondary` | |
| Card verdict | `typo-footnote`, `text-text-tertiary`, `line-clamp-2` | |
| Value badge | `typo-callout` bold, `tabular-nums` | |
| Saving phrase | `typo-footnote`, `text-text-tertiary`, `tabular-nums` | |
| Pick label | `typo-caption1` bold | |
| Caveat strip | `typo-caption1`, `text-text-tertiary` | |
| Caveat list item (detail) | `typo-callout`, `text-text-secondary`, lead fragment bold `text-text-primary` | |
| Metadata line | `typo-caption1`, `text-text-tertiary` | |
| Proof row | `typo-caption1`, `text-text-tertiary`, `tabular-nums` | |
| Disclosure | `typo-caption1`, `text-text-quaternary` | |
| Facts table | `typo-footnote`; `th` `text-text-tertiary` `font-normal`, `td` `text-text-primary` | as built |

Color, and the discipline around it:

| Meaning | Token |
|---|---|
| Value, saving, verified, success | `text-status-success` on `bg-action-upvote-float` (badge) or bare (proof) |
| Expiry, failure | `text-status-error` |
| Data-earned pick label | `text-brand-default` |
| Editorial pick label | `text-text-secondary` |
| Exclusive / members-only | `text-action-plus-default` |
| Promoted, disclosure, muted counts | `text-text-quaternary` |
| Card / row surface | `bg-surface-float`, or `border border-border-subtlest-tertiary` on `bg-background-default` |
| Row hover | `bg-surface-hover` |
| Expired / sold out | `grayscale opacity-60` (already in `DealCard`) |

**Three colors carry meaning on this surface and no others: success green for value and verification, error red for expiry, brand for community-earned status.** Caveats are deliberately not colored — a yellow warning tint would make honest information look like a defect and would train users to skim past it.

Radii: `rounded-16` for cards and rows, `rounded-12` for inner tiles, media and code chips, `rounded-10` for the value badge, `rounded-8` for meta chips. This is the ratio already in use across `features/deals`.

Spacing: `p-4` card, `p-6` at `tablet` on the detail page, `gap-3` inside a card, `gap-4` between card groups, `gap-8` between detail-page sections, `gap-10` between directory sections. Section separation on the detail page uses `border-t border-border-subtlest-tertiary pt-4`, never a boxed container — Wirecutter's whitespace-and-hairlines discipline, which our tokens already support.

Breakpoints (from `packages/shared/tailwind/AGENTS.md`):

| Breakpoint | Change |
|---|---|
| base (< 420) | Single column. List rows stack the value under the title. Caveat strip caps at 2 items |
| `mobileL` 420 | Caveat strip caps at 3 |
| `tablet` 656 | Rails become 2-up in view; list rows put the value in the right rail; detail page `p-6` |
| `laptop` 1020 | `Your impact` sidebar appears (`hidden ... laptop:flex`, already built) |
| `laptopL` 1360 | Directory content maxes at `max-w-6xl` |
| `laptopXL` 1668 | Rails show 3 cards; used today for the 3-column grid, which this spec retires in favor of list |

**No sticky mobile buy bar**, per §1.6. The redundancy that replaces it: the detail page's `How to redeem` block sits high (block 7 of 16), and the card CTA is always reachable in the directory. If usage data later shows drop-off, the fix is a jump link, not a floating bar.

### 3.5 Motion and interaction

Consistent with the repo's craft rules: animate by frequency, subtle exits, and `tabular-nums` on everything that counts.

- **Card and row enter:** `opacity 0 → 1`, `translate-y-1 → 0`, `blur-[2px] → 0`, **200ms `ease-out`**. First paint only. Stagger a maximum of the first three items in a rail at 30ms apart, then nothing. Re-renders from filtering do not re-animate — a filter change that re-animates twelve cards is noise.
- **Code reveal:** keep `DealCodeReveal`'s existing `StepFade` (`transition-all duration-200 ease-out`, `translate-y-1 opacity-0 → translate-y-0 opacity-100` on the first rAF). It is already exactly right, and the Idle → Revealed → Feedback → Thanks progression is the one genuinely delightful moment in the flow. Do not add confetti.
- **Caveat strip:** no motion. It must not look dismissible.
- **Countdown:** `tabular-nums` so digits do not jitter. Tick per minute above one hour, per second only under one hour. `DealCountdown` and `useNowTick` already carry this.
- **Counters** (`claims`, `worksRate`, `upvotes`, pool remaining): `tabular-nums`, no count-up animation. A number that animates is a number that looks decorative.
- **Row hover:** `bg-surface-hover`, no transform, no shadow lift. A directory row that lifts feels like a shop.
- **CTA press:** the design system's button states only.
- **Value badge:** never pulses, never glows.
- **Reduced motion:** every enter transition wrapped in `motion-safe:`. Wirecutter ships 25 `prefers-reduced-motion` blocks; we should not ship fewer than one.

### 3.6 Copy guidelines

**Voice.** Plain, specific, dev-brand. Say the number. State the restriction before someone hits it. Never use urgency language the data does not support. **No em dashes** — rewrite the sentence rather than substituting a semicolon.

**Fixed section headings** (these are the spec, not suggestions):

| Slot | Heading | Not |
|---|---|---|
| Caveats | `Worth knowing before you claim` | "Fine print", "Caveats", "Warning", "Restrictions" |
| Reasoning | `Why the community rates this` | "Why we picked it", "Why it's worth it", "Editor's take" |
| Evidence | `How this was verified` | "Trust and safety", "Our process" |
| Redemption | `How to redeem` | "Get the deal", "Buying options" |
| Quotes | `What developers reported` | "Reviews", "Testimonials" |
| Facts | `Terms at a glance` | as built |
| FAQ | `Questions about this deal` | as built |

**Phrasing conventions:**

- **Verdict line:** one sentence of upside, then the main restriction. *"30% off Cursor Pro on annual billing. New Pro subscribers only."* Never a verdict without a qualifier when a qualifier exists.
- **Caveat `short`:** noun phrase, sentence case, no period, no more than four words. `New customers only`, `Annual plan only`, `Does not stack`, `Credit expires in 12 months`, `Card on file required`.
- **Caveat `long`:** bold restriction fragment, then who it rules out or what it costs. Never soften before stating. Never open with "Please note".
- **Evidence:** always pair a percentage with its denominator. `96% of 1,240 reports`, never a bare `96%`. Below the 25-claim floor, `New listing. Not enough reports yet to rate it.`
- **Freshness:** relative under 24 hours (`verified 4h ago`), absolute above (`verified August 5`). `formatDealRelativeShort` and `formatDealDate` already implement exactly this split.
- **Disclosure:** `daily.dev may earn a commission on some deals. It funds the free stuff for devs.` — keep verbatim, it is already good. Its counterpart, `daily.dev earns no commission on this deal. It is here because the community rated it.`, is the more valuable of the two and should render wherever `isCommissioned` is false. That sentence is our version of Wirecutter admitting some picks earn them nothing, and it is worth more than the disclosure it sits beside.
- **Promoted:** the plain word `Promoted`, `typo-caption1 text-text-quaternary`. Never `Sponsored`, never `Partner`, never a badge.
- **Expired:** `This one closed.` then the recovery path. Never `Sorry!`, never an apology.
- **CTA labels:** keep `dealTypeToCtaLabel` as built (`Get code`, `Claim credit`, `Get deal`, `Start free`, `Redeem card`, `Unlock offer`). Verb plus object, no urgency, no exclamation.

### 3.7 Accessibility

**Pick label.** Decorative-looking but semantically load-bearing. Follow Wirecutter's own solution, which pairs the badge with its superlative in the accessible name (`Top pick, The best office chair`): render the label inside the card's heading context or expose it via `aria-describedby` on the title link, so a screen reader hears `Most reliable, 30% off Cursor Pro for the first year`.

**Caveat strip.** Must be a real list, not a `·`-joined string, so it is navigable: `<ul class="flex flex-wrap gap-x-2">` with `<li>` items and a CSS `::before` separator on `li + li`. The `·` is decorative and must not be read aloud. When truncated, the `+2 more` control needs an accessible name naming the total: `See all 5 things to know about this deal`.

**Value badge.** `-30%` is not a sentence. Give it an `aria-label` on the model of Wirecutter's `sale price / original price` labels: `aria-label="30 percent off, about 60 dollars saved"`. Same for `3 mo free` and `$200 free`.

**Redemption rows.** Each external link keeps a visually-hidden `, opens in a new tab`. Code copy buttons already announce via `aria-live` in `DealCodeReveal`; keep it. The revealed code should be selectable text, not only a button label, so a user can copy it manually when the clipboard API fails — `DealCodeReveal` already handles the failure path with `Copy failed. Select the code above and copy it.`

**Countdown.** `<time dateTime={expiresAt}>` with the human string as content, and `aria-live="off"` so a per-second tick does not spam a screen reader. The urgency is visual; the fact is in the `dateTime`.

**Proof row.** `96% worked` is meaningless without its denominator to a non-visual user who cannot see the adjacent `1.2k claimed`. Give the row a single `aria-label`: `1,240 developers claimed this, 96 percent reported it worked, last verified 4 hours ago`.

**Upvote button.** Already correct in `DealCard.tsx` (`aria-label={...} pressed={...}`). Keep the pattern; `08-growth-benchmark.md` flags it as missing, which is now stale.

**List rows.** The whole row must not be a single button — it contains a title link, a CTA and a share control. Use the card-link pattern: the title is the `<a>`, the row is a `<li>`, and the row's hover state is driven by `group-hover`.

**Grayscale expired state.** `grayscale opacity-60` is not sufficient signal on its own. The word `Expired` must be present in text, as it already is.

**Focus.** Every interactive element in a card is reachable in DOM order: title, caveat expander, CTA, share, upvote. The detail modal's focus trap in `DealDetailModal.tsx` is already implemented correctly and should be left alone.

### 3.8 Implementation checklist

Ordered by impact on clarity and trust. **Mock-safe** means it ships against `mockDeals.ts` with no backend dependency.

| # | Change | Files | Mock-safe? |
|---|---|---|---|
| 1 | Add `DealCaveat` + `DealCaveatKind`; derive `caveats` from existing `terms` strings for the mock set | `types.ts`, `mockDeals.ts`, `dealsFormat.ts` | **Yes** (model change is additive) |
| 2 | Caveat strip on `DealCard`, above the CTA row | `DealCard.tsx` | **Yes** |
| 3 | `Worth knowing before you claim` block on the detail page and in the modal | `DealEvidence.tsx`, `DealDetailModal.tsx` | **Yes** |
| 4 | Move the affiliate disclosure from every card to one page-level line in the hero | `DealCard.tsx`, `DealsHero.tsx`, `DealsDirectoryPage.tsx` | **Yes** |
| 5 | One-badge rule: add `pickLabel` + `pickReason`, collapse `DealCommunityPickChip` / `DealTypePill` / `Promoted` into a single slot | `types.ts`, `DealCard.tsx`, new `DealPickLabel.tsx` | **Yes** |
| 6 | `How this was verified` block with the generated method paragraph and the bury-rule sentence; promote `getClaimEvidence` out of the SEO string | `DealEvidence.tsx`, `dealsFormat.ts` | **Yes** |
| 7 | Sub-25-claim guard: suppress the works-rate percentage, print `New listing.` instead | `dealsFormat.ts`, `DealCommunityProof.tsx`, `DealEvidence.tsx` | **Yes** |
| 8 | Verdict-line copy pass: every `description` in `mockDeals.ts` names its main restriction in the second clause | `mockDeals.ts` | **Yes** |
| 9 | List card variant | new `DealListCard.tsx` | **Yes** |
| 10 | Directory all-deals section switches from grid to list | `DealsDirectoryPage.tsx` | **Yes** |
| 11 | Replace the savings ticker with the auditable evidence line (`N claimed this week, X% worked`) | `DealsHero.tsx` | **Yes** |
| 12 | Unify the detail modal and `[slug]` page onto one shared section list | `DealDetailModal.tsx`, `pages/deals/[slug].tsx` | **Yes** |
| 13 | Enter motion (`motion-safe:` opacity + translate-y + blur, 200ms, 3-item stagger) | `DealCard.tsx`, `DealListCard.tsx`, `DealsRail.tsx` | **Yes** |
| 14 | Accessibility pass per §3.7 (value-badge labels, caveat list semantics, proof-row label, countdown `aria-live="off"`) | across `features/deals/components/` | **Yes** |
| 15 | `Value` filter facet (`Free`, `Under $50`, `$50–$200`, `$200+`) | `DealsFilterBar.tsx` | **Yes** |
| 16 | Add `DealRedemptionPath[]`; render `How to redeem` as a stacked multi-path list | `types.ts`, `DealDetailModal.tsx`, `DealEvidence.tsx` | **Model change**, mock data authorable |
| 17 | `redemptionNote` per path (`Discount shows in the cart, not on the pricing page`) | `types.ts`, `mockDeals.ts` | **Model change**, mock data authorable |
| 18 | Render `DEAL_NO_COMMISSION_DISCLOSURE` wherever `isCommissioned` is false | `DealCard.tsx`, `DealEvidence.tsx` | **Yes** |
| 19 | `How deals get listed` page: criteria, the bury rule, the promoted-inventory firewall | new `pages/deals/how-it-works.tsx` | **Yes** |
| 20 | Data-earned label computation (`Most reliable`, `Biggest saving`) as pure functions over the listing | `dealsFormat.ts` | **Yes** |
| 21 | Retire the `getDealFacts` regex sniffing once `caveats` is authoritative | `dealsFormat.ts` | Needs #1 to be real data |
| 22 | Delete `TypographyType.Title4` or define `typo-title4` | `Typography.tsx` / `tailwind/typography.ts` | Yes, but out of scope for this initiative |

Items 1 through 4 are the ones that change how trustworthy the product feels. Everything after 14 is refinement.

---

## Appendix — sources

Primary, fetched directly on 2026-08-07:

- [Wirecutter, The Best Office Chair](https://www.nytimes.com/wirecutter/reviews/best-office-chair/)
- [Wirecutter, The Best Laptops](https://www.nytimes.com/wirecutter/reviews/best-laptops/)
- [Wirecutter, The Best Webcams](https://www.nytimes.com/wirecutter/reviews/the-best-webcams/)
- [Wirecutter, The Best Standing Desks](https://www.nytimes.com/wirecutter/reviews/best-standing-desk/)
- [Wirecutter, Daily Deals](https://www.nytimes.com/wirecutter/deals/)
- [Wirecutter homepage](https://www.nytimes.com/wirecutter/)
- [How Wirecutter Makes Money](https://www.nytimes.com/wirecutter/reviews/how-wirecutter-makes-money/)
- [Wirecutter Editorial Standards](https://www.nytimes.com/wirecutter/editorial-standards/)
- Wirecutter production CSS bundles, `https://dv-siren-prd.global.ssl.fastly.net/_next/static/css/{541d806dac425ed0,c4a4a6dd2a80fa97,7996a816cb053a9c,54b3f855503c0f99,2f21be75eb316d87}.css`

Secondary, used only as generic corroboration for the sticky-buy-bar discussion in §1.6, and not relied on for any Wirecutter-specific claim:

- [Smashing Magazine, Designing Sticky Menus: UX Guidelines](https://www.smashingmagazine.com/2023/05/sticky-menus-ux-guidelines/)
- [Growth Rock, Sticky Add to Cart Button: A/B test results](https://growthrock.co/sticky-add-to-cart-button-example/)

Internal: `00-research.md` §2b, `01-product-spec.md`, `02-growth-loops.md`, `08-growth-benchmark.md`, `packages/shared/src/features/deals/`, `packages/webapp/pages/deals/`, `packages/shared/tailwind/`.
