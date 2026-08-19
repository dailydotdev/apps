# House SEO / AEO conventions, and what /deals must do

Extracted from work merged (or in review) in the week of 2026-08-01 → 2026-08-07, plus the
existing SEO infrastructure in `packages/webapp`. Everything below is quoted from the repo.

**Purpose:** the "Deals for devs" directory is a new indexable surface. daily.dev already has a
directory surface built to the current standard (`/tools`), an answer-engine content pattern
(`answeredQuestions`), a crawler-rendering fix (`MainLayout` paint hold), and a soft-404 rule
(`ProfileLayout`). This document is the conventions those establish, and the delta for `/deals`.

**Ground truth we are designing against** (established, treat as settled):

- GPTBot, ClaudeBot and PerplexityBot do **not execute JavaScript**. Only Gemini and AppleBot
  render. Server-rendered HTML is a *prerequisite* for AI citation — this is exactly the bug
  #6453/#6454 fixed, and exactly what our current `/deals` page still has.
- Schema markup produces **no measurable AI-citation uplift** (Ahrefs DiD, 1,885 pages vs 4,000
  controls: AI Overviews −4.6%, others ~0). Google states no special markup or AI text files are
  required for AI features. **JSON-LD here is justified by rich results in classic search, not by
  AEO.** Do not write a ticket that claims otherwise.
- What *does* raise generative-engine visibility (KDD 2024 GEO paper, 10k queries): **citations to
  sources, direct quotations, and statistics.** Evidence density, not formatting.
- Cited pages skew recently **updated** (75% within a year). Refreshing beats publishing.
- Google's site-reputation-abuse policy **exempts** UGC/forum platforms and merchant-sourced
  coupons. The penalized pattern is a third-party-operated coupon subdirectory. Our deals must be
  operated by daily.dev and carry community signal, not be a white-labelled affiliate feed.

---

## 1. Per-PR breakdown

### #6451 — `feat(post): surface the questions a post answers to answer engines` (MERGED)

**Problem.** The enrichment pipeline started producing `answeredQuestions` per post. Nothing
consumed it. Answer engines had no machine-readable statement of what question a post answers.

**Approach.** Two surfaces, both non-visual: `FAQPage` JSON-LD on the post page, and a
`## Questions this post answers` section in the markdown twin at `/api/md/posts/[id]`.

**Files.**

- `packages/shared/src/graphql/posts.ts` — `answeredQuestions?: AnsweredQuestion[] | null` on
  `Post` (line 284), and the selection added to `POST_BY_ID_STATIC_FIELDS_QUERY` (line 421):
  ```graphql
  answeredQuestions {
    question
    answer
    cta
  }
  ```
- `packages/webapp/components/PostSEOSchema.tsx` — `getFaqJsonLd` (lines 369-389).
- `packages/webapp/lib/postMarkdown.ts` — `buildAnsweredQuestions` (lines 320-343).

**Code pattern** (`PostSEOSchema.tsx:369-389`):

```ts
export const getFaqJsonLd = (post: Post): string | null => {
  const questions = post?.answeredQuestions;

  if (!questions?.length) {
    return null;
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${post.commentsPermalink}#faq`,
    mainEntity: questions.map(({ question, answer, cta }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: cta ? `${answer} ${cta}` : answer,
      },
    })),
  });
};
```

And the markdown twin (`postMarkdown.ts:320-343`): `## Questions this post answers`, then
`### <question>`, blank line, answer, then the cta as an italic line `_${cta.trim()}_`.

**Rules it sets.**

1. **The cta rides inside the answer, not as a sibling field.** `acceptedAnswer.text` is
   `` `${answer} ${cta}` ``. Rationale from the PR: "An answer engine lifts the answer and quotes
   it; if the cta is a sibling field it gets dropped exactly when attribution matters." A missing
   cta must not produce a trailing space.
2. **No cloaking, no hidden text.** Every client gets identical bytes; nothing switches on
   user-agent; there is no `display:none` block. Structured data is the sanctioned channel.
3. **Every answer-engine surface no-ops on empty data.** Return `null` / `[]`, never an empty
   section.
4. **The markdown twin is gated by the same noindex gate as the HTML page** (`shouldNoindexPost`).
   One gate, two surfaces.
5. Google's `FAQPage` guidelines expect the Q&A to also be *visible*. The PR knowingly shipped
   invisible first (FAQ rich results have been restricted to health/gov since 2023, so we were not
   eligible either way) — and #6452 then made it visible. Treat "structured data first, visible
   second" as an acceptable two-step, not an end state.

### #6452 — `feat(post): show the answered questions FAQ to anonymous readers` (MERGED)

**Problem.** #6451 left the Q&A invisible. Anonymous visitors arriving from a search or an answer
engine hold one of those questions in hand and get no answer on the page.

**Approach.** A new `PostAnsweredQuestions` section, rendered **only for logged-out users**,
between the post body and the engagement bar on classic layout and above the discussion panel on
the `post_redesign` focus card.

**Files.**

- `packages/shared/src/components/post/PostAnsweredQuestions.tsx` (new, 63 lines)
- `packages/shared/src/components/post/PostAnsweredQuestions.spec.tsx` (new)
- `packages/shared/src/components/post/BasePostContent.tsx`, `.../post/focus/PostFocusCard.tsx`
- `packages/shared/src/graphql/posts.ts` — `answeredQuestions` added to `POST_BY_ID_QUERY` too
  (line 515)
- `packages/webapp/components/PostSEOSchema.tsx` — doc comment updated

**Code pattern** (`PostAnsweredQuestions.tsx:26-61`, abridged):

```tsx
export const PostAnsweredQuestions = ({ post, className }) => {
  const { isLoggedIn } = useAuthContext();
  const questions = post?.answeredQuestions;

  if (isLoggedIn || !questions?.length) {
    return null;
  }

  return (
    <section className={classNames('flex w-full flex-col gap-3', className)}>
      <Typography type={TypographyType.Body} bold>
        Questions this post answers
      </Typography>
      {questions.map(({ question, answer, cta }) => (
        <details key={question} className={classNames('select-none overflow-hidden px-4 py-0', widgetClasses)}>
          <Summary className="-mx-4 px-4 py-3 hover:bg-surface-hover">…{question}<SummaryArrow /></Summary>
          <p className="select-text pb-3 text-text-secondary typo-callout">
            {cta ? `${answer} ${cta}` : answer}
          </p>
        </details>
      ))}
    </section>
  );
};
```

**Rules it sets.**

1. **Collapsible content that must be crawlable uses native `<details>`, never the Radix
   accordion.** Verbatim from the file comment: "Built on `<details>` rather than the Radix
   accordion because Radix unmounts collapsed panels, which would keep every answer out of the HTML
   a crawler reads." `PostToc` is the existing precedent.
2. **The visible copy and the structured data are built by the same expression** (`cta ? \`${answer} ${cta}\` : answer`)
   so they cannot drift. The spec asserts this: `expect(screen.getByText(\`${answer} ${cta}\`))`.
3. **If a static-generated field is also fetched by a client refetch query, add it to *both*
   queries.** From the PR body: "`POST_BY_ID_QUERY` gains the field too. Without it the client
   refetch replaced the statically generated post with one that had no questions, and the section
   vanished a moment after hydration." This is a direct trap for `/deals` if we ISR the deal and
   then refetch it client-side.
