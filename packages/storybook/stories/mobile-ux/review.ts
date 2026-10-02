// The pre-development review (2026-09-30, second pass 2026-10-01): every chapter, decision, mock
// and data table read against the latest rows in decisions.ts, and the
// production routes read against the pages the review covers. Four lists:
// calls only Tsahi can make, chapters that still describe overturned
// models, production routes with no shell decision, and what a handoff
// needs that no chapter provides yet.

export interface OpenCall {
  topic: string;
  question: string;
  where: string;
  recommendation: string;
}

// All ten calls were closed on 30 Sep 2026; chapter 9b keeps each with its
// picture and decision. The array stays so the chapters that read it keep
// compiling; it is empty on purpose.
export const openCalls: OpenCall[] = [];

export interface Drift {
  chapter: string;
  stale: string;
  fix: string;
}

// Chapters whose copy, verdicts, mocks or data still describe a model a
// later decision overturned. Every row is a mechanical fix once the open
// calls above are made.
export const drift: Drift[] = [
  { chapter: '0', stale: 'Done on 30 Sep: the levers follow the decisions, the round-one questions moved to the Archive, the Home demo is the 4e one. Left: the before/after post still shows floating buttons at reading, which waits on open call 1.', fix: 'Swap the post still once call 1 is decided.' },
  { chapter: '1', stale: 'Four fixes in the audit table are the round-1 proposals (PageBar, Create in the centre, pinned 92px row, docked bar with a comment field).', fix: 'Relabel the column "as first proposed" or update the four strings.' },
  { chapter: '2', stale: 'Eight of the principles ("never a floating button", "five places always visible", "PageBar on top") were overridden by later decisions and carry no note.', fix: 'A "superseded by decision n" note per principle.' },
  { chapter: '3', stale: 'Headlines; Create as a sheet; the docked arm’s geometry presented as the rules; "never hidden by scrolling"; You may carry a dot; the magnifier for Explore in one arm. Found on 1 Oct (9e): the table gives Squads and the avatar a dot against the one-badge rule; "deep links light nothing" against chapter 5; visitor Activity and Create "open the signup sheet" (decided: the sign-up page).', fix: 'Happening now, Create opens the composer, chromeSpec numbers, compass, You is not a tab; Activity count only; the owning root lights; the sign-up page.' },
  { chapter: '3b', stale: 'Every leaf demo and the "top cluster" grammar keep buttons that never move; segments "pinned, blurred"; Create "filled"; 12px insets; a fold at p = 0.5 with a haptic; solid as the Android default; the Liquid Glass table shown as ours; three unused Apple bar components.', fix: 'Point leaf behaviour at 4e, Create is Material, insets 20 and 16, continuous, label the glass research superseded, delete the Apple demos.' },
  { chapter: '3c', stale: 'Results described with chips (decided: segments); the results row says the field reopens Spotlight while the rules say no second field; the squad still has a 24px name and no cover.', fix: 'Segments, no field on results, the squad from 4e.' },
  { chapter: '3d', stale: 'Create "filled"; the poll tool named but not drawn; login versus signup sheet naming; the comment composer lives here but the chapter never shows it.', fix: 'Material, draw the poll, one sheet name, show the composer.' },
  { chapter: '4', stale: 'Home "pins with a blurred background", a 44px reading budget, segments "with an underline", the PageBar section with titles, subtitles and Follow inside the bar, the Tag before/after using the rejected bar, "post buttons never move", the visitor tag leaf at 24px, a duplicated Visitors story.', fix: 'Budget 0 while reading, quiet chips, delete the PageBar section, TagScroll as the after, the 4e post, 20px, one Visitors story; the visitor callout says Home and Activity open the login sheet (decided: the sign-up page), and the visitor Explore, Squads and Activity roots are drawn in 9e.' },
  { chapter: '4b', stale: 'Primitives and 21 page rows say "heading in content"; the gallery draws 32px headings, channels as a second row, Members as a squad segment, Achievements on the profile, a 36px tag hero; Bookmarks ignores segments and the search field; Create "sheet" and the comment "sheet"; New Squad in the Create sheet.', fix: 'Names in the row, drop the gallery for the 4d pages, segments and the field, composer, decide New Squad.' },
  { chapter: '4c', stale: 'One callout keeps sort chips on Explore and results, tonal chips; "segments pin under the buttons", the "96px bar" and the sticky implementation notes; underline and pill looks; fixes 1, 2 and 7 with old sizes; Explore sort and Happening now filed as Chips; the tag page still at 32px; the switch note; three unused leaf demos.', fix: 'Delete the callout, rewrite pin and implementation copy around the hiding block, Menu level, 20px, delete the demos.' },
  { chapter: '4d', stale: 'Status and metric say 24px hero; the proposed column still puts names in content at 24; "fixed with the buttons", "the band turns solid", the soft edge; CoverDemo and RootTitleDemo pin.', fix: '20px everywhere, names in the row, swap the demos for SquadScroll and ActivityScroll.' },
  { chapter: '4e', stale: 'The stickiness rule says the menu moves beside back (decided: just left of Join); "no gradient" while a blur sits under the clock; four snap durations across files; hideSpec.ts is imported by nothing and clashes with the hide.tsx constant.', fix: 'Fix the rule, say the status-bar edge is intended, one spec file.' },
  { chapter: '5', stale: 'Round 1 throughout (see the open call).', fix: 'Redraw.' },
  { chapter: '6', stale: 'Comment as a keyboard-height sheet in the goal, two callouts, the "do not" list and the playground explain texts; the Safari view for links; PageBar; status bar 54; a separate shrink hook.', fix: 'Composer, point to 6b, top block, 44, hideSpec.' },
  { chapter: '6b', stale: 'Status and implementation notes say three heights; "seven lines" for eight rules; the "sheet with our bar / Custom Tab first" callout; Reload in the rule but not the menu; Share twice; the Post detent height, thresholds and drag commit are not in the copy.', fix: 'Four heights, eight, rewrite the callout, add the numbers row.' },
  { chapter: '7', stale: 'Headlines channels swipe (decided: only segments swipe, channels are a menu), the pinned row and PageBar get a shadow, the feed selector stays visible, Create as a sheet, the comment sheet, 200ms header, "two rows need a wrapper" (three); nothing on the reading drawer, edge-swipe exclusion, long-press or haptics.', fix: 'A round 5 pass with a Drawers row.' },
  { chapter: '8', stale: 'You hub, PageBar, the Safari view and Custom Tabs, "five lines in the wrapper" for what 6b needs (a screen, a native sheet, a second web view, about ten messages), no rows for edge to edge, status-bar style, reduced transparency or overlay-aware back.', fix: 'Rewrite the bridge table from 6b and the covers.' },
  { chapter: '9', stale: 'Phase 2 ships the You tab, a centre Create, a Create sheet, an Explore hub with Your squads; the post phase ships a docked bar with a comment field and a hidden tab bar; a reply sheet; Headlines; the experiment table was replaced by the no-experiments call; no phase for 3c, 3d, 4c, 4d, 4e, 6b, covers or the visitor header.', fix: 'Rewrite the phases from the decisions.' },
];

