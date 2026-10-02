// Chapter 10: the build. Every decided piece of chapters 3 to 9l placed in
// a PR, the PRs in the order they merge, each one whole on its own. Read
// against the production code on main (95dab761a, 1 Oct 2026) after the
// four code inventories of that day; the file names below are the ones a
// developer opens first, not an exhaustive diff.

export enum Step {
  Fixes = '0',
  Shell = '1',
  Places = '2',
  PostAndYou = '3',
  Reading = '4',
}

export const stepNames: Record<Step, string> = {
  [Step.Fixes]: 'Fixes',
  [Step.Shell]: 'The shell',
  [Step.Places]: 'The places',
  [Step.PostAndYou]: 'The post, and you',
  [Step.Reading]: 'Reading the link, and the wrappers',
};

// The engineering rules under every PR. They come from the code, not from
// taste: each one answers a way the inventory showed this work could break.
export const principles: [string, string][] = [
  [
    'Whole after every merge',
    'A PR leaves the app complete: nothing a member could reach yesterday is unreachable today, and no page shows half a shell. Mixed states (new bar, old header) are allowed; broken states are not. This replaces the "one PR train" answer in 9i.',
  ],
  [
    'Sequence, not stack',
    'Every PR branches from main and merges on its own. Order matters because a later PR builds on a merged one, never on an open one. A PR that needs an unmerged PR waits.',
  ],
  [
    'Replace under 656px, keep the rest',
    'The shell renders below the tablet breakpoint (ViewSize.MobileL, which in this code means under 656px). Tablet, laptop, layout v2 and the extension keep the code they run today; nothing there is edited except to add the width gate.',
  ],
  [
    'Presence by CSS, behaviour by JS',
    'Pages render on the server with the phone view size, so a shell that appears only after hydration would flash on desktop and pop in on phones. The cluster and the block are in the server HTML, shown or hidden by tablet:hidden classes; JavaScript adds scroll behaviour, badges and events after hydration. No windowLoaded gate.',
  ],
  [
    'Overlay, never reflow',
    'The block and the cluster are fixed overlays; content keeps a constant top and bottom padding read from two CSS variables the shell publishes (like --phone-top-ad-height today). Hiding moves a transform; the feed never shifts.',
  ],
  [
    'One progress, one spec',
    'useShellScroll is the only scroll reader on a phone page; the block, the cluster, the field and the post capsule all move on its value and on the numbers in spec.ts. No component owns a duration.',
  ],
  [
    'Old code goes when nothing renders it',
    'A component replaced under 656px is deleted in the same PR if no other width renders it (MobileFooterNavbar, FooterPlusButton), and kept without change if tablet or the extension still do (FeedNav, GoBackHeaderMobile at tablet). Dead phone branches are not left behind.',
  ],
  [
    'URLs stay',
    'No route is renamed and no server redirect is added for a phone reason. A page changes what it renders under 656px and keeps its URL, canonical, JSON-LD and crawl links. The one redirect (/squads/create to /squads/new) is a duplicate route, not a phone rule.',
  ],
  [
    'Same events, from the new place',
    'Every event in 9j fires with the same name, target and origin from the component that replaces its old home. The two additions (a click per cluster tab, ClickNotificationIcon with NotificationTarget.Footer) land with the cluster.',
  ],
  [
    'Proof before review',
    'A PR opens with its proof attached: the jest runs, the strict typecheck, the phone screenshot sweep at 390 and 393px against the mock, a desktop sweep showing no change, and a simulator recording for anything that scrolls or drags. Tsahi QAs on the preview from his phone.',
  ],
];

// Where the new code lives and what it replaces. One folder under shared,
// named for what it is.
export interface Piece {
  piece: string;
  lives: string;
  replaces: string;
  note: string;
}

export const architecture: Piece[] = [
  {
    piece: 'spec.ts',
    lives: 'shared/src/components/shell/constants.ts',
    replaces: 'chromeSpec, hideSpec, the mock constants',
    note: 'The numbers from the storybook spec.ts, typed. Motion curves and durations also as CSS custom properties in shell.css so Tailwind classes can use them.',
  },
  {
    piece: 'shell.css',
    lives: 'shared/src/styles/shell.css, imported by globals.css',
    replaces: 'nothing',
    note: 'The press class (0.96, 150ms, scale only), the floating material, the hit-area pseudo-element, the two curves, the reduced-motion block. Utilities, no components.',
  },
  {
    piece: 'useShellScroll',
    lives:
      'shared/src/components/shell/useShellScroll.ts + ShellScrollProvider',
    replaces:
      'useHideProgress, useBlockProgress, the post bar’s own scroll listener',
    note: 'Window scroll on the webapp. Direction, dead zone, tolerances, 300ms stop, snap to 0 or 1. One provider under MainLayout below 656px; consumers read p and snapping from context.',
  },
  {
    piece: 'ShellCluster',
    lives: 'shared/src/components/shell/ShellCluster.tsx',
    replaces:
      'MobileFooterNavbar, FooterNavBarTabs, FooterNavBarItem, FooterPlusButton',
    note: 'Home · Explore · Squads · Activity in the bar, the Create square beside it. Publishes --shell-bottom. Mounted by FooterNavBarLayout in FooterWrapper’s slot, so every page that has a footer today has the cluster, and the no-shell pages (bare MainLayout) have none.',
  },
  {
    piece: 'ShellBlock',
    lives:
      'shared/src/components/shell/ShellBlock.tsx (RootRow, PageRow, ThingRow) + the row slot',
    replaces:
      'FeedNav’s phone branch (MobileFeedActions + the chips), GoBackHeaderMobile, ProfileMobileBackButton, NoSidebarLayout’s back link, the ad-hoc router.back() headers',
    note: 'Fixed overlay under the status bar, solid page background, publishes --shell-top. Slots: a top strip (offline, the ad strip), the row (brand, page or thing), the tab row. Hides on useShellScroll.',
  },
  {
    piece: 'ShellRow',
    lives:
      'shared/src/components/shell/ShellRow.tsx (Segments, Chips, MenuLabel) + useActiveFromRoute',
    replaces:
      'UnifiedMobileFeedNav’s phone rendering, SquadDirectoryNavbar on phones, TagPageNavbar, NotificationFilterBar, TagDirectoryFilter, the explore period Dropdown',
    note: 'The 28px chip at the three weights; one selected item from a route prefix; swipe with the axis lock moves segments only.',
  },
  {
    piece: 'Sheet',
    lives: 'shared/src/components/drawers/Drawer.tsx, extended',
    replaces: 'nothing; every Drawer consumer gets it',
    note: 'Transitions 300 in on travel, 200 out, scrim 150; grabber; drag to dismiss past a third with elastic 0.05 and no momentum; inert page, contained overscroll, focus return; covers the status bar; always on the root portal. DropdownMenu gains a touch renderer that uses it.',
  },
  {
    piece: 'ShellField',
    lives: 'shared/src/components/shell/ShellField.tsx',
    replaces:
      'the sticky SpotlightTrigger header on /posts and /search, TagDirectorySearch, RouterPostsSearch’s field',
    note: 'The 52px field above the cluster, compact on scroll, a SpotlightTrigger where the page searches through Spotlight and a ?q= field where it filters in place.',
  },
  {
    piece: 'PostCapsule',
    lives: 'shared/src/components/post/MobilePostFloatingBar.tsx, rewritten',
    replaces: 'MobilePostFloatingBar v1 and v2',
    note: 'The 52/44 accessory on useShellScroll; the same hooks, stable ids and origins. Reused by the reading drawer in step 4.',
  },
  {
    piece: 'YouPage',
    lives: 'webapp/pages/you.tsx + shared/src/components/shell/YouPage.tsx',
    replaces:
      'ProfileSettingsMenuMobile (the left NavDrawer) as the phone’s menu; the avatar link to the profile',
    note: 'The list from 9b: Plus, Custom feeds, My squads, Following, Bookmarks, History, Your progress, Core wallet, Invite friends, Settings; Help as the top action. Route name /you is an engineering pick to confirm.',
  },
];

// One PR, whole on its own. `after` lists the PRs that must already be on
// main; `size` is a review size, not an estimate.
export interface Pr {
  id: string;
  step: Step;
  name: string;
  ships: string;
  touches: string;
  after: string;
  whole: string;
  proof: string;
  size: 'S' | 'M' | 'L';
}

