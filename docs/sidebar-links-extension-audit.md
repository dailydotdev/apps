# Sidebar links on the extension: v1 vs v2 audit

## Why links break on the extension at all

The extension renders the same sidebar from `chrome-extension://<id>/…`. A
root-relative href (`/following`) resolves against **that** origin, so it lands
on `chrome-extension://<id>/following` — a 404. Only absolute webapp URLs
(`${webappUrl}following`) survive.

But several rows are *deliberately* root-relative: on the extension new tab,
"For You" / "Following" / "Explore" switch the feed **in place** rather than
navigating, and their path exists only so the row can match the active feed.

The mechanism that makes that safe is the button/link switch:

- `MainFeedPage` (extension new tab) passes `isNavItemsButton` →
  `MainLayout` → `Sidebar` → `isNavButtons`.
- A `Section` given `isItemsButton` renders its rows as **buttons**
  (`SidebarItem`: `isButton={isItemsButton && !item.isForcedLink}`).
- A button has no href, so a relative path can never navigate.
- `isForcedLink: true` opts a row back into being a link — those rows must
  therefore always carry an absolute URL.

So a row is safe when **either** it renders as a button on the extension,
**or** its path is absolute. A relative path rendered as a link is the bug.

Note `ClickableNavItem` renders a **link** whenever `item.path` is set, even if
the item also has an `action` — and `combinedClicks` does not `preventDefault`.
An `action` alone does not save a relative path.

## What was broken

v2 moved the feed rows from `MainSection` into `ProfilePanelSection` (the
avatar panel) but rendered that panel with `isItemsButton={false}`, dropping the
button contract v1 had. The shortcuts dock — new in v2 — has no button mode at
all, so relative paths there always 404.

| # | Row / surface | v1 (production) | v2 before | Extension result | Fix |
|---|---|---|---|---|---|
| 1 | **Following** (You panel) | `MainSection`, `/following`, section `isItemsButton={isNavButtons}` → button | `ProfilePanelSection`, `/following`, section `isItemsButton={false}` → link | 404 | Panel now gets `isItemsButton={isNavButtons ?? false}` |
| 2 | **Following** (shortcuts dock catalog) | n/a | `/following`, plain link | 404 | `${webappUrl}following` |
| 3 | **Any row dragged into the dock** | n/a | pins `item.path` verbatim; relative rows pin a relative path | 404 | `pinPage` runs `toWebappHref` |
| 4 | **Recent pages** (Explore panel) | n/a | `router.asPath`, i.e. relative, plain link | 404 | Absolute via `toWebappHref` on extension only |

## Full inventory (v2)

Legend: **button** = relative path is safe because the row renders as a button
on the extension. **absolute** = href starts with `webappUrl`.

### Rail

| Control | Path | Renders as | Extension | Status |
|---|---|---|---|---|
| Brand mark / Home | `/my-feed` | link, but `onLogoClick` calls `preventDefault` on extension | in-place feed switch | OK |
| Search | — | button (opens spotlight) | — | OK |
| Explore tab | `${webappUrl}posts` | link | absolute | OK |
| Squads tab | `${webappUrl}squads/discover` | link | absolute | OK |
| Game Center tab | `${webappUrl}game-center` | link | absolute | OK |
| Profile (avatar) tab | — | button (opens panel) | — | OK |
| New post | — | button (opens modal) | — | OK |
| Notifications bell | — | button (opens panel) | — | OK |
| Invite / Support | — | buttons (popovers) | — | OK |
| Settings gear | `${settingsUrl}/profile` | link | absolute | OK |
| Shortcuts dock — catalog | `${webappUrl}…` ×11 | link | absolute | **fixed (#2)** |
| Shortcuts dock — pinned page | stored per pin | link | absolute after fix | **fixed (#3)** |

### Explore panel

| Row | Path | Renders as | Status |
|---|---|---|---|
| Explore | `/posts` + `onNavTabClick` | button on extension (`isItemsButton={isNavButtons}`) | OK |
| Happening Now | `${webappUrl}highlights` | forced link | OK |
| Presidential briefings | `briefingUrl` | forced link | OK |
| Tags / Sources / Leaderboard | `${webappUrl}…` | forced link | OK |
| Watercooler | `watercoolerUrl` | forced link | OK |
| Discussions | `${webappUrl}discussed` | forced link | OK |
| Recent pages | `router.asPath` | link | **fixed (#4)** |

### You panel

| Row | Path | Renders as | Status |
|---|---|---|---|
| Profile header | `${webappUrl}${username}` | link | OK |
| Following | `/following` + `onNavTabClick` | button on extension after fix | **fixed (#1)** |
| History / Analytics | `${webappUrl}…` | forced link | OK |
| Feed settings | `${settingsUrl}/feed/general` | forced link | OK |
| Get API Access | `plusUrl` | forced link | OK |
| Custom feeds | `undefined` + action on extension, else `${webappUrl}feeds/<id>` | button on extension | OK |
| Bookmarks / Read it later / folders | `${webappUrl}…` | forced link | OK |

### Squads, Settings, Notifications, Game Center panels

| Row | Path | Status |
|---|---|---|
| Squad rows | `squad.permalink` (absolute) | OK |
| Find Squads / Pending Posts | `${webappUrl}…` | OK |
| Every settings row | `${settingsUrl}/…` | OK |
| Notification settings / All activity | `${webappUrl}notifications…` | OK |
| Game Center settings | `${webappUrl}game-center/settings` | OK |
| New post menu rows | no path, action only → button | OK |

## Keeping it fixed

`sidebarLinks.spec.ts` asserts every shortcut-catalog entry is absolute and
covers `toWebappHref`. It re-loads the modules against a realistic origin
because `__tests__/setup.ts` sets `NEXT_PUBLIC_WEBAPP_URL` to `/`, which makes
relative and absolute forms textually identical and the assertion vacuous.

When adding a sidebar row, pick one:

- **navigates to a webapp page** → absolute (`${webappUrl}…`), and
  `isForcedLink: true` if the section may render buttons;
- **switches the feed in place** → relative path + `action`, and make sure the
  section receives `isItemsButton={isNavButtons ?? false}`;
- **opens a modal/panel** → no path, `action` only.