export interface RouteGap {
  group: string;
  routes: string;
  covered: string;
}

// Production routes (packages/webapp/pages) that no row in pages.ts,
// audit.ts or tabs.ts covers, and whether the shell obviously fits.
export const routeGaps: RouteGap[] = [
  { group: 'No-shell flows', routes: '/onboarding, /onboarding/swipe, /welcome, /join, /join/organization, /activate, /verification, /reset-password, /callback, /oauth/login, /oauth/consent, /popup/notifications/enable, /plus, /plus/gift, /plus/payment, /plus/success, /pay, /cores/payment, /squads/[handle]/[token]', covered: 'No. Needs the no-shell class decision.' },
  { group: 'Agents', routes: '/agents, /agents/arena, /agents/ask, /agents/[entityId], /agent/[id], /agent/[id]/settings', covered: 'No. A whole area with its own bar today; needs the Explore row and a leaf decision.' },
  { group: 'Jobs and tools', routes: '/jobs/* (12 routes behind jobs_ui), /tools, /tools/[slug]', covered: 'Plain leaves fit; Jobs is a multi-step flow that needs a look.' },
  { group: 'Squad flows', routes: '/squads/new and /squads/create (both exist), /squads/[handle]/edit, /analytics, /moderate, /pending, /products/*, /manage/products/*, /squads/moderate', covered: 'Leaves with back and a name fit; the products storefront and the two creation routes need a call.' },
  { group: 'Post flows', routes: '/posts/[id]/edit (a full route, not the composer modal), /posts/[id]/share, /layout-v2/posts/[id], /scheduled', covered: 'Edit needs a decision (page or the composer); the rest are leaves.' },
  { group: 'Custom feeds', routes: '/feeds/new, /feeds/[slug]/edit', covered: 'Leaves with the check-mark Save; only named once.' },
  { group: 'Settings forms', routes: '/settings/profile, /settings/profile/experience/* (7 forms), /settings/api, /settings/security, /settings/composition, /settings/job-preferences, /settings/organization/[orgId]/{general,members,billing}, /game-center/settings', covered: 'Leaves fit; the organization sub-tabs need the 4c grammar with the URLs they already have.' },
  { group: 'Profile', routes: '/[userId]/{work,education,project,opensource,certification,volunteering}, /[userId]/achievements, /world, /world/[userId]', covered: 'Leaves fit; Achievements as a segment is an open call.' },
  { group: 'Archives', routes: '/posts/best-of/[year]/[month], /tags/[tag]/best-of/*, /sources/[source]/best-of/*', covered: 'Open call.' },
  { group: 'Misc', routes: '/404, /error, /gear, /giveback, /hackathon, /helloworld/*, /quiz/ai-fluency', covered: 'Say whether the cluster shows on 404 and error; the rest are leaves.' },
  { group: 'Out of scope, say so once', routes: '/recruiter/*, /backoffice/*, /team/*, /embed/*, /articles/[id], /image-generator/*, /feed-by-ids, /watercooler, /users/[id]', covered: 'Redirects, endpoints and desktop-only areas.' },
];