export const prs: Pr[] = [
  {
    id: '0',
    step: Step.Fixes,
    name: 'The four fixes, one PR (dailydotdev/apps#6765, merged 2 Oct)',
    ships:
      'Tsahi’s call (1 Oct): the four step-0 fixes land together. (1) TabContainer’s swipe locks its axis in the first 10px, commits only inside the 27° cone past 56px or on a fast flick past 32px, and the surface gets touch-action: pan-y; Highlights is the only swipeable TabContainer. (2) FooterNavBarLayout renders the bar once hydrated instead of after window load; each footer tab fires a Click with the footer as target_id and the tab in extra, and Activity fires ClickNotificationIcon with NotificationTarget.Footer and the unread count. (3) The hover-only three-dot triggers (HighlightCardOptions, SquadOptionsButton) use the shared laptop-and-mouse-only hover class so they show on touch; the Explore period picker gets a Close; the notifications menu icon stops being rotated; Unfollow uses the remove-user icon; "Manade Ad" and the five settings labels match their page titles (Profile, Invite friends, Streaks & gamification, Payment & Subscription, Open source). (4) shell.css lands with the two curves and four durations as custom properties and the press class (scale 0.96, 150ms, scale beside the button transitions), applied to the footer tabs, the plus button, the header gear and avatar, the feed chips and the post bar; text-wrap: balance on the post page titles; shell/constants.ts holds the swipe numbers and the motion values.',
    touches:
      'shared: components/tabs/TabContainer.tsx (+spec), components/shell/constants.ts (new), styles/shell.css (new) and globals.css, cards/highlight/HighlightCardOptions.tsx, cards/common/SquadOptionsButton.tsx, comments/CommentActionButtons(.v2).tsx, notifications/NotificationItem.tsx, header/FeedExploreHeader.tsx, feeds/MobileFeedActions.tsx and UnifiedMobileFeedNav.tsx, post/MobilePostFloatingBar.tsx, the three post title elements, the four settings menus. webapp: layouts/FooterNavBarLayout.tsx, footer/MobileFooterNavbar.tsx (+ a new test), FooterNavBarTabs.tsx, FooterPlusButton.tsx, footer/common.ts.',
    after: 'none',
    whole:
      'The same app with four things fixed; nothing moves, nothing is removed.',
    proof:
      'Four new swipe specs on TabContainer; a MobileFooterNavbar spec for the two events; the touched shared and webapp suites green; strict typecheck and lint clean; Playwright at 390px: the nav is in the DOM before the load event, every card menu opens under touch; simulator: Highlights scrolled at an angle changes no channel. The Prompt already cancels on an outside tap and has a Cancel button, so nothing changed there.',
    size: 'M',
  },
  {
    id: '1.1',
    step: Step.Shell,
    name: 'The bottom cluster (shipped with 1.2 to 1.8 as dailydotdev/apps#6767, 1 Oct)',
    ships:
      'ShellCluster replaces the footer under 656px: Home · Explore (/posts, the compass) · Squads (/squads/discover) · Activity, the Create square opening SmartComposerModal directly, the material, Tint selection, the brand bubble on Activity only, the shrink on useShellScroll (which lands here with ShellScrollProvider), first paint from the server HTML, the safe area, the re-tap (scroll to top), the lit root from useActiveNav extended for the owning root (Squads lights on /squads/[handle]; posts light Home), visitors: Activity and Create open the sign-up (the AuthModal trigger with its context line, which is 1.5), Explore and Squads open. Headlines leaves the bar; /highlights stays one tap away in today’s Home strip. MobileAppFooter keeps its trigger and replaces the cluster when it shows (9h); MobilePostFloatingBar sits above the cluster on post pages as it sits above the nav today. The cluster publishes --shell-bottom; FooterSpacer reads it.',
    touches:
      'shared/components/shell/{ShellCluster,useShellScroll,ShellScrollProvider}.tsx (new), webapp/components/layouts/FooterNavBarLayout.tsx, webapp/components/footer/FooterWrapper.tsx, hooks/useActiveNav.tsx, react-flip-toolkit removed with FooterNavBarItem; delete MobileFooterNavbar, FooterNavBarTabs, FooterNavBarItem, FooterPlusButton.',
    after: '0',
    whole:
      'New bar, today’s headers. Every destination the old bar had is one tap away (Headlines through the strip, the profile through the avatar in the row).',
    proof:
      'New ShellCluster and useShellScroll specs (active tab per route, events, shrink at p 0 and 1, badge); webapp FooterWrapper spec rewritten around the cluster; MainLayout specs; Playwright phone sweep of the 21 page types in 4b before and after; desktop sweep unchanged; extension build; simulator recording of the shrink on Home, Explore and a post.',
    size: 'L',
  },
  {
    id: '1.2',
    step: Step.Shell,
    name: 'The You page',
    ships:
      'The leaf behind the avatar at /you: name row, the rows from 9b in order with outline icons, Your progress, Core wallet, Invite friends, Settings; Help as the top action. The avatar in today’s phone row links to it; the settings gear leaves the row (Settings is a You row; the settings NavDrawer still opens from inside /settings until 3.4). Desktop renders /you as the same list page; nothing links to it there.',
    touches:
      'webapp/pages/you.tsx (new), shared/components/shell/YouPage.tsx (new), shared/components/feeds/MobileFeedActions.tsx (avatar href, gear removed), the You row states from lib/plus.ts (9k).',
    after: '1.1',
    whole: 'The avatar opens You; everything the gear opened is a You row.',
    proof:
      'YouPage spec (rows per state: free, member, cancelled, organization); MobileFeedActions spec; Playwright: every You row lands on its page; screenshots against the 9b mock in both themes.',
    size: 'M',
  },
  {
    id: '1.3',
    step: Step.Shell,
    name: 'The top block on the roots',
    ships:
      'ShellBlock replaces FeedNav under 656px on Home and gives Explore, Squads and Activity the root row they never had: Home = logo (with production’s Plus mark for members), streak (number before the flame), the Plus square for free members (9k: opens the Plus page, fires UpgradeSubscription with a mobile header target), the avatar; Explore, Squads, Activity = name, avatar (Activity adds the settings glyph). The row slot carries today’s rows unchanged (the chip strip on Home, the type chips on Activity); the block hides as one solid piece on useShellScroll with the dead zone, tolerances and snap, and returns on any scroll up; content gets --shell-top padding; the offline strip slot; visitors see Log in and Open app (MobileAppActions) where members see the streak and avatar. Under the status bar, no frame; the status edge once hidden.',
    touches:
      'shared/components/shell/ShellBlock.tsx (new), layout/MainLayoutHeader.tsx (below 656 renders the block), feeds/FeedNav.tsx (gated to 656 and up; tablet and the extension keep it), notifications page header, squads/layout/SquadDirectoryLayout header, MainLayoutHeader.spec and FeedNav.spec (kept for tablet, new cases for the block), safeArea.css (the block opts out of the sticky offset and pads itself).',
    after: '1.1, 1.2',
    whole:
      'Every root has the same top row and the same hide; the row contents are still today’s.',
    proof:
      'ShellBlock spec (hide state machine with synthetic scroll positions, reveal on focus, arrival shown); MainLayoutHeader spec: desktop and tablet unchanged; Playwright at 390px: block hidden after 64px down, shown after 8px up, on all four roots; simulator recording with the wheel probe pattern from 4e (20px steps); dark shots.',
    size: 'L',
  },
  {
    id: '1.4',
    step: Step.Shell,
    name: 'The top block on pages',
    ships:
      'The PageRow: back (38px square, one icon), the name (20px), the page’s actions, hiding on scroll like a root. It replaces GoBackHeaderMobile under 656px (posts, squads, profile sub-pages), ProfileMobileBackButton and the profile’s fixed header, NoSidebarLayout’s back link, SquadSubPageHeader, and the ad-hoc router.back() bars; the leaves with no bar today get one (tag, source, leaderboard, notification settings, wallet, game center, analytics, quests: 4b fix 16). One goBack(): history when the previous entry is in-app, else the owning root. Visitors get Log in and Open app in the right slot and the auth banner leaves the top (9f). Things (squad, profile, tag, source) get the plain page block for now; their covers and names come in 2.5 and 2.6. The post page gets back, share and menu in the block.',
    touches:
      'shared/components/shell/ShellBlock.tsx (PageRow), post/GoBackHeaderMobile.tsx (tablet only), profile/Header.tsx, NoSidebarLayout.tsx, squads SquadSubPageHeader, layout/PageHeader.tsx phone instances, MainLayout canGoBack (typed, and set by the pages in 4b’s list), CustomAuthBanner placement, a goBack helper beside useActiveNav.',
    after: '1.3',
    whole: 'One back button, one title size, one hide on every leaf.',
    proof:
      'goBack spec (history, deep link, no-shell); GoBackHeaderMobile spec kept at tablet; PostPage, SquadPage, Profile page webapp tests; Playwright sweep of every leaf in 4b at 390px; desktop unchanged; simulator: back from a deep link lands on the owning root.',
    size: 'L',
  },
  {
    id: '1.5',
    step: Step.Shell,
    name: 'The sign-up page, two touches',
    ships:
      'On phones the gated Sign up shows a close button top left instead of the chevron and one line under the title keyed by the trigger (Follow this tag, Join this squad, Upvote, Save…). Providers, order, email step, terms, Log in, component, flow and analytics untouched.',
    touches:
      'shared/components/auth/AuthModal + AuthDefault (a title line prop keyed by AuthTriggers), the phone header of the modal.',
    after: '1.1',
    whole: 'Same sign-up, one line clearer, one way out.',
    proof:
      'AuthModal specs (the line per trigger, the close); screenshots of three triggers against the 9b mock.',
    size: 'S',
  },
  {
    id: '1.6',
    step: Step.Shell,
    name: 'The sheet',
    ships:
      'Drawer becomes the sheet of 4b: 300ms in on the travel curve, 200 out, scrim 150, interruptible; a grabber; drag to dismiss past a third with elastic 0.05 and no momentum; the page behind inert, overscroll contained, focus returned, Escape; it covers the status bar and always mounts on the root portal. Every Drawer consumer (the streak, Dropdown fields, Modal isDrawerOnMobile, the app sheet, filters, schedule, GIF picker) gets it with no change of its own; the bottom Close buttons go.',
    touches:
      'shared/components/drawers/Drawer.tsx and Drawer.spec.tsx (which asserts classes), ListDrawer, the consumers’ displayCloseButton props.',
    after: '0',
    whole: 'Every sheet in the app opens, drags and closes the same way.',
    proof:
      'Drawer spec rewritten (open, close, drag past a third, drag back, inert, focus return); Playwright: open and close a sheet mid-animation; simulator recording of a drag.',
    size: 'M',
  },
  {
    id: '1.7',
    step: Step.Shell,
    name: 'Menus as sheets',
    ships:
      'DropdownMenu gets a touch renderer under 656px that renders its items in the sheet, grouped, destructive last; PostOptionButton is capped at seven visible rows with Not interested and More as sub-sheets; one Share sheet everywhere (copy link inside; the standalone CopyLink buttons on tag and source pages go); one squad menu shared by page and card; the profile’s actions once. 4b fixes 1, 2, 6, 7, 8, 9, 23. Every item keeps its handler and its event.',
    touches:
      'shared/components/dropdown/DropdownMenu.tsx (a renderer switch on ViewSize.MobileL), features/posts/PostOptionButton.tsx, the Share flow, SquadOptionsMenu, tags/sources CopyLinkButton, profile header actions.',
    after: '1.6',
    whole:
      'Every three-dot menu is a sheet on a phone; desktop menus unchanged (the same items and events).',
    proof:
      'DropdownMenu spec at both widths (same items, same onClick), PostOptionButton events unchanged (Origin.PostContextMenu), the 35 desktop consumers rendered in the existing specs under mockDesktop; Playwright with hasTouch: every menu in 4b’s list of 20 opens as a sheet.',
    size: 'L',
  },
  {
    id: '1.8',
    step: Step.Shell,
    name: 'People are rounded squares',
    ships:
      'Every person’s avatar takes ProfilePicture’s radius for its size where a circle is drawn today (comment authors, the composer, members lists, the You row); squads and sources keep the circle. The header avatar is the 38px floating square from 1.3.',
    touches:
      'ProfilePicture consumers that pass rounded-full for a person; the comment author picture; member rows.',
    after: '1.3',
    whole: 'One shape for people, one for places.',
    proof:
      'A grep-based spec that no person picture passes a circle class; screenshots of a comment thread, a members list and the composer.',
    size: 'S',
  },
  {
    id: '2.1',
    step: Step.Places,
    name: 'The row family, and the Home row (shipped inside dailydotdev/apps#6767)',
    ships:
      'ShellRow (Segments, Chips, MenuLabel; the 28px chip at three weights; active from a route prefix; a segment change replaces the history entry, a leaf pushes; the axis-locked swipe moves segments only) and the Home row it was made for: For you · Happening now ▾ · Following · custom feeds · +, the channel sheet on Happening now with ?channel= and the choice on the list header line (the URL stays /highlights), sort and feed settings collapsed into one control at the end of the row (4b fix 27). The other Home strip chips leave: Squads is the bar, Popular, Discussions, Tags, Sources, Leaderboard are Explore rows (2.2), Bookmarks, History, Following, Hot takes, Game center, Agents are You rows (1.2). The desktop ExploreChipsBar is untouched.',
    touches:
      'shared/components/shell/ShellRow.tsx (new) + useActiveFromRoute, feeds/UnifiedMobileFeedNav.tsx (kept for tablet, gated), highlights HighlightsPage (the channel sheet, ?channel=), feeds/exploreCategories.ts (prefix matching), the ClickFeedTagChip event kept on custom-feed segments, PlusMobileEntryBanner slot under the row.',
    after: '1.3, 1.6',
    whole:
      'Home has four segments and a menu; every chip that left is on Explore, You or the bar.',
    proof:
      'ShellRow spec (active by prefix on /upvoted, /explore/[tag], /bookmarks/later; swipe cone); UnifiedMobileFeedNav spec at tablet unchanged; useFeeds spec; Playwright: every old chip destination reachable in two taps; screenshots of the row against 4c in both themes.',
    size: 'L',
  },
  {
    id: '2.2',
    step: Step.Places,
    name: 'Explore',
    ships:
      '/posts under 656px becomes the Explore page: the places rows (Popular, Discussions, Tags, Sources, Leaderboard, Agents), then the Explore feed with the sort as a text menu (Popular ▾ opening a sheet: Popular, Upvoted, Discussed, Latest, Best of, and Period for the two sorts that have one; best-of months as plain leaves from the same sheet). /posts/upvoted, /posts/discussed, /posts/latest, /posts/best-of, /popular, /upvoted and /discussed render this page with the matching sort; the URLs stay. FeedExploreHeader’s phone branch, the 4.5rem sticky band and the search header go; the field comes in 2.3.',
    touches:
      'shared/components/MainFeedLayout.tsx (FeedExploreComponent below 656), header/FeedExploreHeader.tsx (tablet and up), layout/MainLayoutHeader.tsx (the search header slot), webapp pages posts/*, popular, upvoted, discussed (layout props only), the period query state kept.',
    after: '2.1',
    whole:
      'Explore is one page with one sort; every old sort URL opens it in the right state.',
    proof:
      'FeedExploreTabs spec (hrefs) kept; new Explore page test in webapp (sort per URL, period only on Upvoted and Discussed); MainLayoutHeader spec hydration case kept at tablet; Playwright: the seven URLs open the right sort; screenshots against 4b’s Explore still.',
    size: 'L',
  },
  {
    id: '2.3',
    step: Step.Places,
    name: 'Search everywhere',
    ships:
      'ShellField: the 52px field above the cluster, compact on scroll while the bar slides away, 22/18 radius, text at body size. On Explore and /search it is a SpotlightTrigger; Spotlight opens as a full page attached to the top on the sheet transition and drags down past a third to dismiss; results are segments Posts · Squads · People · Tags on /search/posts?q= (the routes the search pages have). On Tags, Sources, Squads root, Bookmarks, History, Members and the feed settings sections it is the ?q= field (RouterPostsSearch behind it, same submit search event). Squad page and Following get the 38px top-row search button that opens the same field.',
    touches:
      'shared/components/shell/ShellField.tsx (new), spotlight/SpotlightTrigger.tsx (a field variant), spotlight/Spotlight.tsx presentation on phones, webapp RouterPostsSearch.tsx, tags/TagsDirectoryPage.tsx, BookmarkFeedLayout, history/reading.tsx, squads SquadActions (search icon to the block).',
    after: '2.2, 1.6',
    whole:
      'One search look on every list; Spotlight’s events, search_id and scope untouched.',
    proof:
      'Spotlight spec (open, scope, close event with timing) unchanged; ShellField spec (compact at p 1, focus reveals the block, ?q= round trip); Playwright: the field rides above the keyboard (visualViewport) on the simulator; screenshots against 3c.',
    size: 'L',
  },
  {
    id: '2.4',
    step: Step.Places,
    name: 'Tags, tag page, source page',
    ships:
      '/tags loses the strip and TagPageNavbar and keeps the field (2.3), Recommended as link chips and the A to Z as a chip row that jumps; /tags/[tag] and /sources/[source] become things without a cover: the 20px hero name, stats, Follow and the actions in the hero, Related as a link-chip row in the hero, the Roadmaps block as is, the name and Follow joining the block once the hero passes. The sr-only crawl links, JSON-LD, ISR and the crawlable tag links stay.',
    touches:
      'shared/components/tags/{TagsDirectoryPage,TagTopicPage,TagPageNavbar,TagDirectoryFilter}.tsx, webapp pages/sources/[source].tsx (PageInfoHeader on phones), the block’s ThingRow (name and primary action after pinAt).',
    after: '2.3',
    whole:
      'Three directories and two things on the system; every tag and source URL unchanged.',
    proof:
      'TagPage and SourcePage webapp tests (head tags diffed before and after); Playwright: the block gains the name at the measured pinAt; screenshots against 4b; a crawl check that the sr-only links and JSON-LD are still in the HTML.',
    size: 'M',
  },
  {
    id: '2.5',
    step: Step.Places,
    name: 'Squads root and the New squad form',
    ships:
      '/squads/discover under 656px is the Squads root: the name row, Your squads with the New tile first, Featured as a section, Discover with the category chips docking into the block once reached, the field (2.3). /squads/discover/my, /featured and /[category] render the same page scrolled or filtered; the directory navbar goes on phones and the always-scroll-into-view bug with it. /squads/new is the one creation route as a form leaf (Save as the check, the wizard’s steps as fields); /squads/create redirects to it on every width.',
    touches:
      'shared/components/squads/layout/SquadDirectoryLayout.tsx and useSquadDirectoryLayout.ts, webapp pages/squads/discover/*, squads/new.tsx and create.tsx (redirect), useActiveNav (Squads owns the directory).',
    after: '2.3',
    whole: 'Squads is one place with one way to create.',
    proof:
      'SquadDirectory specs; Playwright: the chips dock at the measured position and hide with the block; the redirect; screenshots against 4e’s SquadsScroll.',
    size: 'M',
  },
  {
    id: '2.6',
    step: Step.Places,
    name: 'The squad page',
    ships:
      'The cover edge to edge under the status bar with the top scrim and half-speed parallax (off under reduced motion), the block transparent over the cover then solid with the name, the segments and Join (menu just left of it); segments Posts · About with /squads/[handle]/about as About’s URL; Members · Moderators · Blocked as segments on /members; the search button in the block (2.3); one squad menu (1.7). getServerSideProps, JSON-LD, the About kept in the DOM for crawlers, the view squad page event: unchanged.',
    touches:
      'shared/features/squads/components/SquadPageLayout.tsx, header/SquadProfileHeader.tsx, SquadActions.tsx, SquadPhoneActions, webapp pages/squads/[handle]/{index,about (new),members}.tsx.',
    after: '2.4',
    whole:
      'The squad page on the cover model; every squad URL unchanged plus one new.',
    proof:
      'SquadPage webapp test (segments, Join in the block after the hero, head tags); Playwright scrub at 20px steps against 4e’s SquadScroll; simulator recording; light status text checked on three covers in both themes.',
    size: 'L',
  },
  {
    id: '2.7',
    step: Step.Places,
    name: 'The profile page',
    ships:
      'The same cover model on the profile: the block transparent then solid with the name and Follow; segments About · Posts · Replies · Upvoted on the URLs that exist (/[user], /[user]/posts, /replies, /upvoted), About the default with production’s about stack; the three standalone pages render the profile scrolled to their segment; the local Activity tabs go on phones. Canonical and ISR unchanged.',
    touches:
      'webapp components/layouts/ProfileLayout, pages/[userId]/{index,posts,replies,upvoted}.tsx, shared/components/profile/{Header,ProfileHeader}.tsx, features/profile Activity on phones.',
    after: '2.6',
    whole: 'Profile tabs have URLs; one back, one name.',
    proof:
      'ProfileIndexPage and the sub-page webapp tests; Playwright scrub against 4e’s ProfileScroll; screenshots of the four segments.',
    size: 'L',
  },
  {
    id: '2.8',
    step: Step.Places,
    name: 'Activity, Bookmarks, History, Following, the leftovers',
    ships:
      'Activity’s type chips as ShellRow chips in the block with ?type=; Bookmarks as a leaf under You with its lists as segments and the field; History with the field; Following with the search button; the DevCard sticky overlap fixed; Agents as a leaf under Explore’s row with segments Agents · Arena · Ask (behind interest_agent as today); organization settings as segments General · Members · Billing; Jobs pages as leaves; 404, error and offline inside the shell (the offline strip in the block’s top slot); the empty-state actions as 40px buttons.',
    touches:
      'webapp components/notifications/NotificationsFeed.tsx, NotificationFilterBar, BookmarkFeedLayout + BookmarkSection, history/reading.tsx, following.tsx, pages/agent/*, settings/organization/*, pages/404 and error, the empty states.',
    after: '2.3',
    whole:
      'Every remaining page is on the grammar; no route without a decision.',
    proof:
      'The page tests of each; Playwright sweep of the whole 4b list once more, before and after; the 9e states screenshots (empty, error, offline, short page).',
    size: 'M',
  },
  {
    id: '2.9',
    step: Step.Places,
    name: 'The pager',
    ships:
      'Segments follow the finger (7, 4c): once the swipe locks horizontal the next panel drags in with the thumb and springs back if abandoned, with the drag numbers of the spec (elastic 0.05, no momentum, a pixel threshold). Home’s feeds, the profile and squad segments, search results. The neighbour panel mounts on drag start and unmounts if the swipe is abandoned, so nothing fetches twice at rest.',
    touches:
      'shared/components/shell/ShellRow.tsx (a Pager around the panels), the feed pages that render segments.',
    after: '2.1, 2.7',
    whole:
      'Segments answer the thumb; without this PR a swipe still switches (2.1), it just cuts.',
    proof:
      'Pager spec (mount on drag, unmount on abandon, commit); simulator recording on Home and a profile; a performance check that a drag does not fetch the neighbour feed until commit.',
    size: 'M',
  },
  {
    id: '3.1',
    step: Step.PostAndYou,
    name: 'The post page',
    ships:
      'PostCapsule: the 52/44 accessory on useShellScroll (both bars at rest; on scroll the bar slides below the screen and the capsule takes its slot and shrinks; fully continuous, reversed on scroll up), today’s icon set, counts tabular, upvote and bookmark on the icon cross-fade, the same hooks, stable ids and origin ArticlePage. One capsule replaces MobilePostFloatingBar v1 and v2 under 656px and renders identically under both arms of post_redesign (the focus card’s inline action bar hides on phones so the actions appear once) and engagement_bar_v2 (logged-in only today, so visitors always had v1). The public post page gets the ad strip in the block’s top slot (9f), and the arbitrage page (/articles/[id]) becomes the visitor post leaf with the cluster, keeping noindex, light theme, the hard navigation out and the read_ads switch. Freeform, shared, poll and video posts: same capsule, no Read. The lightbox close becomes the header button top left with the safe-area offset it lacks today.',
    touches:
      'shared/components/post/MobilePostFloatingBar.tsx and .v2.tsx (one capsule), BasePostContent and ReadPostContent (the block in the classic arm), focus/PostFocusCard.tsx and FocusCardActionBar.tsx (the block and the hidden inline bar in the redesign arm), webapp pages/posts/[id]/index.tsx, modals/ImageModal.tsx (close), PhoneTopAdStrip consumers.',
    after: '1.4, 2.1',
    whole:
      'The post page reads as decided; the reading drawer is not here yet, Read opens the link as today.',
    proof:
      'PostPage webapp test (the stable ids mobile-upvote/downvote/comment/bookmark/copy-post-btn, events with origin ArticlePage) under both arms of both flags; Playwright scrub against 4e’s PostScroll; simulator recording; dark shots; the arbitrage page still hard-navigates.',
    size: 'L',
  },
  {
    id: '3.2',
    step: Step.PostAndYou,
    name: 'The toast on phones',
    ships:
      'Under 656px the toast sits 12px above whatever owns the bottom (the cluster, the capsule, the app footer), inside the 20px inset, one at a time; in 300ms with opacity, 8px and blur, out 150ms with opacity and blur. Production’s 5s timer, Undo action, close with the countdown ring and reduced-motion fade stay; the timer now pauses under a finger; the dismiss on scroll for touch stays. Desktop keeps its top toast.',
    touches:
      'shared/components/notifications/Toast.tsx + Toast.module.css (the phone position and motion), hooks/useToastNotification.ts (the pause), MainLayout’s Toast slot reading --shell-bottom.',
    after: '1.1',
    whole: 'Every toast lands in the same place, above the bar.',
    proof:
      'Toast spec (timer pause, close, one at a time); Playwright: the toast’s bottom equals the cluster’s top plus 12 on Home and on a post; simulator recording of Undo.',
    size: 'S',
  },
  {
    id: '3.3',
    step: Step.PostAndYou,
    name: 'Comment and edit in the composer',
    ships:
      'Comment on the post page already opens a full-screen Drawer under 1020px (CommentInput); on phones that drawer takes the composer’s form: the post as a compact card, the field, the toolbar, Post, entering on the sheet transition. The same requestOpenComment path, the same OpenComment event and comment-input test id. Editing a post on a phone opens SmartComposerModal prefilled with Post reading Save (the path the three-dot Edit already uses); /posts/[id]/edit renders it on phones and keeps the legacy write page above 656px. The composer itself (a full-screen Drawer below laptop) gets the sheet transition from 1.6 for free.',
    touches:
      'shared/components/comments/CommentInput.tsx and post/NewComment.tsx (the phone form), modals/post/SmartComposerModal.tsx (edit prefill from a route), webapp pages/posts/[id]/edit.tsx.',
    after: '3.1, 1.6',
    whole: 'One composer for writing, commenting and editing.',
    proof:
      'SmartComposerModal spec (modes, submit events unchanged: OpenSmartComposer, SubmitSmartComposer), PostPage comment test; Playwright: comment round trip on the simulator with the keyboard.',
    size: 'M',
  },
  {
    id: '3.4',
    step: Step.PostAndYou,
    name: 'The streak sheet',
    ships:
      'The streak opens the layout v2 streak panel one to one as a full-height sheet: big count with the fire, gear, longest and total, Today with the timezone, the 30-day calendar, the freeze row, Daily quests. The quest button next to the streak opens the same sheet (4b fix 26). The tier ladder and the milestone popup from the Milestone rewards initiative join only once that initiative’s data is in production; until then the sheet ships without the ladder and NewStreakModal stays as it is.',
    touches:
      'shared/components/streak/ReadingStreakButton.tsx (its phone Drawer keeps the OpenStreaks event and shows StreakQuestsSection’s content instead of ReadingStreakPopup), popup/ReadingStreakPopup.tsx (tablet and laptop keep it), sidebar/sections/StreakQuestsSection.tsx reused outside the v2 sidebar, QuestHeaderButton.',
    after: '1.6, 1.3',
    whole: 'One streak surface on phones, production’s streak language.',
    proof:
      'ReadingStreakPopup spec kept at tablet; a new sheet spec (OpenStreaks event, calendar states: read, today, freeze, untouched); screenshots against 9d in both themes.',
    size: 'M',
  },
  {
    id: '3.5',
    step: Step.PostAndYou,
    name: 'Settings as pages',
    ships:
      '/settings under 656px is a list page of plain leaves (the sections of ProfileSettingsMenuMobile as rows); each section is a leaf with back and its name; Notifications · Email and Sources · Squads · Users · Tags as segments with the tab= query; organization settings on the same grammar; Feed settings and Squad Manage follow the list to page pattern. The left NavDrawer retires on phones (4b fix 17, 18; 4c fix 14).',
    touches:
      'webapp components/layouts/SettingsLayout/{index,AccountPageContainer}.tsx, ProfileSettingsMenuMobile (desktop menu kept), pages/settings/*, the settings TabContainers (notifications, security) on ShellRow, feed settings sections, squad manage pages.',
    after: '2.1, 1.4',
    whole: 'Settings is pages; every settings URL opens its leaf.',
    proof:
      'SettingsFeedbackPage and the settings webapp tests; Playwright: every settings menu label equals its page title; screenshots against 9d’s SettingsListScroll.',
    size: 'L',
  },
  {
    id: '3.6',
    step: Step.PostAndYou,
    name: 'Forms',
    ships:
      'Every form is a leaf: Save as the 38px check top right, dimmed until something changed, saving toasts and goes back; list pages (work experience, education, certifications, projects, custom feeds, blocked content) add with a plus top right; back with unsaved changes asks once in a sheet (Keep editing, Discard last and red); destructive actions last and red; fields at 48px with the label above; no second Save at the bottom.',
    touches:
      'webapp SettingsLayout/Profile (Save gated on useDirtyForm’s isDirty, which exists and is not wired to the button), pages/settings/profile/experience/*, feeds/new and [slug]/edit, blocked content, the existing DirtyFormModal as the discard sheet (it is isDrawerOnMobile already), the block’s action slot.',
    after: '3.5, 1.6',
    whole: 'Every form saves the same way.',
    proof:
      'Form specs (dirty state, discard sheet, save toast); Playwright: back with unsaved changes asks once, system back too; screenshots against 9d’s form stills.',
    size: 'M',
  },
  {
    id: '3.7',
    step: Step.PostAndYou,
    name: 'Bottom prompts',
    ships:
      'The consent banner as the sheet (the iubenda embed styled as one, accept, reject and choose at one level, covering the cluster, first on the first page); the app footer and the See daily.dev in… sheet as merged; one owner of the bottom at a time, one sheet at a time, consent first, the toast following the owner; nothing of this inside the wrappers.',
    touches:
      'webapp styles iubenda.css, shared features/getApp (MobileAppFooter, MobileAppSheet) ordering with the cluster, Toast’s owner variable.',
    after: '3.2',
    whole: 'The bottom has one owner on every page.',
    proof:
      'MobileAppSheet, MobileAppFooterContext specs; Playwright in an EU locale: consent sheet first, footer after; screenshots against 9h.',
    size: 'S',
  },
  {
    id: '3.8',
    step: Step.PostAndYou,
    name: 'Landscape',
    ships:
      'A phone turned sideways keeps the shell laid out for landscape (9g look 1): the cluster compact and centred at portrait width inside the safe areas, the block one line, content at reading width, sheets from the side; video and the lightbox own landscape.',
    touches:
      'shell.css orientation rules, ShellCluster and ShellBlock layout classes.',
    after: '3.1',
    whole: 'No page breaks sideways.',
    proof:
      'Playwright at 812×375 and 844×390 on the 21 page types; simulator rotated.',
    size: 'S',
  },
  {
    id: '3.9',
    step: Step.PostAndYou,
    name: 'Push and pop',
    ships:
      'Feature-detected View Transitions on the webapp router: a leaf slides in from the right in 300ms on the travel curve and out on back; a root change cross-fades in 150ms; reduced motion cuts. The fallback is today’s cut; no layout depends on it.',
    touches:
      'webapp _app.tsx route change hooks, shell.css view-transition names on the page root.',
    after: '1.4',
    whole: 'Navigation has direction; nothing else changes.',
    proof:
      'Scroll restoration spec unchanged (the transition must not fight the restore); simulator recording; a run with reduced motion on.',
    size: 'M',
  },
  {
    id: '4.1',
    step: Step.Reading,
    name: 'The reading drawer, web side',
    ships:
      'The post page sinks into a bottom drawer while the article opens behind it: four heights (bar, card, post, full), the PostCapsule as its bar at rest size, the title line folding with the page scroll on transform and opacity, comments in the pulled-up post, back popping the page’s history first. The web layer renders the drawer and calls the wrapper’s openArticle at tap time; without the bridge, Read keeps opening a new tab. Reload in the page menu, Share once, reads counted as the Read button counts them; Open links in the app under Settings, General (a client-side setting flag).',
    touches:
      'shared/components/shell/ReadingDrawer.tsx (new), the post page Read handler, lib/ios.ts (openArticle, article state messages), settings General.',
    after: '3.1, 3.3, and the iOS reading screen in the wrapper',
    whole:
      'On the mobile web nothing changes; in a wrapper with the screen, Read opens the article over the folded post.',
    proof:
      'Drawer spec with a fake bridge (the four heights, fold, back order); PostPage test: without the bridge Read is a link; simulator only through the wrapper build (the mobile engineers’ TestFlight).',
    size: 'L',
  },
  {
    id: '4.2',
    step: Step.Reading,
    name: 'Bridge behaviours: haptics, refresh, status bar, transparency, back',
    ships:
      'The web side of chapter 8: one light impact on a tab change, an upvote, a bookmark and a streak increment (bridge on iOS, navigator.vibrate on Android); pull to refresh as a bridge message the wrapper sends instead of reloading the page, refetching the active query; the status-bar style posted when a cover page mounts; the reduced-transparency flag turning the material solid; the overlay-aware back contract (a sheet, Spotlight or the composer closes before history pops) for Android’s system back.',
    touches:
      'lib/ios.ts handlers, an Android bridge module (new), ShellCluster and the vote and bookmark hooks (the impact), the feed refetch, ShellBlock cover pages, shell.css solid material.',
    after: '4.1 and the wrapper releases',
    whole: 'Each behaviour is silent until its wrapper sends the message.',
    proof:
      'Fake handler specs for every message; the iOS and Android builds from the mobile engineers; universal links and App Links still land.',
    size: 'M',
  },
];