4. Answer-engine content blocks target **anonymous** readers. Logged-in readers get the product.

### #6453 — `fix(seo): render prerendered content instead of an empty document` (MERGED, `263339d04`)

**Problem — the most important finding in this whole document.** Every page rendering the sidebar
chrome prerendered an **empty `<div id="__next">`**. `MainLayout` returned `null` until
`isPageReady` (growthbook + router + auth), none of which can be true during a server render.
Against production, characters of rendered text in `<body>`:

```
/posts/[id]     1
/tags/[tag]     1
/sources/[id]   1
/[userId]       1
```

This silently swallowed `PostSEOSchema` entirely — the `TechArticle`, `BreadcrumbList` and
`FAQPage` JSON-LD from #6451/#6452 **never reached an answer engine**. The only JSON-LD in the
document was the global Organization/WebSite block from `_app`.

**Approach.** Hold the *paint*, not the *tree*. Replace the top-level bail with a `visibility`
class on the wrapper.

**Code pattern** (`packages/shared/src/components/MainLayout.tsx`):

```ts
  // Everything that isn't feed-shaped (post, tag, source, profile) prerenders
  // real data through `getStaticProps`, but `isPageReady` can never be true on
  // the server. Unmounting the layout until boot therefore shipped an empty
  // `<div id="__next">`, so every crawler that doesn't run JS (including the
  // answer engines `PostSEOSchema` targets) saw nothing but meta tags.
  const isHoldingPaint = !isPageReady && showSidebar;
```

and the bail narrowed to feed-shaped pages only:

```ts
  // Feed-shaped pages have nothing prerendered worth showing (the feed is
  // fetched on the client) and anonymous visitors may still bounce to
  // onboarding, so they keep bailing out entirely.
  if (shouldRedirectOnboarding || (!isPageReady && isFeedShapedPage)) {
    return null;
  }
```

Result, per the PR's own table:

| route | before | after |
|---|---|---|
| `/posts/[id]` | 1 char | 1427 chars, plus TechArticle + BreadcrumbList + WebPage JSON-LD |
| `/tags/[tag]` | 1 | 1875 |
| `/sources/[id]` | 1 | 1178 |
| `/[userId]` | 1 | 509 |
| `/popular`, `/` | 1 | unchanged, still bails |

**Rules it sets.**

1. **A crawler-facing page must render real markup on the server. Gate the paint with
   `visibility`, never by returning `null`.** `visibility` (not `display`) also keeps descendants
   that measure themselves on mount getting real geometry.
2. **Feed-shaped surfaces are explicitly excluded from indexability.** If the content arrives via a
   client-side feed query, there is nothing to prerender and the page should not pretend otherwise.
   **A deals directory built as a client feed inherits this exclusion — so it must not be a feed.**
3. **The held render must stay viewport-independent.** `useMedia` seeds from `window.matchMedia`,
   so the server assumes mobile while the first client render knows the real breakpoint. Gating
   markup on `isLaptop` alone shifts `<main>` and breaks hydration.
4. Regression coverage lives in `packages/webapp/__tests__/MainLayoutPaintHold.tsx` and must fail
   on `main` without the change.
5. Known follow-up, deliberately not fixed: `useMedia` reading `window.matchMedia` in its
   `useState` initialiser means React discards the prerendered DOM and re-renders. Hidden behind
   the paint hold, costs no UX, but **the prerendered markup is not actually reused**. Fixing it
   means `useSyncExternalStore` with a server snapshot across 158 files.

### #6454 — `fix: paint prerendered content before boot` (MERGED, `0d273ea2e`)

**Problem.** #6453's `invisible` class still blanked the page for humans until boot, hurting LCP on
the post page.

**Approach.** Rename `isHoldingPaint` → `isHoldingChrome`, drop the `invisible` class from the
wrapper entirely, and render the v1 header unconditionally:

```tsx
      {/* Temporary while layout v2 is experimental: production users are on
          v1, so render its header in the initial HTML instead of waiting for
          feature resolution and delaying the post page's LCP. */}
      {!sidebarOwnsHeader && (
        <MainLayoutHeader … />
      )}
```

**Rule it sets.** Hold only the *variant-specific chrome*; prerendered **page content paints
immediately**. Crawler visibility and LCP are the same fix, not a trade-off.

### #6455 — `feat: layout v2 ssr` (OPEN)

**Problem.** #6454's unconditional v1 header is a stopgap. Layout v2 is a GrowthBook experiment, so
the correct shell can only be known after client boot — which either delays LCP or flashes the
wrong shell.

**Approach.** Resolve the flag **in edge middleware**, before the bundle loads, and rewrite to a
parallel route that hard-codes the variant.

**New files/utilities.**

- `packages/shared/src/lib/feature.ts` — the `Feature<T>` class, extracted out of
  `featureManagement.ts` so server entry points don't pull client deps.
- `packages/shared/src/lib/serverFeatures.ts`:
  ```ts
  // Features evaluated before the application bundle loads belong here so
  // server entry points do not pull in featureManagement's client dependencies.
  export const featureLayoutV2 = new Feature('layout_v2', false);
  ```
- `packages/shared/src/lib/serverFeatureValue.ts` — `getServerFeatureValue({ attributes, clientKey, feature })`,
  instantiates a `GrowthBook` with `apiHost`/`clientKey`, `loadFeatures({ timeout: 2000 })`,
  returns `defaultValue` on any failure, `growthbook.destroy()` in `finally`.
- `packages/webapp/lib/layoutVariantMiddleware.ts` — `isDesktopRequest(req)` (reads
  `sec-ch-ua-mobile` then a UA regex) and `resolveLayoutV2(req)`, which **fails closed** without a
  `da2` tracking cookie and passes the *same allocation attributes as the client*
  (`deviceId`, `userId`, `loggedIn`, `mobile`, `platform`, `url`, `version`).
- `packages/webapp/pages/layout-v2/posts/[id].tsx` — re-exports `getStaticPaths`/`getStaticProps`
  from the real page and only overrides `layoutProps.layoutVariant = 'v2'`.
- `packages/webapp/next.config.ts` — `/layout-v2/:path*` → `/:path*` redirect, "layout v2 pages are
  selected through middleware only", so the shadow route is never directly reachable.
- `packages/webapp/middleware.ts` — markdown negotiation stays **ahead of** layout resolution.

**Rules it sets.**

1. **Flags that affect server-rendered markup are resolved in middleware, not in React.** Add them
   to `serverFeatures.ts`, never to `featureManagement.ts`.
2. **Shadow routes for variants re-export the real page's data functions.** One `getStaticProps`,
   two shells.
3. **Shadow routes get a redirect so they are not independently indexable** (would otherwise be a
   duplicate-content URL).
4. **Content negotiation runs before experiment resolution** — the markdown twin must never be
   diverted into an experiment shell.
5. Middleware fails closed to the control variant.

### #6437 — `feat: tool landing pages and /tools directory` (OPEN)

The closest structural precedent to `/deals`. Fully blueprinted in section 3 below. The rules it
sets:

1. **Flat URLs for entities, categories live in anchors + breadcrumbs.** Verbatim from the PR:
   "tool pages stay flat at `/tools/[slug]` — nested category URLs would collide with the dynamic
   route and split SEO; category lives in breadcrumb + index anchors."
