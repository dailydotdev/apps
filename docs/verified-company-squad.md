# Verified Company Squad and the squad page redesign

The reference for this project. Validate every PR in `apps` and `daily-api` against it, and update it when a decision changes.

Design reference: the Storybook mock-ups in `packages/storybook/stories/squad-page` (commit `1ef074325`), stories "Squad Page / 1. Direction" and "Squad Page / 2. Use cases". The `archive/` folder and "4. Research" are superseded. The mock is a designer implementation: it is the source of truth for look and behavior, not for architecture, data or copy that this doc overrides.

## Decisions

- The product is called **Verified Company Squad**. Replace every "Verified Squad page" string from the mock.
- **No feature flag.** The redesign replaces the legacy squad page for every squad, and the legacy components are deleted.
- Paid features are driven by a **per-squad feature map**, set by sales operations through a private API endpoint that Smith calls. There is no self-serve purchase, no billing and no expiry.
- **Free squads show nothing of the paid features**: no placeholders, no locked states, no upsell, no Manage entries.
- **Dofollow applies only to the Links widget** (and the website in the header meta line, which is the same data). Post content, comments and product links stay `nofollow`.
- The **content feed** (a company RSS posting into its squad) is managed on the backend only: ops add the RSS to the squad through the existing Yggdrasil ingestion (a `SourceFeed` on the squad itself, not `linkedSourceIds`). No UI, no API surface, no feature key. The mock's Content feed pages, menu items and integration row are ignored.
- **Products** live on the tools catalog (`DatasetTool`): a squad's products are the tools whose `officialSourceId` is that squad. No separate product entity.
- The squad **feed is infinite scroll**.
- **Rules** ship in iteration 2. **FAQ** is dropped.
- The verified badge appears **only on the squad page** in this project. Directory cards and post headers are unchanged.
- The verified badge card is copied **as designed**, frosted glass included.

## Paid vs free

| Feature | Free (every squad) | Paid feature key |
|---|---|---|
| New layout: cover, round logo, meta line, stats, action row, options menu | yes | |
| Right column below laptop as an About tab | yes | |
| Composer, pinned posts, infinite feed, polls | yes | |
| Squad scoped search in Spotlight with type-ahead suggestions, results page | yes | |
| Manage area (details, members, moderation, posting and invitations, analytics, integrations, danger zone) | yes | |
| View as a visitor, share card | yes | |
| Team, Stack & Tools, Analytics widgets | yes | |
| Empty states, private squad wall, blocked state, production parity fixes | yes | |
| Verified badge next to the name and the Verified Company Squad card | | `verified` |
| No ads on the squad feed, the squad's search results, and the page or modal of any post in the squad | | `adFree` |
| Links widget and website in the meta line, dofollow; Manage > Links | | `links` |
| Products shelf, Products page, Add or edit product, Manage > Products | | `products` |

## Data model and API contract (daily-api)

The API ships first and is additive only, so it can deploy before `apps` merges. `apps` must not merge before the API is live in production.

### Feature map

- A dedicated jsonb column on `source` (not inside `flags`, which crons and CDC write counters into). Missing keys mean off.
- Keys today: `verified`, `adFree`, `links`, `products`. Tiers can come later as named presets that resolve to the same map; the column shape does not change.
- GraphQL: `Source.features: SourceFeatures!` with nullable `verified`, `adFree`, `links`, `products`. A missing key reads as `null` and means off.
- Mutations for paid data reject while the feature is off. Reads are not gated (no per-query overhead): the client renders a paid surface only when its key is on, and ops clean up the stored data when a customer stops paying.

### Private endpoint for Smith

- `GET /p/squad-features/:idOrHandle` returns `{ id, handle, name, features }`.
- `PATCH /p/squad-features/:idOrHandle` with a partial map (for example `{ "adFree": true }`) merges and returns the full result.
- Service authentication only (same guard as `/p/company-verification`), squads only, unknown keys rejected (strict schema).
- Smith learns the endpoint through a skill in `smith-brain`, next to `company-verification-review`.

### Links (`links` feature)

- Squad fields: `website` (single URL) and `links` (ordered list of URLs). The client derives the icon and label from the domain.
- GraphQL: `Source.website: String`, `Source.links: [String!]!`.
- Mutation `updateSquadLinks(sourceId: ID!, website: String, links: [String!]!): Source!`: admins only (`Edit` permission), feature on, `http(s)` URLs only.
- The client renders these links with `rel="noopener"` and no `nofollow`.

### Products (`products` feature)

- A squad's products are `DatasetTool` rows with `officialSourceId` equal to the squad, ordered by a new position column.
- New `DatasetTool` columns: `tagline`, product `links` (ordered URLs), position.
- The logo upload is stored in `faviconUrl` with an owner value in `faviconSource`, replacing the auto-fetched favicon everywhere the tool appears.
- Pricing (`free`, `freemium`, `paid`, `open-source`, shown as Free, Freemium, Paid, Open source) and description are written as tool facts (`pricingModel`, `description`) with an owner-corrected status, which the enrichment cron never overwrites. An empty value deletes the fact.
- Category is the tool's curated category, read only. Tools without one show no category chip. The mock's category dropdown is dropped.
- GraphQL: `Source.products: [DatasetTool!]!` (ordered). New `DatasetTool` fields: `tagline`, `description`, `pricingModel`, `links: [String!]!`; the logo is the existing `faviconUrl`.
- Mutations, admins only and feature on (`FORBIDDEN` otherwise):
  - `addSquadProduct(sourceId: ID!, input: AddSquadProductInput!, logo: Upload): DatasetTool!` finds or creates the catalog tool by `name` and sets `officialSourceId`; `CONFLICT` when the tool is official elsewhere.
  - `updateSquadProduct(id: ID!, input: UpdateSquadProductInput!, logo: Upload): DatasetTool!` (no name).
  - `removeSquadProduct(id: ID!): EmptyResponse!`
  - `reorderSquadProducts(sourceId: ID!, ids: [ID!]!): [DatasetTool!]!`