// Which PRs carry each chapter, so nothing decided is left out.
export const coverage: [string, string][] = [
  ['3 · Tab bar', '1.1 (bar, Create, badge, lit root), 1.5 (visitor sign-up)'],
  [
    '3b · Floating chrome',
    '0 (motion tokens), 1.1 (cluster, shrink, Material Create), 1.4 (top buttons), 2.3 (field)',
  ],
  ['3c · Search', '2.3'],
  ['3d · Create', '1.1 (opens the composer), 3.3 (comment and edit modes)'],
  [
    '4 · Header',
    '1.3 (brand rows, visitors), 1.4 (leaf block), 2.6 and 2.7 (covers), 9k in 1.3',
  ],
  [
    '4b · Every page',
    '0 (fixes 3, 4, 5, 12, 21, 25), 1.3 and 2.2 (10), 1.4 (14, 15, 16), 1.5 (22, as the sign-up page), 1.6 (19, 20), 1.7 (1, 2, 6, 7, 8, 9, 23), 2.1 (27), 2.8 (11), 3.3 (24, as the composer form), 3.4 (26), 3.5 (13, 17, 18)',
  ],
  [
    '4c · Tabs everywhere',
    '2.1 (fixes 1 to 4, 8), 2.4 (5, 6), 2.2 (7, 15), 2.6 (9), 2.7 (10), 2.8 (11, 12, 13), 3.5 (14)',
  ],
  ['4d · Page titles', '1.3 (root names), 1.4 (leaf names), 2.4 (hero names)'],
  [
    '4e · Scroll behaviour',
    '1.1 (useShellScroll, the shrink), 1.3 (roots), 1.4 (pages), 2.5 (docking chips), 2.6 and 2.7 (things), 3.1 (post)',
  ],
  [
    '5 · Navigation model',
    '1.1 (lit root, re-tap), 1.4 (goBack), 2.1 (segments replace), 2.5 (the one creation route), 4.1 (back inside the page)',
  ],
  ['6 · Post page', '3.1, 3.2 (toast), 3.3 (comment)'],
  ['6b · Reading the link', '4.1, 4.2'],
  [
    '7 · Gestures and feel',
    '0 (swipe, press), 1.6 (sheets), 2.1 (pager segments), 3.9 (push and pop), 4.2 (haptics, refresh)',
  ],
  ['8 · Native wrappers', '4.1, 4.2, the wrapper brief below'],
  [
    '9b, 9c, 9d',
    '1.2 (You), 1.3 (avatar right), 3.4 (streak), 3.5 and 3.6 (settings, forms)',
  ],
  [
    '9e · Last pass',
    '1.5 (sign-up), 2.5 (New squad), 2.8 (Agents, org settings, Jobs, 404, offline, empties, badges), 3.1 (lightbox, posts without a link), 3.3 (post edit)',
  ],
  [
    '9f · Ads',
    '1.4 (auth banner leaves the top), 3.1 (the strip in the top slot)',
  ],
  ['9g · Landscape', '3.8'],
  [
    '9h · Bottom prompts',
    '1.1 (footer replaces the cluster), 3.2 (toast owner), 3.7 (consent sheet)',
  ],
  [
    '9j · Keep it working',
    'The proof column of every PR; the footer events in 0 and 1.1; the flags in 3.1',
  ],
  ['9k · Plus on Home', '1.2 (You row states), 1.3 (the square)'],
  [
    '9l · Feel',
    '0 (press, curves, durations, reduced motion), 1.4 (hit areas), 1.6 (sheet motion and drag), 2.1 (chip hit areas), 3.1 (tabular, cross-fade), 3.2 (toast), 2.6 (parallax off under reduced motion), 2.8 (40px empty-state action)',
  ],
];