2. **A quality threshold gates indexation, and that threshold is shared with the sitemap.**
   ```ts
   // Mirrors the sitemap inclusion gate in daily-api.
   const MIN_INDEXABLE_STACKS = 3;
   …
   ...(tool.stackCount < MIN_INDEXABLE_STACKS ? noindexSeoProps : {}),
   ```
   One number, two enforcement points (page meta + `/sitemaps/tools.xml`). This is the anti-
   thin-content lever.
3. **Directory JSON-LD is a `@graph` of `CollectionPage` + `ItemList` (+ `BreadcrumbList` on entity
   pages)**, emitted through `next/head` with `dangerouslySetInnerHTML`.
4. **Every secondary data source degrades gracefully.** `.catch(() => [])` / `.catch(() => null)`
   on each parallel fetch, with the comment "Tolerate the API not exposing … queries yet during
   deploy windows." Sections hide independently on empty data.
5. **Visible breadcrumbs mirror the `BreadcrumbList`** exactly, as real `<Link>`s.
6. `revalidate: 300` for both directory and entity page; `notFound: true, revalidate: 60` on
   `ApiError.NotFound`; `notFound: true, revalidate: false` on a missing param; rethrow anything
   else.

### #6448 — `fix(profile): 404 unknown profiles instead of 200` (MERGED)

**Problem.** `pages/[userId]` is a root-level dynamic route, so it claimed every single-segment
path on the apex and answered `200` for all of them:

```
GET /kramer                        200  10,549 B   (a real profile)
GET /definitely-not-a-user-xyz123  200  10,549 B   (nobody)
```

Byte-identical. "Crawlers and agents read the status code, so every missing page on daily.dev
currently looks like a hit." It also explains why `/plus.md`, `/jobs.md`, `/llms-full.txt` returned
HTML under 200 — they were never special, just unknown usernames.

**Two causes, both in `ProfileLayout`.**

1. `fallback: true` — Next serves a loading shell with HTTP `200` *before* `getStaticProps` runs,
   so nothing the resolver decides can reach the response that matters. Changed to `'blocking'`.
2. A missing profile returned props, not `notFound`:
   ```ts
   const user = await getProfile(userId);
   if (!user) {
     return { props: { noindex: true }, revalidate: 60 };
   }
   ```
   The layout already rendered `<Custom404 />` for this case — "the UI was already a 404 and only
   the status disagreed. `noindex` hid the symptom from search engines; agents don't read it."

`FORBIDDEN` deliberately gets the same 404 so we don't confirm the handle exists. `revalidate` is
kept on the `notFound` results so a handle registered later starts resolving inside the window.

**Tradeoff, flagged explicitly in the PR:** the first uncached request now waits on the API instead
of painting a skeleton. Once per entity per revalidate window. Accepted as the cost of a correct
status code.

**Rules it sets.**

1. **Never `fallback: true` on an indexable dynamic route. Always `'blocking'`.**
2. **A missing entity returns `notFound: true`, not props + `noindex`.** `noindex` is invisible to
   agents; the status code is not.
3. **Keep `revalidate` on `notFound` results** so late-created entities recover.
4. **Forbidden ⇒ 404, not 403**, so existence is not confirmed.
5. Root-level dynamic routes are dangerous; prefer a prefixed namespace (`/deals/[slug]` is
   already fine here).

---

## 2. The daily.dev house pattern — checklist for any new indexable surface

### Rendering

- [ ] **Data comes from `getStaticProps` (ISR).** No indexable surface is client-fetched. Feed-
      shaped pages are, by house definition, not indexable (`MainLayout` still returns `null` for
      them).
- [ ] **`getStaticPaths` is `{ paths: [], fallback: 'blocking' }`.** Universal across
      `posts/[id]`, `tags/[tag]`, `sources/[source]`, `tools/[slug]`. Never `fallback: true`.
- [ ] **`revalidate`:** `60` for fast-moving entities (posts), `300` for directory/entity pages
      (tools), `3600` for slow archives (tags, sources). Directory *index* pages elsewhere use
      `60`. Pick from this set, don't invent.
- [ ] `getServerSideProps` is only used to opt a route out of automatic static optimization when a
      query param must be present on first render — it is not the indexable-page pattern.
- [ ] Secondary data sources are fetched in `Promise.all` with per-source `.catch(() => [])`, and
      each section hides independently on empty data.
- [ ] Do not gate server-rendered markup on `useMedia`/`isLaptop` — that breaks hydration.

### SEO component usage

- [ ] Return `seo: NextSeoProps` from `getStaticProps` → `pageProps.seo`. Static pages attach it to
      `Component.layoutProps.seo`. `_app.tsx:289` reads `pageProps?.seo || layoutProps?.seo`.
- [ ] Titles via `getPageSeoTitles(title)` from `packages/webapp/components/layouts/utils.ts` —
      produces `title` (with `| daily.dev`) and `openGraph.title`.
- [ ] `openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph }` (tools/index and tools/[slug]
      order) or `{ ...defaultOpenGraph, ...seoTitles.openGraph }` (tags/sources order). Prefer the
      latter — default first, page-specific second.
- [ ] Robots directives flow **only** through next-seo's `noindex`/`nofollow`/`robotsProps`. From
      `packages/webapp/next-seo.ts:38-45`: "Do NOT reintroduce robots via `additionalMetaTags` —
      those are keyed by meta name, escape next-seo's dedupe, and silently override every page's
      noindex."
- [ ] `noindexSeoProps` (`{ nofollow: true, noindex: true }`) is spread only for auth-gated or
      crawler-inaccessible surfaces, or for entities below the quality threshold.

### Canonical

- [ ] Default is `canonicalFromRouter(router)` in `_app.tsx` — `https://daily.dev` + `asPath` with
      **the query string stripped for every path except `/search`**
      (`packages/shared/src/lib/canonical.ts`).
- [ ] Set an explicit `canonical` only when the URL you want indexed differs from the request URL
      (post slug canonicalisation, profile sub-pages all canonicalising to `/{username}`).
- [ ] **Consequence for filtered directories:** query-param filter URLs already self-canonicalise
      to the unfiltered path. That is correct *only if* filters carry no unique indexable content.
      If a filter view deserves its own page, it needs its own path segment.

### JSON-LD

- [ ] Justified by **rich results in classic search**, not AEO. Ship it, don't over-claim it.
- [ ] Global `Organization` + `WebSite` (+ `SearchAction`) comes from `_app.tsx:105-144`. Don't
      duplicate it.
- [ ] Entity/directory pages emit **one `@graph` script** via `next/head`:
      `CollectionPage` + `BreadcrumbList` + `ItemList`. Post pages are the exception: four separate
      scripts (`TechArticle`|`DiscussionForumPosting`, `BreadcrumbList`, comments `WebPage`,
      `FAQPage`) rendered in the body by `PostSEOSchema`.
- [ ] `@id` convention: `${url}#page`, `${url}#breadcrumbs`, `${url}#posts`, `${permalink}#faq`.
- [ ] Origins come from `getAppOrigin()` / `getSiteOrigin()` in `packages/webapp/lib/seo.ts`.
      Never hardcode `https://daily.dev` in a new file.
- [ ] `eslint-disable-next-line react/no-danger` above the `dangerouslySetInnerHTML`.

### Answer-engine content blocks