export interface HandoffItem {
  item: string;
  today: string;
  needed: string;
}

export const handoff: HandoffItem[] = [
  { item: 'One spec of numbers', today: 'chromeSpec, appleSpec (rejected, 12px inset), hideSpec in hide.tsx, hideSpec.ts, covers.tsx, 3c, 3b, 7 and 6b each carry their own constants; three conflicts (hide travel 64 versus 92, two shadow recipes, insets 12 versus 20 and 16).', needed: 'spec.ts: every size, radius, inset, duration and tolerance with the decision row it comes from; delete appleSpec.' },
  { item: 'Component inventory', today: 'None. The production pieces are MobileFooterNavbar, FooterNavBarTabs and Item, FooterPlusButton, FooterWrapper, FooterNavBarLayout, MobilePostFloatingBar (v1 and v2), GoBackHeaderMobile, MainLayoutHeader, HeaderButtons, HeaderLogo, PageHeader, FeedNav, UnifiedMobileFeedNav, MobileFeedActions, ExploreChipsBar, FeedExploreHeader and Tabs, ExploreHubHeader, TabContainer and TabList, Drawer, NavDrawer, ListDrawer, DropdownMenu, SmartComposerModal, Spotlight, useActiveNav, lib/ios.ts, safeArea.css.', needed: 'A table: mock, production component it replaces or wraps, new or changed, phase.' },
  { item: 'Feature flags', today: 'engagement_bar_v2, post_redesign, layout_v2_2 and plus_entry_mobile already gate some of these surfaces.', needed: 'None new: nothing in this work is behind a flag (Tsahi, 1 Oct 2026). What the handoff needs instead is how each step lands on the existing flags (which arm of post_redesign and engagement_bar_v2 the shell is built on, and what happens to the other).' },
  { item: 'Analytics', today: 'The footer items log nothing today; the post bar, the feed rows, Spotlight, the composer, the streak and the bell each fire their own events (9j lists them).', needed: 'Keep every existing event from its new place; add only a Click per cluster tab and ClickNotificationIcon with NotificationTarget.Footer. No schema (scope rule, 9j).' },
  { item: 'Routes', today: 'Decisions require URLs for segments, channels, queries and tabs; no table.', needed: 'A route table in chapter 5, with redirects for the retired routes (/highlights, /popular, /discussed, the /tags navbar).' },
  { item: 'Wrapper work and order', today: 'Chapter 8 lists five bridge lines from round 1; the Android project has not been inspected.', needed: 'The 6b bridge (openArticle, feed of title, source, counts and state; upvote, downvote, comment, bookmark, share, openExternal, copyLink, reading time), edge to edge, status-bar style per page, reduced transparency, overlay-aware back; the Android inspection as a named gate.' },
  { item: 'Extension and desktop', today: 'Nothing states the shell is phone only, while Drawer, TabContainer, DropdownMenu and useActiveNav changes reach both.', needed: 'One sentence and a test note per shared component.' },
  { item: 'Platform states', today: 'Keyboard open, empty, loading and error states, long names in the solid block with Join, dark mode of the primary chip, visitor Explore, Squads, Activity and post, deep link landing with no history, programmatic scroll and scroll restoration with a hidden block, pull to refresh, short pages, posts with no external link, lightbox, video and polls, sign-in walls, downloads and universal links inside the browser.', needed: 'A states section per chapter, or one chapter of states.' },
  { item: 'Accessibility and devices', today: 'Reduced motion is covered; the 38px top buttons are under the 44pt target with no hit-slop note; no labels for the icon-only bar, no VoiceOver order when the block hides, no Dynamic Type, no contrast check for light status text over covers; iPad, landscape and RTL are not mentioned; no Android navigation-bar inset rule; no blur performance budget.', needed: 'One page: labels, hit areas, focus order, type, contrast, insets, landscape rule, RTL statement, blur budget.' },
];