// The rules and guidelines the chapters set that this plan adjusts, and
// why. Everything not listed still holds as written.
export interface Adjustment {
  rule: string;
  where: string;
  now: string;
  why: string;
}

export const adjustments: Adjustment[] = [
  {
    rule: 'Step 1 ships as one PR train that merges the same day',
    where: '9i, question 3',
    now: 'Step 1 is eight PRs, each whole on its own; a member may see the new bar with today’s header for a few days.',
    why: 'Tsahi’s ask (1 Oct): review, merge and QA per PR. A train cannot be QA’d between its cars. The mixed state is safe because each piece is complete: the new bar links to every old destination, the old header still works above it.',
  },
  {
    rule: 'No rewrite: change the layout of the pieces that exist',
    where: '9j, scope rules',
    now: 'Under 656px the old phone chrome is replaced by the shell components; the old pieces stay for tablet, laptop and the extension. The logic behind them (hooks, events, routes) is reused, the markup is not.',
    why: 'The inventory found no global phone header to change: FeedNav renders on Home only, every other page draws its own bar or none. Reshaping twelve different bars is more code than one block.',
  },
  {
    rule: 'Phone means below 656px',
    where: '4b, 9e (the shell below production’s tablet breakpoint)',
    now: 'Holds, with a name: every shell gate is ViewSize.MobileL (which this codebase maps to the tablet query), never the mobileL Tailwind class (420px).',
    why: 'The two names disagree in the code; a developer who reaches for mobileL: builds a 420px shell.',
  },
  {
    rule: 'Happening now lives at /happening-now; Explore at /explore?sort=; old routes redirect',
    where: '5, route table',
    now: 'No route moves. Happening now stays at /highlights with ?channel=; Explore is /posts and its sort menu moves between /posts, /posts/upvoted, /posts/discussed, /posts/latest and /posts/best-of; /popular, /upvoted, /discussed render the Explore page in the matching state. Squads’ root is /squads/discover (/squads already redirects there permanently).',
    why: 'Every one of these pages is ISR or SSR with head tags, and served to desktop from the same URL. A phone-only redirect cannot exist on the server, and a rename costs canonical, universal links and cached redirects for nothing a member sees.',
  },
  {
    rule: 'Pull to refresh on every feed root, web layer',
    where: '7',
    now: 'Moves to step 4 as a bridge message: the wrapper stops reloading the page and asks the web layer to refetch.',
    why: 'Android Chrome already refreshes on pull, and a second web gesture would double it; iOS Safari users do not expect one; the iOS wrapper owns the gesture today. The only place a web gesture helps is the wrapper, which is where the fix belongs.',
  },
  {
    rule: 'Re-tap the active tab: pop to root, scroll to top, then refresh',
    where: '7',
    now: 'Chapter 5’s later rule: scroll to top; a second re-tap returns to the first segment. No refresh.',
    why: 'Two chapters disagreed; the later decision wins.',
  },
  {
    rule: 'Press scale 0.92; header collapse 200ms; the 420ms sheet',
    where: '7, 3c, 4b mocks',
    now: 'The 9l values: 0.96; 140 scrub and 220 snap; 300 in and 200 out. Applied as recommended in 9l unless Tsahi picks otherwise; only spec.ts changes if he does.',
    why: 'One spec file; 9l is the review of these numbers.',
  },
  {
    rule: 'The tier ladder and the milestone popup inside the streak sheet',
    where: '9d',
    now: 'The sheet ships from the layout v2 panel that exists; the ladder and the popup join when the Milestone rewards initiative lands its data.',
    why: 'Nothing of the ladder is in production; the streak sheet cannot wait on another initiative.',
  },
  {
    rule: 'Inputs at 16px or more (9l call 7)',
    where: '9l',
    now: 'A mock correction only: production fields are already typo-body (17px). The rule stays as a guard in spec.ts.',
    why: 'Checked in fields/common.ts and Spotlight.',
  },
  {
    rule: 'Comment opens the full-page composer (6, 3d)',
    where: '6, 3d, 9d',
    now: 'Holds, and it is smaller than it sounds: CommentInput already opens a full-screen Drawer under 1020px. 3.3 gives that drawer the composer’s form; it does not route comments through SmartComposerModal.',
    why: 'Same event (OpenComment), same test id, no second comment path.',
  },
  {
    rule: 'Menus become sheets by swapping the container',
    where: '4b, 9j',
    now: 'Holds, with one more reason: DropdownMenu closes on any window scroll today, which the collapsing address bar fires on phones.',
    why: 'Found in the inventory; the sheet renderer removes the bug with the swap.',
  },
  {
    rule: '404 and error inside the shell (9e)',
    where: '9e',
    now: 'Holds; note that /404, /verification and /reset-password render with no layout at all today. 404 and error get the footer layout in 2.8; verification and reset-password stay bare (no-shell class).',
    why: 'The no-shell class was decided for flows; 404 is a page.',
  },
  {
    rule: 'The bar at first paint (chapter 7) versus the pre-hydration paint of ISR pages',
    where: '7, 9j',
    now: 'The cluster and the block are in the server HTML under tablet:hidden; scroll behaviour and the badge attach after hydration.',
    why: 'MainLayout paints prerendered content before boot on purpose; a JavaScript-only shell would pop in after it. CSS presence gives both.',
  },
  {
    rule: 'Phase numbers on the 4b and 4c fix lists',
    where: '4b, 4c',
    now: 'Each fix carries the PR that closes it (the coverage table above).',
    why: 'The round 4 phases are archived.',
  },
];