- [ ] A visible Q&A block, rendered for **anonymous users only**, built from the *same expression*
      as the structured data so they cannot drift.
- [ ] Native `<details>`/`<summary>`, never Radix — Radix unmounts collapsed panels.
- [ ] The cta lives **inside** the answer string, so it survives extraction.
- [ ] No-op on empty data.
- [ ] If the surface has a markdown twin, mirror the same section there.

### Markdown twins / llms.txt

- [ ] Routes live in `packages/webapp/pages/api/md/*`, registered in
      `packages/webapp/lib/markdownRoutes.ts` (`MARKDOWN_ROUTES` map → `.md` rewrites in
      `next.config.ts` `beforeFiles`), plus header negotiation in `middleware.ts` via
      `acceptsMarkdown`.
- [ ] Response headers, verbatim from `pages/api/md/posts/[id].ts:82-94`:
      ```ts
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Vary', 'Accept');
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.setHeader('Link', '</llms.txt>; rel="llms-txt"');
      res.setHeader('X-Llms-Txt', '/llms.txt');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      ```
- [ ] Every markdown doc opens with the documentation-index blockquote:
      ```
      > ## Documentation Index
      > Fetch the complete documentation index at: ${getLlmsTxtUrl()}
      > Use this file to discover all available pages before exploring further.
      ```
- [ ] Gate the twin on the same noindex predicate as the HTML page; 404 (with `text/markdown`)
      otherwise.

### 404 / status codes

- [ ] Missing entity ⇒ `{ notFound: true, revalidate: <window> }`. Never props + `noindex`.
- [ ] Forbidden ⇒ 404, not a distinguishable response.
- [ ] Unexpected errors are **rethrown**, not swallowed into a 404.
- [ ] Never render a "not found" component under a 200.
- [ ] Expired/retired entities are the open question the house has not answered yet — see the
      `/deals` prescription (410 vs 404 vs keep-and-mark).

### Sitemaps / robots

- [ ] The webapp does **not** serve sitemaps. `next.config.ts` `afterFiles` proxies them:
      ```ts
      { source: '/api/sitemaps/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/sitemaps/:path*` },
      ```
      Sitemaps are generated in **daily-api** (`/sitemaps/tools.xml` is the tools precedent).
      A new sitemap is a backend ticket, not a webapp one. There is no `next-sitemap`.
- [ ] There is no `robots.txt` and no `llms.txt` in this repo. `_app.tsx:346-357` advertises
      `/sitemap.xml` and `/llms.txt`, and `next.config.ts:346-348` sets global
      `Link: </llms.txt>; rel="llms-txt"` and `X-Llms-Txt: /llms.txt` headers — those files are
      served by the marketing-site origin (see `marketing-site-recruiter-landing-repo` memory).
      **Adding `/deals` to `llms.txt` is a change in the recruiter-landing repo.**

### Internal linking

- [ ] Directory index links to every entity it lists, with visible anchor text.
- [ ] Entity pages link back to the directory and to their category anchor (breadcrumb).
- [ ] Entity pages cross-link to sibling entities ("Devs also stack", related tags, similar deals).
- [ ] Where the design has no room, use `sr-only` crawl blocks — the existing precedent is
      `packages/shared/src/components/tags/TagTopicPage.tsx:425-451`, commented "SEO crawl paths
      preserved from the legacy tag page", and `pages/sources/[source].tsx:313-337`.

---

## 3. The `/tools` blueprint — file by file, so `/deals` can mirror it

**Two routes.** `pages/tools/index.tsx` (directory, 261 lines) and `pages/tools/[slug].tsx`
(landing page, 815 lines). Plus `components/tools/ToolDiscussion.tsx` (320 lines) and
`packages/shared/src/graphql/tools.ts` (347 lines).

**Step 1 — data layer.** All queries in one shared file, `packages/shared/src/graphql/tools.ts`,
each a plain async function returning a typed result. Directory: `getToolCategories()`,
`getTopTools({ first, trending?, category? })`. Entity: `getDatasetTool(slug)`,
`getToolsAlsoStacked(id)`, `getToolStackers(id, n)`, `getToolTopPosts(keyword, n)`,
`getToolAdoption(id)`, `getToolTakes(id)`, `getToolVoteState(id)`, `voteTool(id, vote)`, plus
`getTopSquadsForTool` from `user/userStack`. One pure helper is exported alongside them:

```ts
export const getToolCategoryAnchor = (category: string): string => …
```

It is used in three places — the JSON-LD breadcrumb item, the visible breadcrumb link, and the
directory `<section id>` — so the anchor can never drift.

**Step 2 — directory `getStaticProps`** (`pages/tools/index.tsx`):

```ts
export async function getStaticProps(): Promise<
  GetStaticPropsResult<ToolsDirectoryProps & { seo: NextSeoProps }>