- Rules:
  - A tool that is already official for another source cannot be added.
  - The tool name cannot be edited after creation (the `/tools/<slug>` URL derives from it); ops can rename.
  - Removing a product clears `officialSourceId`; the tool stays in the catalog.
  - A product belongs to one squad.
- The tool page shows the official squad regardless of the squad's features; ops clean up manually when needed.
- Ops manage everything about products through private endpoints under `/p/squad-features/:idOrHandle/products` (list, add with URL and logo from URL, edit including the tool URL and name, delete, reorder), without being squad admins and regardless of the `products` feature. Squad admins cannot change the tool URL or name.
- Known limitations: unrelated products with the same name collapse into one catalog tool; a tool can be both claimed by a company (work-email claim) and official for a squad, and ops resolve disputes.
- No import from Product Hunt, G2, Trustpilot or GitHub, and no ratings.

### Limits

Named constants in the API (`src/common/schema/squadFeatures.ts`), mirrored by one constants file in `apps` that the forms and helper copy use: 10 squad links, 20 products, 5 links per product, tagline 120 characters, description 500 characters, 500 characters per URL, `http(s)` only.

### Search

- `searchPostSuggestions(query: String!, source: ID)`: the new optional `source` argument. When given it applies the same permission check as `searchSourcePosts`, filters to that source, and includes private squad posts the viewer may read.
- `searchSourcePosts` (results) already exists.

### Indexing

- Squads with the `verified` feature are exempt from the minimum-members `noindex` rule. They stay `noindex` when private, inactive or flagged by vordr. Without this, the page-level `nofollow` that mirrors `noindex` would cancel the dofollow links.

### Content feed (backend only)

- Verify that articles ingested from a `SourceFeed` on a squad land correctly: attributed to the squad, not held by moderation, sensible member notifications. Fix gaps in the API; no GraphQL surface.

## Frontend (apps)

### Routes and surfaces

- `/squads/[handle]`: the new page. Posts and About tabs below laptop.
- Squad search results stay on `/squads/[handle]?q=`.
- New pages: Products, Members, and the author's Pending posts, reachable from the page.
- A Manage area for staff replaces `/squads/[handle]/edit`, `/squads/[handle]/analytics` and the members modal. Every legacy URL redirects to its new home, since notifications and emails link to them.
- Manage sections: Details, Products (paid), Links (paid), Members, Moderation, Posting and invitations, Analytics, Integrations (Slack only), Danger zone. No Rules, FAQ or Content feed.

### Ads

- One predicate, `isSourceAdFree` in `lib/ads.ts`, gates every ad placement: the squad feed (`disableAds`), squad search results, and on the post page (page, modal, focus and reader views) the sidebar ad, the ad shown as a comment, the in-article ad slots, the phone top strip, the focus card ad, and brand sponsorships (sponsored tool mentions, sponsored tags, brand highlights). Organic tags and tool mentions stay.
- The homepage feed post fragment gets no new fields for this project; `source.features` rides on post page and squad queries only.

### SEO

- The right column, including the Links widget, is server-rendered.
- Below laptop the About tab content stays in the DOM (hidden with CSS, not unmounted), because Google indexes the mobile render.

### Differences from the mock

- Copy: "Verified Company Squad".
- Private squads mark the squad as not public (the mock only walls content and still shows Join and Boost).
- The feed is infinite, pinned-posts collapse and the own-pending-posts strip are wired.
- No mock data ships: no CodeRabbit copy, placeholder stats, ratings, company size or location.
- The tagline slot renders the squad description.
- A private squad shows the wall in place of the whole page for non-members, header included: the API returns `FORBIDDEN` for the squad, so there is no header data to render.
- Content feed, Rules, FAQ, Releases wording and the product category dropdown are not built.

## Testing

- E2E: one Playwright smoke test, only if a verified squad can be seeded in the test environment: badge visible, Links without `nofollow`, no ad requests; a free squad shows none of these.
- API integration: feature map resolution; paid fields read empty and mutations reject while off; the private endpoint's auth and validation; product rules; scoped suggestions against private squads and blocked members; the indexing exemption.
- Frontend integration (RTL): the mock's viewer matrix (anonymous, visitor, member, moderator, admin, blocked, private) as the squad page test table; every ad placement renders nothing for an ad-free source; a free squad renders no paid widget or Manage entry, including for admins.
- Unit: posting permission rules and client feature helpers only.

## Iteration 2 and later

- Rules (API and UI).
- Badge on directory cards and post headers.
- Product import and ratings.
- Tiers as presets over the feature map.

## Validation checklist

- [ ] No "Verified Squad page" string anywhere.
- [ ] No feature flag introduced; legacy squad components and their tests deleted.
- [ ] A free squad (admin view included) shows no badge, card, Links, website, products or their Manage entries.
- [ ] A squad with `adFree` shows no ads on its feed, its search results or any of its posts, in page and modal.
- [ ] Links widget anchors have no `nofollow`; post, comment and product links still do.
- [ ] Links are in the server HTML on phone and desktop.
- [ ] Verified squads under the member threshold are indexable.
- [ ] Feature changes via `/p/squad-features` take effect without a deploy.
- [ ] Legacy squad URLs redirect.
- [ ] API deployed to production before `apps` merges.