// The proof every PR carries, in order. Nothing here is new tooling beyond
// one sweep script that lives beside the Playwright tests.
export const verification: [string, string, string][] = [
  [
    '1 · Unit',
    'pnpm --filter @dailydotdev/shared test and pnpm --filter webapp test, the touched specs first, the full suites before opening. Tests render as a phone by default here (matchMedia never matches); desktop cases use mockDesktop() from the media helper.',
    'CI: test_shared, test_webapp',
  ],
  [
    '2 · Types and lint',
    'node scripts/typecheck-strict-changed.js; pnpm --filter webapp typecheck (the full tsc is not in CI, Vercel is the backstop); the two lint scripts.',
    'CI: typecheck_strict_changed, lint jobs',
  ],
  [
    '3 · Extension',
    'pnpm --filter extension build on every PR that touches a shared component the extension renders (MainLayout, MainLayoutHeader, FeedNav, Drawer, DropdownMenu, TabContainer, SpotlightHost).',
    'CI: build_extension',
  ],
  [
    '4 · Phone sweep',
    'A Playwright script (packages/playwright/scripts/phone-sweep.mjs, lands with 1.1) that opens the 21 page types of 4b at 390×844 (WebKit) and 393×851 (Chromium), logged out and as the fake member through the local API proxy, and writes screenshots plus a check for console errors and horizontal overflow. Run before and after; the after set is compared against the chapter’s mock by eye.',
    'Local, attached to the PR',
  ],
  [
    '5 · Desktop unchanged',
    'The same script at 1280px on the same pages; the two sets must be pixel-identical except where the PR says otherwise.',
    'Local, attached to the PR',
  ],
  [
    '6 · Simulator',
    'Safari on the iPhone 17 Pro simulator at the local server, for anything that scrolls, drags, folds or rides the keyboard; recorded with simctl recordVideo and attached. iPad Air for the desktop layout at 768.',
    'Local, for PRs that move',
  ],
  [
    '7 · Storybook',
    'A story per new shell component in stories/mobile-shell/ (production imports, MSW), in both themes and at 360, 390 and 393px, so the piece can be reviewed alone.',
    'Manual',
  ],
  [
    '8 · Preview',
    'The branch preview on Tsahi’s phone, logged in; the e2e workflow dispatched against the preview URL once per step (Mobile Chrome and Mobile Safari projects).',
    'gh workflow run e2e-tests.yml -f base_url=…',
  ],
  [
    '9 · Events',
    'The log stream on the preview: every event in 9j’s table fires from its new place with the same name, target and origin; the two additions appear.',
    'Manual, per step',
  ],
];