> {
  // Tolerate the API not exposing directory queries yet during deploy windows.
  const [categories, trending, fallbackTop] = await Promise.all([
    getToolCategories().catch(() => []),
    getTopTools({ first: TRENDING_COUNT, trending: true }).catch(() => []),
    getTopTools({ first: 12 }).catch(() => []),
  ]);

  const sections = (
    await Promise.all(
      categories.map(async ({ category }) => ({
        category,
        tools: await getTopTools({ first: TOOLS_PER_SECTION, category }).catch(() => []),
      })),
    )
  ).filter(({ tools }) => tools.length > 0);

  const seoTitles = getPageSeoTitles('Developer tools directory — ranked by real stacks');

  return {
    props: {
      trending, sections, fallbackTop,
      seo: {
        title: seoTitles.title,
        openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
        description: 'Explore the tools developers actually use: …',
      },
    },
    revalidate: 300,
  };
}
```

Note `fallbackTop`: a "most stacked" list rendered only when `sections.length === 0`, so the
directory is never empty while categories roll out.

**Step 3 — directory JSON-LD.** `getToolsDirectoryJsonLd(sections)` builds a `@graph`:

```ts
{
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${directoryUrl}#page`,
      url: directoryUrl,
      name: 'Developer tools directory',
      description: 'The tools developers actually run, ranked by real stacks on daily.dev.',
      isPartOf: { '@type': 'WebSite', url: appOrigin },
    },
    ...(tools.length ? [{
      '@type': 'ItemList',
      '@id': `${directoryUrl}#tools`,
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${appOrigin}/tools/${tool.slug}`,
        name: tool.title,
      })),
    }] : []),
  ],
}
```

emitted as:

```tsx
<Head>
  <script
    type="application/ld+json"
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: getToolsDirectoryJsonLd(sections) }}
  />
</Head>
```

**Step 4 — directory markup.** `<main className="mx-auto flex w-full max-w-screen-laptop …">`,
`<h1>Tools</h1>` (`TypographyTag.H1`, `LargeTitle`), a one-line positioning subtitle, then **jump
chips** (`<a href={`#${getToolCategoryAnchor(category)}`}>`) shown when `sections.length > 1`.
Then a "Rising this quarter" section, then one `<section id={anchor} className="scroll-mt-16">`
per category with an `<h2>`, then the `fallbackTop` "Most stacked" section. Every card is a real
`<Link href={`/tools/${tool.slug}`}>` — the whole index is a crawl surface.

**Step 5 — entity `getStaticPaths` / `getStaticProps`** (`pages/tools/[slug].tsx`):

```ts
export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }: GetStaticPropsContext<ToolPageParams>) {
  const slug = params?.slug;
  if (!slug) {
    return { notFound: true, revalidate: false };
  }
  try {
    const tool = await getDatasetTool(slug);
    const [alsoStacked, topSquads, topPosts, stackers, adoption, takes] = await Promise.all([
      getToolsAlsoStacked(tool.id),
      getTopSquadsForTool({ toolId: tool.id, first: 3 }),
      tool.keyword ? getToolTopPosts(tool.keyword, TOP_POSTS_COUNT) : Promise.resolve([]),
      // Tolerate the API not exposing the social queries yet during deploy windows.
      getToolStackers(tool.id, STACKERS_COUNT).catch(() => []),
      getToolAdoption(tool.id).catch(() => null),
      getToolTakes(tool.id).catch(() => []),
    ]);

    const seoTitles = getPageSeoTitles(`${tool.title} — adoption, squads and posts for developers`);

    return {
      props: { tool, alsoStacked, topSquads, topPosts, stackers, adoption, takes,
        seo: {
          title: seoTitles.title,
          openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
          description: `Discover how developers use ${tool.title}: adoption on daily.dev, squads discussing it, related tools, and the latest posts.`,
          ...(tool.stackCount < MIN_INDEXABLE_STACKS ? noindexSeoProps : {}),
        },
      },
      revalidate: 300,
    };
  } catch (err) {
    const error = err as GraphQLError;
    if (error?.response?.errors?.[0]?.extensions?.code === ApiError.NotFound) {
      return { notFound: true, revalidate: 60 };
    }
    throw err;
  }
}
```

**Step 6 — entity JSON-LD.** `getToolPageJsonLd(tool, topPosts)` — `CollectionPage` +
`BreadcrumbList` (`Tools / {category} / {title}`, category item pointing at
`${appOrigin}/tools#${anchor}`) + `ItemList` of top posts.

**Step 7 — visible breadcrumb**, mirroring the `BreadcrumbList` exactly:

```tsx
<Typography type={TypographyType.Footnote} color={TypographyColor.Quaternary}>
  <Link href="/tools" passHref><a className="hover:text-text-primary">Tools</a></Link>
  {tool.category && (<>{' / '}<Link href={`/tools#${getToolCategoryAnchor(tool.category)}`} passHref>
    <a className="hover:text-text-primary">{tool.category}</a></Link></>)}
  {' / '}<span className="text-text-secondary">{tool.title}</span>
</Typography>
```

**Step 8 — page body, in order.** Hero (`<h1>`, favicon, chip-style website/tag links,
auth-gated CTA) → proof strip (avatar cluster of top-reputation stackers, stack count, viewer-
specific "N you follow" fetched **client-side**, upvote/downvote with live counts, sentiment bar,
Share, Discuss anchor) → cards: trending posts, **Adoption on daily.dev** (top percentile,
quarterly growth, monthly-additions sparkline), top squads, "Devs also stack", **Community takes**
→ `ToolDiscussion` (composer, one reply level, delete own comment).

The split matters: **statistics and community text are in the static props** (crawlable);
**viewer-specific personalisation is a client `useQuery`** (not crawlable, correctly so).

**Step 9 — layout wiring.**

```ts
const getToolPageLayout: typeof getLayout = (...props) => getFooterNavBarLayout(getLayout(...props));
ToolPage.getLayout = getToolPageLayout;
ToolPage.layoutProps = { screenCentered: false };
```

**Step 10 — sitemap.** `MIN_INDEXABLE_STACKS = 3` is commented "Mirrors the sitemap inclusion gate
in daily-api", and the sitemap itself ships in `dailydotdev/daily-api#4055`, proxied through
`/api/sitemaps/tools.xml`. **The webapp side is only the `noindex` half.**

---

## 4. Gap list for `/deals` — ordered by impact

Current implementation: `packages/webapp/pages/deals/index.tsx` (146 lines),
`packages/webapp/pages/deals/[slug].tsx` (123 lines), and
`packages/shared/src/features/deals/**` (mock data + components).

### P0 — the page is invisible to every AI crawler and to Google

1. **`noindex, nofollow` on both pages.**
   `pages/deals/index.tsx:30-36`:
   ```ts
   const seo: NextSeoProps = {
     title: 'Deals for devs',
     description: 'Deals, credits and promo codes for developer tools, verified by the daily.dev community.',
     nofollow: true,
     noindex: true,
   };
   ```
   Identical block at `pages/deals/[slug].tsx:35-41`. Correct while the data is mock; **the whole
   SEO/AEO thesis is dead until this is removed**, and `nofollow` additionally kills internal link
   equity to every deal page. This must be the last flag flipped, not the first.

2. **No `getStaticProps` on the directory at all.** `pages/deals/index.tsx` has no data function.
   All content comes from `mockDeals` imported into a client component
   (`DealsDirectoryPage.tsx:13`, `:116` `mockDeals.filter(...)`). Because `MainLayout` now paints
   prerendered content (#6453/#6454), the *imported constant* would actually serialise into the
   HTML today — but the moment this is wired to the API it becomes a client fetch and the page
   goes back to shipping an empty body to GPTBot/ClaudeBot/PerplexityBot. There is no ISR, no
   `revalidate`, no server data path.

3. **The detail page uses `getServerSideProps` as an escape hatch, with zero data.**
   `pages/deals/[slug].tsx:114-118`:
   ```ts
   // Opting the route out of automatic static optimization is what makes `slug`
   // and `ref` available on the first render, so the landing is server rendered.
   export const getServerSideProps = async (): Promise<{
     props: Record<string, never>;
   }> => ({ props: {} });
   ```
   The deal is then resolved **in the component** (`:82` `getDealBySlug(slug)`), behind
   `if (!router.isReady) return <></>;` (`:77-79`). A crawler that does not run JS gets an empty
   render. Violates the #6453 rule directly.

4. **Soft 404 on unknown slugs.** `pages/deals/[slug].tsx:84-86` renders `<DealNotFound />`
   under HTTP 200. This is exactly the bug #6448 fixed for profiles: "the UI was already a 404 and
   only the status disagreed." Every mistyped or retired deal URL currently looks like a hit.

### P1 — structure

5. **No JSON-LD anywhere in `/deals`.** No `CollectionPage`, no `ItemList`, no `BreadcrumbList`,
   and no `Offer`/`Product` — the one schema type where a deals directory has an obvious rich-
   result path in classic search.

6. **No breadcrumbs, visible or structured.** `/tools/[slug]` renders `Tools / {category} /
   {title}` and mirrors it in `BreadcrumbList`. `/deals/[slug]` has none.

7. **Filters are component state with no URL.** `DealsDirectoryPage.tsx:105-106`:
   ```ts
   const [query, setQuery] = useState(initialQuery);
   const [filter, setFilter] = useState(initialFilter);
   ```
   `matchesDealFilter` (`DealsFilterBar.tsx:25-39`) supports `All`, `Expiring`, `Exclusive` and
   every category in `getDealCategories`. **None of it is addressable.** There is no
   `/deals/category/[category]` and no `?category=` — so there is no page to rank for "AI tool
   deals for developers", no crawl path into a category, and nothing to put in a sitemap beyond
   the two routes we have.

8. **Tabs are state too.** `pages/deals/index.tsx:46` `useState<DealsTab>('directory')` — "My
   coupons" is a private wallet sharing the indexable `/deals` URL. Mixing an auth-gated wallet
   into the canonical directory URL is both an SEO smell and a UX one.

9. **No sitemap entries.** No `/deals` route exists in any sitemap, and there is no daily-api
   ticket for one. Per the house pattern, `/sitemaps/deals.xml` must be generated in daily-api and
   is reached through the existing `/api/sitemaps/:path*` proxy. Nothing to do in this repo except
   agree the inclusion gate.

10. **No answer-engine question block.** Nothing analogous to `PostAnsweredQuestions`. Deals are an
    unusually good fit for this — "Does the Cursor student discount stack with the team plan?" is
    a real query with a real answer sitting in `deal.terms` and in the community comments.

11. **No canonical strategy.** Both pages inherit `canonicalFromRouter`, which strips the query
    string for everything except `/search`. That is *accidentally correct* for `?ref=` share
    attribution — `/deals/cursor-credit?ref=tsahi` canonicalises to `/deals/cursor-credit`, which
    is what we want — but it is unstated and untested, and it silently breaks the moment filters
    move to query params (every `?category=` view would collapse into `/deals`). Also: the
    `sanitizeSharerName(ref)` path (`[slug].tsx:88`) means every share link is a distinct crawlable
    URL with distinct visible copy under one canonical. That needs an explicit decision.

12. **No internal links into `/deals` from anywhere.** The only `/deals` link in the entire
    repo outside the feature is `pages/deals/[slug].tsx:58`. No sidebar entry, no footer, no
    related-content module. An orphan directory does not get crawled.

### P2 — content model

13. **Expired-deal handling is a render-time filter with no URL policy.**
    `dealsFormat.ts:46-47`:
    ```ts
    export const isLiveDeal = (deal: Deal): boolean =>
      deal.state !== DealState.Expired && deal.state !== DealState.SoldOut;
    ```
    Expired deals are filtered out of rails (`DealsDirectoryPage.tsx:129`) and out of
    `getSimilarDeals` (`dealsFormat.ts:49-59`), but `getDealBySlug` still resolves them, so
    `/deals/<expired-slug>` renders a live-looking page. There is no 404/410, no "this deal
    ended" state on the entity page, no redirect. This is the single highest-risk pattern for a
    coupon directory — stale offers are what gets coupon sites demoted.

14. **Verification recency is a hand-written string, not a timestamp.**
    `types.ts:43` `lastVerifiedAgo: string`, consumed by a regex in
    `DealsDirectoryPage.tsx:54-62`:
    ```ts
    const match = /^(\d+)([mhd])/.exec(deal.community.lastVerifiedAgo);
    ```
    Cannot produce a `dateModified`, cannot drive freshness signals, cannot be sorted reliably.
    Given that 75% of AI-cited pages were updated within a year, an actual `lastVerifiedAt`
    timestamp is load-bearing, not cosmetic.

15. **Community comments exist but are not on the page as evidence.**
    `mockCommunity.ts` holds genuinely citation-grade quotations — "Applied on the first try. The
    discount came off before tax.", "Heads up, it does not stack with the student rate. Had to pick
    one.", "Code failed on the limited edition colourway, fine on everything else." Per the GEO
    paper these direct quotations are among the highest-value interventions available, and they are
    currently confined to mock data and a modal.

16. **`DealCommunityProof` renders stats without attribution or units.**
    `DealCommunityProof.tsx:41-60` renders upvotes, `N claimed`, and `Worked {lastVerifiedAgo}` —
    good raw material, but `worksRate` (`types.ts:42`) is not rendered at all, and nothing is
    marked up or dated.

17. **Affiliate disclosure exists as a constant but has no required placement.**
    `dealsFormat.ts:4-5` `DEAL_AFFILIATE_DISCLOSURE`. For a coupon directory this needs to be
    visible on every commercial surface, not optional — it is part of what keeps us on the
    exempt side of the site-reputation-abuse line.

18. **`H1` on the directory is inside the wallet tab, not the directory tab.**
    `pages/deals/index.tsx:93-99` renders `<h1>My coupons</h1>`; the directory branch delegates to
    `DealsDirectoryPage`/`DealsHero`. Verify the directory tab has exactly one `H1` and that it is
    the deals headline.

19. **No markdown twin.** `/tools` doesn't have one either, so this is a stretch goal — but
    `/deals.md` + `/deals/[slug].md` would be cheap once the data is server-side, and the
    infrastructure (`markdownRoutes.ts`, `middleware.ts`, `acceptsMarkdown`) already exists.

---

## 5. Prescription for `/deals`

**Legend:** `[MS]` mock-safe — can ship now against `mockDeals`. `[BE]` needs a daily-api field,
query, or sitemap. Nothing here should be done while another agent holds the file; coordinate.

### Phase 0 — decide the URL model (no code)

- Entity URLs stay **flat**: `/deals/[slug]`. Same reasoning as tools: nested category URLs
  collide with the dynamic route and split SEO.
- Categories become **real paths**, not query params: `/deals/c/[category]`. A `c/` (or
  `category/`) segment is required so a category slug can never collide with a deal slug.
  This is the one place we deviate from `/tools`, and deliberately: tools have ~10 categories on
  one screen, deals are a browse surface where category intent ("AI tool deals", "cloud credits
  for developers") *is* the query.
- `?ref=` stays a non-canonical share parameter — already handled by `canonicalFromRouter`.
  Add a test asserting it.
- The wallet moves off `/deals` to `/deals/wallet`, `noindex`.

### Phase 1 — server-render what exists `[MS]`

*File: `packages/webapp/pages/deals/index.tsx`*

Add ISR and pass the data down as props instead of importing `mockDeals` into the client tree:

```ts
export async function getStaticProps(): Promise<
  GetStaticPropsResult<DealsDirectoryProps & { seo: NextSeoProps }>
> {
  const deals = mockDeals.filter(isLiveDeal); // swap for getLiveDeals() in phase 4
  const categories = getDealCategories(deals);
  const seoTitles = getPageSeoTitles('Developer deals and promo codes, verified by devs');

  return {
    props: {
      deals, categories,
      seo: {
        title: seoTitles.title,
        openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
        description: '…',
      },
    },
    revalidate: 300,
  };
}
```

Keep `noindex` for now — this phase is about the rendering path, not indexation.

*File: `packages/webapp/pages/deals/[slug].tsx`*

Delete the empty `getServerSideProps` and replace it with the tools shape:

```ts
export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }: GetStaticPropsContext<DealPageParams>) {
  const slug = params?.slug;
  if (!slug) {
    return { notFound: true, revalidate: false };
  }

  const deal = getDealBySlug(slug);          // getDeal(slug) in phase 4
  if (!deal) {
    return { notFound: true, revalidate: 60 };
  }
  …
  return { props: { deal, similarDeals, comments, seo }, revalidate: 300 };
}
```

Remove `if (!router.isReady) return <></>;` and the in-component `getDealBySlug`. `ref` still comes
from `router.query` — that is fine, it is personalisation, not content, and it must not be part of
the prerendered body (it would fragment the ISR cache).

*File: `packages/shared/src/features/deals/components/DealsDirectoryPage.tsx`*

Change `mockDeals` from an import to a required `deals: Deal[]` prop. Keep `initialQuery` /
`initialFilter` — they become the server-resolved values on a category page.

### Phase 2 — structure `[MS]`

*New: `packages/webapp/pages/deals/c/[category].tsx`*

One template, `fallback: 'blocking'`, `revalidate: 300`, `getStaticPaths` seeded from
`getDealCategories`. Renders the same `DealsDirectoryPage` with `initialFilter` pre-set and a
category-specific `<h1>`, `<title>`, description and intro paragraph. Empty category ⇒
`notFound: true, revalidate: 60`.

*New: `packages/webapp/pages/deals/dealsSeo.ts`* (colocated helpers, no barrel)

- `getDealCategoryAnchor(category)` / `getDealCategoryPath(category)` — one function, used by the
  JSON-LD breadcrumb, the visible breadcrumb, the directory chips, and `getStaticPaths`. Same
  discipline as `getToolCategoryAnchor`.
- `getDealsDirectoryJsonLd(deals, category?)` — `@graph` of `CollectionPage` + `ItemList` +
  `BreadcrumbList`, `@id`s `#page` / `#deals` / `#breadcrumbs`, origins from `getAppOrigin()`.
- `getDealPageJsonLd(deal)` — `@graph` of:
  - `Offer` (or `Product` with an `offers` node when the deal maps to a specific product):
    `name`, `description`, `url`, `seller` → `{ '@type': 'Organization', name: deal.brand.name }`,
    `priceSpecification` / `discount` from `deal.value`, `validThrough: deal.expiresAt`,
    `availability: deal.state === DealState.SoldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock'`.
    Only emit `Offer` when we have a real merchant-sourced offer — never fabricate price data.
  - `BreadcrumbList`: `Deals / {category} / {title}`.
  - `FAQPage` (`@id` `${dealUrl}#faq`) built from the answered-questions block below, using the
    exact `getFaqJsonLd` shape — cta inside `acceptedAnswer.text`.

Emit through `next/head` with `dangerouslySetInnerHTML` and the `react/no-danger` disable, exactly
as `/tools` does.

*Visible breadcrumb* on `/deals/[slug]`, mirroring the `BreadcrumbList`, using the tools markup
(`TypographyType.Footnote`, `TypographyColor.Quaternary`, ` / ` separators, last crumb a `<span>`).

*Wallet* moves to `pages/deals/wallet.tsx` with `...noindexSeoProps`. Remove the tab state from
`pages/deals/index.tsx:46`.

### Phase 3 — expiry and status codes `[MS]`

Add to `packages/shared/src/features/deals/dealsFormat.ts`:

```ts
const EXPIRED_DEAL_GRACE_DAYS = 30;

export const shouldNoindexDeal = (deal: Deal): boolean =>
  !isLiveDeal(deal) || deal.community.claims < MIN_INDEXABLE_CLAIMS;
```

Policy, mirroring the profile and tools rules:

- **Live deal** → indexable, `revalidate: 300`.
- **Recently expired / sold out (inside the grace window)** → **still 200**, still resolvable, but
  `...noindexSeoProps`, an unmissable "This deal ended on {date}" state at the top, the code
  hidden, and prominent links to live deals in the same category. People who click an old share
  link deserve a landing, not a 404 — and this is the honest signal that keeps us out of
  stale-coupon territory.
- **Beyond the grace window** → `{ notFound: true, revalidate: 60 }`. (Next's Pages Router cannot
  return 410 from `getStaticProps`; if we want a true 410 it has to be a `headers()` rule in
  `next.config.ts` or a middleware response. 404 is the house precedent — `/tools` and
  `ProfileLayout` both use it — so use 404 unless someone makes the 410 case explicitly.)
- **Unknown slug** → `{ notFound: true, revalidate: 60 }`. Delete `<DealNotFound />`
  (`pages/deals/[slug].tsx:45-69`) — it renders a 404 UI under a 200, which is precisely #6448.
- **Below the quality gate** (`MIN_INDEXABLE_CLAIMS`, and a real `lastVerifiedAt` inside a
  freshness window) → 200 + `noindexSeoProps`, and **the same constant gates sitemap inclusion**
  in daily-api. One number, two enforcement points. Comment it `// Mirrors the sitemap inclusion
  gate in daily-api.` like `MIN_INDEXABLE_STACKS` does.

Add a regression spec — `packages/webapp/__tests__/DealsStaticProps.tsx`, modelled on
`ProfileLayoutStaticProps.tsx` — asserting: unknown slug ⇒ `notFound`; expired-past-grace ⇒
`notFound`; expired-in-grace ⇒ props + `noindex`; live ⇒ props without `noindex`; unexpected errors
rethrown.

### Phase 4 — the answer-engine block and evidence density `[MS]` shape, `[BE]` data

*New: `packages/shared/src/features/deals/components/DealAnsweredQuestions.tsx`*

Clone `PostAnsweredQuestions` exactly — anonymous-only, native `<details>`, answer text built by
the same expression the JSON-LD uses, no-op on empty. Heading: **"Questions about this deal"**.

Question set per deal, generated from real fields (not free text):

| Question | Answer source |
|---|---|
| "Does the {brand} code still work?" | `worksRate` + `lastVerifiedAt` + claim count |
| "What do you get with the {brand} deal?" | `value.label`, `value.savingsUsd` |
| "When does the {brand} deal expire?" | `expiresAt`, formatted absolutely (not "Ends in 3d") |
| "Are there restrictions on the {brand} deal?" | `terms` |
| "Is this deal exclusive to daily.dev?" | `type === DealType.Exclusive`, `pool` |

Every answer must be **falsifiable and dated**. The cta rides inside the answer:
`` `${answer} ${cta}` `` where cta is e.g. *"Verified by {N} developers on daily.dev, last checked
{date}."*

**The evidence-density content shape for `/deals/[slug]`** — this is what actually drives AI
citation, and all of it must be in the server-rendered body:

1. **A dated verification statement, above the fold.** "Last verified {absolute date} — {N} of
   {M} developers reported it worked (`worksRate`)." Absolute dates, not relative strings.
   `dateModified` in the JSON-LD, and a visible `<time datetime>`.
2. **Hard numbers, tabular.** Claims, upvotes, works-rate percentage, dollar value
   (`formatUsd(value.savingsUsd)`), pool remaining. `formatFullNumber` for precision in the
   evidence block, `formatCompactNumber` only in chrome. `tabular-nums` per the design system.
3. **Verbatim community quotations, attributed and dated** — the highest-value GEO intervention.
   Render 3-5 `mockComments`-shaped entries as real text in the page body (not only in
   `DealDetailModal`), each with handle and timestamp. Include the *negative* ones: "Heads up, it
   does not stack with the student rate." Caveats are what makes a coupon page citable rather
   than promotional.
4. **Sources and citations.** Link the merchant's own terms page with `rel="nofollow sponsored"`
   on affiliate links (and `anchorDefaultRel` elsewhere), plus links to the daily.dev posts and
   squad threads the deal was discussed in. Outbound citation to primary sources is a measured
   GEO lever.
5. **Terms in full, not truncated.** `deal.terms` rendered as prose. This is the answer to most
   long-tail queries.
6. **The affiliate disclosure** (`DEAL_AFFILIATE_DISCLOSURE`) rendered on every deal page and on
   the directory, not optionally.
7. **Similar deals** as real links (`getSimilarDeals`), plus a link back to the category page and
   to `/deals`.
8. **A "what changed" line** when a deal is re-verified or its value changes. Refreshing beats
   publishing: a page that visibly updates is a page that gets cited.

### Phase 5 — flip indexation and wire discovery `[MS]` + `[BE]`

Only after phases 1-4 are live against **real** data:

1. Remove `noindex, nofollow` from `pages/deals/index.tsx:30-36` and
   `pages/deals/[slug].tsx:35-41`. Keep `noindexSeoProps` on the wallet and on
   below-threshold/expired deals.
2. `[BE]` daily-api ships `/sitemaps/deals.xml` (and `/sitemaps/deal-categories.xml`), gated by
   the same `MIN_INDEXABLE_CLAIMS` + freshness constant. Reached through the existing
   `/api/sitemaps/:path*` proxy in `next.config.ts` — **no webapp change needed**.
3. Add `/deals` to `llms.txt` — that file lives in the **recruiter-landing** repo, not here.
4. Internal linking: a sidebar/footer entry to `/deals`, category chips as real `<a href>`s on the
   directory, `sr-only` crawl blocks if the design has no room (precedent:
   `TagTopicPage.tsx:425-451`).
5. `[BE]` A real `lastVerifiedAt: string` (ISO) replacing `lastVerifiedAgo: string`
   (`types.ts:43`), so freshness can drive `dateModified`, sorting, the sitemap gate and the
   expiry policy. Derive the "3h" label in the client from the timestamp, never the reverse.
6. `[BE]` Real `worksRate` reporting so the verification statement is truthful.

### Optional phase 6 — markdown twin `[MS]`

`/deals.md` and `/deals/[slug].md` via `MARKDOWN_ROUTES` in
`packages/webapp/lib/markdownRoutes.ts` + a `pages/api/md/deals/[slug].ts` modelled on
`pages/api/md/posts/[id].ts`: same six headers, same `> ## Documentation Index` blockquote, same
`shouldNoindexDeal` gate, sections `## What you get`, `## Questions about this deal`,
`## Community reports`, `## Terms`, `## Similar deals`.

---

## 6. What shipped — routes, schema and the agent surfaces

### Routes

| Route | Data | `revalidate` | Schema emitted |
|---|---|---|---|
| `/deals` | `getStaticProps` over live deals | `300` | `CollectionPage` + `BreadcrumbList` + `ItemList` |
| `/deals/brand/[brand]` | `getStaticPaths` blocking + `getStaticProps` | `300` | `CollectionPage` + `BreadcrumbList` + `ItemList` |
| `/deals/c/[category]` | `getStaticPaths` blocking + `getStaticProps` | `300` | `CollectionPage` + `BreadcrumbList` + `ItemList` |
| `/deals/[slug]` | `getStaticPaths` blocking + `getStaticProps` | `300` | `ItemPage` (`dateModified`) + `Offer` + `BreadcrumbList` |

Brand pages are the primary faceted route: brand queries (`<brand> promo code`,
`<brand> student discount`) carry the demand, categories are secondary. Both are reached from the
directory through real `<a href>` chips in `DealsFilterBar`, and each deal is reached through the
`DealCard` title anchor.

**No `FAQPage` JSON-LD.** FAQ rich results ended in May 2026 and no coupon rich result is reachable
through markup, so the answer-engine block is native `<details>` only. The `Offer` node stays
cautious: `price` is never emitted because the directory does not hold merchant prices, and the
discount is emitted as a percentage or a money amount plus `discountCurrency`, never both.

### Constants

| Constant | Value | Where |
|---|---|---|
| `MIN_INDEXABLE_DEAL_CLAIMS` | `25` — gates page `noindex`, the JSON feed, the markdown twin and (future) sitemap inclusion | `shared/src/features/deals/dealsFormat.ts` |
| `EXPIRED_DEAL_GRACE_DAYS` | `30` | same file |

Expiry policy, via `getDealPageStatus(deal, now)`: **live** ⇒ `200`, indexable. **Ended inside the
grace window, or sold out** ⇒ `200` with `noindexSeoProps`, an honest "this deal ended" state and
links to live alternatives. **Ended past the window** ⇒ `{ notFound: true, revalidate: 60 }`.
**Unknown slug** ⇒ `{ notFound: true, revalidate: 60 }`. Sold-out deals never 404 because a pool can
refill.

### `/api/deals/feed.json`

A stable offers feed for agents. `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`,
`X-Robots-Tag: noindex, nofollow`. Envelope: `{ version, generatedAt, directory, count, deals }`.
Each entry carries `slug`, `url`, `title`, `description`, `brand: { name, domain }`, `type`,
`value`, `savingsUsd`, `priceCurrency`, `discountPercent`, `discountAmount`, `partnerUrl`,
`isCommissioned`, `availability` (`in_stock` / `sold_out` / `expired`), `categories`, `publishedAt`,
`updatedAt`, `validFrom`, `validThrough`, `lastVerifiedAt`, `claims`, `upvotes`, `worksRate`.
Absent optional fields are `null`, never omitted, so a consumer can rely on the key set. Promo
codes are deliberately **not** in the feed: the code is what the claim loop trades for an account.

### Markdown twins

`/deals.md` and `/deals/<slug>.md`, registered in `MARKDOWN_ROUTES` and `getMarkdownRewrites`,
served by `pages/api/md/deals.ts` and `pages/api/md/deals/[slug].ts` with the six standard headers
and the `> ## Documentation Index` blockquote. Gated by the same `shouldNoindexDeal` predicate as
the HTML page, 404 with `text/markdown` otherwise.

`llms.txt` does not exist in this repo (only `pages/api/md/*` does); it is served by the
marketing-site origin, so **adding `/deals` to it is a recruiter-landing change**. It is also
measurably ignored by crawlers today, so it is not a priority.

---

## Appendix — house constants worth memorising

| Thing | Value | Where |
|---|---|---|
| `getStaticPaths` for indexable dynamic routes | `{ paths: [], fallback: 'blocking' }` | universal |
| `revalidate` — posts | `60` | `pages/posts/[id]/index.tsx` |
| `revalidate` — tools directory + landing | `300` | `pages/tools/*` (#6437) |
| `revalidate` — tags / sources | `3600` | `pages/tags/[tag].tsx`, `pages/sources/[source].tsx` |
| `revalidate` on `notFound` | `60` (keep it, so late entities recover) | #6448, #6437 |
| Markdown twin cache | `public, s-maxage=86400, stale-while-revalidate=604800` | `pages/api/md/*` |
| Canonical | `https://daily.dev` + `asPath`, query stripped except `/search` | `shared/src/lib/canonical.ts` |
| Robots | `noindex`/`nofollow`/`robotsProps` only — never `additionalMetaTags` | `next-seo.ts:38-45` |
| Origins | `getAppOrigin()` / `getSiteOrigin()` | `packages/webapp/lib/seo.ts` |
| Titles | `getPageSeoTitles(title)` → `… | daily.dev` | `components/layouts/utils.ts` |
| Sitemaps | generated in daily-api, proxied via `/api/sitemaps/:path*` | `next.config.ts:127-130` |
| `robots.txt` / `llms.txt` / `sitemap.xml` | not in this repo — marketing-site origin | — |