// Handoff item 4: how each step lands on the flags that already gate these
// surfaces. None is added, none removed.
export const flagArms: [string, string, string][] = [
  [
    'feed_chips (none | v2 | v3, default v3)',
    'Decides the Home row today: chips (v2, v3) or the legacy TabContainer (none).',
    'Under 656px the ShellRow renders the segments for every arm; the arm still decides the tag-chip seeding through useFeeds, which is not a UI concern. Tablet keeps the arm’s rendering.',
  ],
  [
    'post_redesign (default false)',
    'Picks the post layout.',
    'The block and the capsule are built on the control layout and rendered on both; the PostPage test runs under both arms until product retires the flag.',
  ],
  [
    'engagement_bar_v2 (default false, logged in)',
    'Picks the post action bar.',
    'PostCapsule replaces both bars under 656px with one component; the flag keeps selecting the desktop and tablet bar.',
  ],
  [
    'plus_entry_mobile (default false)',
    'Adds the Plus banner under the For you row.',
    'The banner keeps its slot under the ShellRow; the Plus square (9k) does not depend on it.',
  ],
  [
    'interest_agent (default false)',
    'Adds Agents to the strip and the notification categories.',
    'Agents is an Explore row and a leaf behind the same flag.',
  ],
  [
    'layout_v2_2 (laptop only)',
    'The v2 desktop layout.',
    'Never true under 656px; untouched.',
  ],
  [
    'mobile_app_footer, mobile_app_sheet (logged-out, phone browsers)',
    'The Charm footer and the See daily.dev in… sheet.',
    'Keep their triggers; the footer replaces the cluster when it shows (9h).',
  ],
  [
    'show_roadmap (default true), brief_ui, jobs_ui',
    'Blocks and areas on tag pages, bookmarks and jobs.',
    'Content inside the shell; untouched.',
  ],
];

// Handoff item 6: the route table, as it lands.
export const routes: [string, string, string][] = [
  [
    'Home segments',
    '/ (For you, or /my-feed when a custom default exists), /highlights (Happening now, ?channel=), /following, /feeds/[slug]',
    'Unchanged. Happening now keeps /highlights; the channel is a query.',
  ],
  [
    'Explore and its sort',
    '/posts, /posts/upvoted, /posts/discussed, /posts/latest, /posts/best-of, /posts/best-of/[year]/[month]; /popular, /upvoted, /discussed',
    'Unchanged. On phones all render the Explore page in the matching state; the period stays in the query state it has.',
  ],
  [
    'Search',
    '/search (rewritten to /search/posts) ?q=; results types on the search routes',
    'Unchanged. Scope stays in Spotlight’s context, not the URL.',
  ],
  [
    'Squads root',
    '/squads/discover (root), /squads/discover/my, /featured, /[category]',
    'Unchanged. /squads keeps its permanent redirect to /squads/discover.',
  ],
  [
    'Squad page',
    '/squads/[handle], /squads/[handle]/about (new), /members, /manage/*, /edit, /moderate, /pending, /analytics',
    'One new route for About; the rest unchanged.',
  ],
  [
    'Creating a squad',
    '/squads/new',
    '/squads/create redirects to it on every width (the one redirect in this work).',
  ],
  [
    'Profile',
    '/[user], /[user]/posts, /replies, /upvoted, /achievements and the experience sub-pages',
    'Unchanged; the three activity pages render the profile at their segment on phones.',
  ],
  [
    'You',
    '/you (new), then /bookmarks, /bookmarks/later, /bookmarks/[folder], /history, /following, /feeds/*, /settings/*, /wallet, /game-center',
    'One new route; every row is an existing page.',
  ],
  [
    'Post',
    '/posts/[id], /posts/[id]/edit (opens the composer), /posts/[id]/share, /articles/[id]',
    'Unchanged.',
  ],
  [
    'Tags and sources',
    '/tags, /tags/[tag], /sources, /sources/[source], /users',
    'Unchanged.',
  ],
  [
    'No shell',
    '/onboarding*, /welcome, /join*, /activate, /verification, /reset-password, /callback, /oauth/*, /popup/*, /plus*, /pay, /cores/payment, /squads/[handle]/[token], the jobs steps',
    'Unchanged; these pages never opted into the footer, so they never get the cluster.',
  ],
];

// Handoff item 7: the wrapper brief, from 6b, 8 and the covers. Nothing
// before step 4 (9j).
export const wrapperBrief: [string, string, string][] = [
  [
    'Reading screen (iOS)',
    'A UIViewController with a WKWebView for the article, a native top bar (close, domain and lock, share, menu with Reload and Open in Safari) and a native bottom sheet with four detents whose content above the action row is the post page in a second web view.',
    'Gate for 4.1. The bridge: openArticle(url, postId); article state (title, source, counts, voted, bookmarked) to the sheet; upvote, downvote, comment, bookmark, share, copyLink, openExternal, readingTime back. Universal links inside the page are handed back to the web layer.',
  ],
  [
    'Reading screen (Android)',
    'A WebView with a BottomSheetBehavior drawer, the same contract. A Custom Tab cannot expand into the post.',
    'Gate for 4.1 on Android; needs the Android inspection first (nothing of the project has been read).',
  ],
  [
    'Haptics',
    'One handler, haptic(style), calling UIImpactFeedbackGenerator; Android uses navigator.vibrate(10) with no bridge.',
    '4.2',
  ],
  [
    'Refresh',
    'The native pull control stops reloading the document and posts refresh; the web layer refetches the active query and reports done.',
    '4.2; until then the wrapper keeps its reload.',
  ],
  [
    'Status bar style',
    'A statusBar(style) message: light when a cover page mounts, default when the block turns solid and on route change. View-controller-based appearance on iOS; isAppearanceLightStatusBars on Android.',
    '4.2; covers ship in 2.6 with the scrim keeping default status text legible until then.',
  ],
  [
    'Edge to edge',
    'Already true on iOS (contentInsetAdjustmentBehavior never, viewport-fit=cover). Android: target SDK 35 or enable edge to edge; below WebView 140 env(safe-area-inset) is wrong, so the wrapper injects the insets as CSS variables.',
    'Before 2.6 lands on Android, or covers get the safe-area padding there.',
  ],
  [
    'Reduced transparency',
    'A boolean injected with the platform class when the OS setting is on; the material turns solid.',
    '4.2',
  ],
  [
    'Back contract (Android)',
    'OnBackPressedCallback wired to canGoBack(); the web layer answers a back message first (a sheet, Spotlight or the composer closes) and reports whether it consumed it; at a root, back leaves the app.',
    'Before step 4 on Android; iOS keeps the edge swipe.',
  ],
  [
    'Universal links and App Links',
    'Unchanged: /* except helloworld, callback and cores; assetlinks.json.',
    'Checked in 4.1 and 4.2.',
  ],
];

// Handoff item 8: the shared components the shell changes and what proves
// desktop and the extension did not move.
export const desktopNote: [string, string, string][] = [
  [
    'Drawer',
    'Becomes the sheet (motion, drag, inert) for every consumer.',
    'Drawer.spec at both widths; the 15 consumers’ specs; desktop uses Drawer rarely (filters, the app sheet), checked in the desktop sweep.',
  ],
  [
    'DropdownMenu',
    'Gains a touch renderer under 656px.',
    'The Radix path is untouched above 656px; DropdownMenu spec under mockDesktop(); the extension build.',
  ],
  [
    'TabContainer',
    'Swipe axis lock (0.1); on phones replaced by ShellRow where it drew a row.',
    'TabContainer spec; settings and highlights pages at tablet.',
  ],
  [
    'useActiveNav',
    'The owning root lights (Squads on a squad page, Home on a post).',
    'useActiveNav spec; FeedNav and SidebarTablet still read it: desktop sweep.',
  ],
  [
    'MainLayout, MainLayoutHeader, FeedNav',
    'Below 656px they render the shell; tablet, laptop and the extension new tab render what they render today.',
    'MainLayoutHeader.spec and FeedNav.spec kept for tablet; the extension build; the extension new tab at 800px opened once per step.',
  ],
  [
    'Toast',
    'Bottom-anchored under 656px.',
    'Toast spec at both widths; the desktop top toast unchanged.',
  ],
  [
    'ProfilePicture consumers',
    'People square everywhere.',
    'Visible on desktop too by design (the decision says all).',
  ],
  [
    'Card title and summary components',
    'text-wrap balance and pretty (0.4).',
    'Visible on desktop too by design (9l: in the components, not per page); the desktop sweep shows only line breaks moving.',
  ],
];

// The first PR, written out, so the execution can start on a yes.
export const firstPr: [string, string][] = [
  [
    'Branch and base',
    'claude/mobile-shell-0-fixes from main; opened 1 Oct 2026 with the four fixes together (Tsahi’s call).',
  ],
  [
    'Change',
    'TabContainer.tsx: replace the react-swipeable onSwipedLeft/Right pair with onTouchStartOrOnMouseDown, onSwiping and onSwiped handlers that lock the axis after 10px (ignore the gesture when |dy| ≥ |dx| at that point), commit on |dx| > 56 and |dx| > 2|dy| or on velocity > 0.3px/ms with |dx| > 32, and add touch-action: pan-y to the content div. Same navigateTab, same shallow push.',
  ],
  [
    'Tests',
    'TabContainer.spec.tsx: a vertical drag with 45px of horizontal drift changes nothing; a horizontal drag of 60px inside the cone navigates; a slow 40px horizontal drag does nothing; a fast 35px flick navigates.',
  ],
  [
    'Proof',
    'Unit and strict typecheck; simulator: /highlights scrolled at an angle ten times; a recording attached to the PR.',
  ],
  [
    'Out of scope',
    'The pager (content following the finger) comes with ShellRow in 2.1; Highlights keeps TabContainer until then. The other three fixes ride in the same PR; see PR 0 in the walker.',
  ],
];

// Where each PR stands against main, kept by hand after every merge or
// review round. `landed` is what is on a branch or on main, `left` is the
// part of the PR's `ships` that is still open.
export type PrStatus = 'shipped' | 'partial' | 'open';

export interface PrProgress {
  status: PrStatus;
  landed?: string;
  left?: string;
}

export const progress: Record<string, PrProgress> = {
  '0': {
    status: 'shipped',
    landed:
      'Merged to main on 2 Oct as 3dbcda8fd (#6765) after Chris\u2019s review: the four fixes, the swipe cone on both paths, the stamped swipe specs, pinch zoom kept, the footer tabs\u2019 own analytics target.',
  },
  '1.1': {
    status: 'shipped',
    landed:
      '#6767: the cluster, the shrink, the lit root by URL, the Create square, the visitor sign-up, the Activity bubble at full colour on an unlit tab, the selected-tab pill that follows a held finger along the bar and the bar\u2019s lift to 1.04 under a finger; the bar owns its touches so the drag works in iOS Safari too; the lit tab returns to the root, scrolls to the top or refreshes; the bar leaves on settings and forms; member-only squares hidden from visitors; the bar publishes --shell-bottom and the footer spacer reads it.',
  },
  '1.2': {
    status: 'shipped',
    landed:
      '#6767: /you as one standalone page behind the avatar (a slide-aside menu was tried on 2 Oct and reverted the same day): name row with Following and Followers, Reputation and Cores as two small pills, then Profile, Plus, Feed settings, Bookmarks, History, Analytics, Game center, DevCard, Invite friends, Settings; Help as the top action opening a sheet with the desktop Support menu (feedback form, bug report, Docs, Changelog, the app link in phone browsers, the legal pair); the gear left the Home row.',
  },
  '1.3': {
    status: 'shipped',
    landed:
      '#6767: the block on the four roots, hide and return, streak and quests, the Plus square, the Activity settings square, New Squad as a plus square on Squads; the offline strip at the top of the block; once the block is hidden the status area turns from a solid frame into a soft scroll edge (blur and fade).',
  },
  '1.4': {
    status: 'shipped',
    landed:
      '#6767: the page row on every leaf; a third pass walked 110 routes and moved the last in-page header rows into the block; the block\u2019s remaining Float buttons (profile menu, squad search and menu, Bookmarks sort and share) are the 38px squares; the post edit form puts its title and Post in the block.',
  },
  '1.5': {
    status: 'shipped',
    landed: '#6767: the X top left and the context line under the title.',
  },
  '1.6': {
    status: 'shipped',
    landed:
      '#6767: Drawer is the sheet (timings, grabber, drag to dismiss, Escape, focus trap and return, overscroll contained, root portal); the bottom Close buttons are gone from sheets; Report, Add to custom feed, Move bookmark, Bookmark folder and Bookmarks sharing open as sheets; the page behind an open sheet is inert (aria-hidden\u2019s inertOthers, so a sheet opened from a sheet keeps both live).',
    left: 'The Report squad modal stays centred until its file clears the strict backlog.',
  },
  '1.7': {
    status: 'shipped',
    landed:
      '#6767: every DropdownMenu is a bottom sheet on phones; the post menu is grouped and capped (Share, Read it later, Follow the source, Not interested, Report; then the owner rows with Delete in the error colour; then More), Not interested and More are sub-levels of the same sheet with the back chevron in the title row; one squad menu for the page and the card (Share and Notifications rows added, the card-only menu deleted); copy link lives inside Share on tag and source pages; the profile\u2019s actions once; the DropdownMenu spec renders the same items and actions at both widths; the menu sheet carries the Drawer\u2019s scrim.',
    left: 'Fix 9 (brief posts\u2019 copy link through the Share sheet) rides on the Share sheet work in 2.A.',
  },
  '1.8': {
    status: 'shipped',
    landed:
      '#6767: referral slots, embedded tweets, profile metadata, the feedback widget; the header avatar square; the comment, member and composer pictures already took ProfilePicture\u2019s radius, confirmed by a sweep for circle classes on people; a second sweep squared the last four: Spotlight people rows, the linked profile on the job form, the count in a people stack and the claimed-by chip on a tool page.',
  },
  '2.1': {
    status: 'shipped',
    landed:
      '#6767: the ShellRow family and the Home row; the channel sheet behind the chevron.',
    left: 'The axis-locked swipe that moves segments lands with the pager (2.9).',
  },
  '2.2': {
    status: 'partial',
    landed:
      '#6767: the Explore row (field and places), Popular ▾ as the sort menu, the 40px band gone.',
    left: 'The places as rows (Popular, Discussions, Agents) and the hub layout of 4b; the field floating above the cluster (2.3).',
  },
  '2.3': {
    status: 'partial',
    landed:
      '#6767: search results as a page (back, the query, a Filters square, the field in the row).',
    left: 'ShellField above the cluster, compact on scroll; Spotlight as a page on phones; one search look on every list.',
  },
  '2.4': {
    status: 'partial',
    landed:
      '#6767: Tags, Sources (Suggest new source as a plus square) and Leaderboard titles; navbars and breadcrumbs gone; #tag as the explore tag title.',
    left: 'Tag and source heroes: the name and Follow once, Back · Menu, copy link only inside Share; the covers.',
  },
  '2.5': {
    status: 'partial',
    landed:
      '#6767: the category chips, New Squad as a plus square, the New squad form in the block (Create Squad as the action, the back square for Cancel).',
    left: 'One hub with Your squads first, then Discover by category.',
  },
  '2.6': {
    status: 'partial',
    landed:
      '#6767: Search and the menu in the block; the hero keeps the link and Join.',
    left: 'The cover model, segments Posts · About, Members segments, one squad menu.',
  },
  '2.7': {
    status: 'partial',
    landed: '#6767: the menu in the block; Follow and Award once in the hero.',
    left: 'Segments About · Posts · Replies · Upvoted, the cover, the own profile actions moving to You.',
  },
  '2.8': {
    status: 'partial',
    landed:
      '#6767: Activity type chips, Bookmarks title with segments and Sort, Share and the folder menu, History title, Following as a Home segment; Jobs, the wallet, the briefings, squad moderation, post analytics, Gear and the archives in the block.',
    left: 'The leftovers of 4b: empty-state actions, the bookmarks search placement.',
  },
};

export const statusOf = (id: string): PrProgress =>
  progress[id] ?? { status: 'open' };

// What is left of step 2 after the shell PR absorbed its header and row
// halves, re-cut by the thing it changes rather than by place.
export const recut: {
  id: string;
  name: string;
  from: string;
  ships: string;
}[] = [
  {
    id: '2.A',
    name: 'Menus, finished',
    from: '1.7 (second half), the Share flow from 3.x',
    ships:
      'PostOptionButton grouped and capped at seven rows; Not interested and More as sub-sheets with the back chevron in the title row; one Share sheet with copy link inside it; the three Float buttons in the block become 38px squares.',
  },
  {
    id: '2.B',
    name: 'Search everywhere',
    from: '2.3',
    ships:
      'ShellField above the cluster, compact on scroll; Spotlight as a page on phones; the field on Tags, Bookmarks, History and the squad.',
  },
  {
    id: '2.C',
    name: 'Heroes and covers on things',
    from: '2.4, 2.6, 2.7',
    ships:
      'Tag, source, squad and profile on the cover model: the block transparent over the cover then solid with the name; Follow once in the hero; Back · Menu; the segments each page decided.',
  },
  {
    id: '2.D',
    name: 'The hubs',
    from: '2.2, 2.5',
    ships:
      'Explore with the places as rows then the feed; the Squads hub with Your squads first, then Discover by category.',
  },
  {
    id: '2.E',
    name: 'The pager',
    from: '2.9',
    ships:
      'The axis-locked swipe that moves segments with the thumb, on Home and on every page with segments.',
  },
];
