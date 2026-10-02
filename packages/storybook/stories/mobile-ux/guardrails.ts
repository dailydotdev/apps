// Chapter 9j: the technical guardrails. Read from the code on 1 Oct 2026
// (the worktree is 14 commits behind main; the header and footer PRs and
// the scroll restoration rewrite live only on main and are marked so).
// The rule above every row: this work changes how members reach what
// exists. It adds no feature, no data, no flag and no technical project.

export interface Guardrail {
  rule: string;
  detail: string;
}

export const scopeRules: Guardrail[] = [
  { rule: 'No new feature', detail: 'Every page keeps the content, data and actions it has today. The shell changes where the bar, the header, the menus and the back button are, and how they move. If a PR adds something a member could not do before, it is out of scope.' },
  { rule: 'No new data', detail: 'No new GraphQL query, mutation or shell-state field. The You page, the streak sheet, the Explore page and the search results show what the app already fetches, in a new place.' },
  { rule: 'No flag, no experiment, nothing hidden', detail: 'Decided 1 Oct. Each step is live for everyone when it merges; a problem is fixed forward or reverted by a PR.' },
  { rule: 'No rewrite', detail: 'The shell is built on the components that exist (the footer, the header, GoBackHeaderMobile, Drawer, TabContainer, SmartComposerModal, Spotlight) by changing their layout under the phone breakpoint, not their logic. A new component is written only where none exists: the floating cluster, the hiding block.' },
  { rule: 'Desktop and the extension are untouched', detail: 'Shared pieces (MainLayoutHeader, HeaderButtons, DropdownMenu, Drawer, TabContainer, SpotlightHost, ReadingStreakButton, NotificationsBell) render on desktop and in the extension too. Every phone change sits behind the viewport check the piece already uses, and the shared and webapp test suites run on every PR.' },
  { rule: 'Every event keeps firing', detail: 'An event that fires today fires tomorrow with the same name, target and origin from the new place. New events only for controls that did not exist, using the enums that exist. No analytics project.' },
  { rule: 'No URL disappears', detail: 'The nine duplicates removed in 4c are navigation entries, not routes. Every segment and channel keeps its URL (decided in 5); a route that stops being a page redirects. Canonical, noindex and JSON-LD per page stay as they are.' },
  { rule: 'The wrappers wait for step 4', detail: 'Steps 0 to 3 send no new bridge message and need no app release. The ios class, the safe-area CSS and the existing handlers keep working as they are.' },
];

export interface KeepWorking {
  area: string;
  today: string;
  rule: string;
}

export const keepWorking: KeepWorking[] = [
  { area: 'Events from the bottom bar', today: 'MobileFooterNavbar, its tabs and FooterPlusButton fire nothing. NotificationTarget.Footer exists in log.ts and is never used.', rule: 'Nothing to preserve. PR 0 adds one Click per tab with TargetId.MobileFooter as target_id and the tab in extra (the enum that already exists, as the app footer uses it), and the Activity tab fires ClickNotificationIcon with NotificationTarget.Footer and the unread count. The cluster keeps both in 1.1. That is the whole addition.' },
  { area: 'Events from the post bar', today: 'MobilePostFloatingBar (v1 and v2) fires SharePost with provider CopyLink and origin ArticlePage; votes and bookmarks fire through useVotePost and useBookmarkPost with origin ArticlePage; Comment calls requestOpenComment(PostCommentButton).', rule: 'The capsule keeps the same hooks and the same origin, on the post page and inside the reading drawer. The stable ids mobile-upvote/downvote/comment/bookmark/copy-post-btn stay: PostPage tests read them.' },
  { area: 'Events from the feed rows', today: 'UnifiedMobileFeedNav and ExploreChipsBar fire ClickFeedTagChip with the tag as target_id and {variant, origin}. FeedNav carries the Plus entry banner events (plus_entry_mobile).', rule: 'The segment row fires ClickFeedTagChip for chips that carry a tag, as today. The Plus banner keeps its slot under the row; its events are untouched.' },
  { area: 'Events from search', today: 'SpotlightTrigger fires Click / Spotlight / SpotlightOpen; SpotlightHost fires Impression, KeyboardShortcutTriggered, SpotlightCommand with search_id, query, scope, provider, group, position, and CloseSearch with timing.', rule: 'The floating field is a SpotlightTrigger. Nothing else changes: the same host, the same events, the same search_id.' },
  { area: 'Events from Create', today: 'FooterPlusButton opens a Drawer of links to /squads/create; it fires nothing. SmartComposerModal fires OpenSmartComposer {kind, hasInitialUrl}, SwitchComposerKind, SubmitSmartComposer and the rest.', rule: 'The Create square opens SmartComposerModal directly, so OpenSmartComposer fires where nothing fired before. No new composer events.' },
  { area: 'Events from the header', today: 'ReadingStreakButton fires OpenStreaks; NotificationsBell fires ClickNotificationIcon with NotificationTarget.Header; LoginButton fires click with target_id header; GetAppButton fires Click and DownloadApp; on main, MobileAppActions fires with TargetId.MobileHeader.', rule: 'The streak pill is ReadingStreakButton; the visitor buttons are MobileAppActions; the avatar opens the You page (a Link today, no event, none added). Same events, same targets.' },
  { area: 'Events from menus', today: 'Drawer, NavDrawer, ListDrawer and DropdownMenu fire nothing themselves; post menu events live in PostOptionButton with Origin.PostContextMenu.', rule: 'Menus become sheets by swapping the container, not the items: PostOptionButton keeps every event and origin.' },
  { area: 'Shared with desktop and the extension', today: 'MainLayoutHeader, HeaderButtons and SpotlightHost render in the extension; DropdownMenu has about 35 consumers plus the extension; Drawer 15; TabContainer is in settings, highlights and the auth options; ReadingStreakButton and NotificationsBell sit in the desktop header and the v2 sidebar.', rule: 'Phone layout only under isMobile(MobileL) or the tablet:hidden classes each piece already uses. pnpm --filter shared test and pnpm --filter webapp test on every PR; the extension build once per step.' },
  { area: 'Flags already on these pages', today: 'post_redesign (false) picks the post layout; engagement_bar_v2 (false, logged-in only) picks the action bar; plus_entry_mobile (false) adds the For You banner; feed_chips (v3) shapes the chip rows; interest_agent (false) adds the agent chip; layout_v2_2 is laptop and up. On main: mobile_app_footer and mobile_app_sheet (false).', rule: 'The shell builds on the arm that is live for everyone (the control) and must render correctly under both arms while a flag exists. No flag is added and none is removed by this work; retiring post_redesign or engagement_bar_v2 is product’s call, separately.' },
  { area: 'URLs and SEO', today: 'Canonical comes from the router path for every page (canonicalFromRouter), explicit on posts and /highlights; tags and sources are ISR with JSON-LD; private squads and bookmarks are noindex; profiles carry canonical and user.noindex. /search rewrites to /search/posts. No sitemap generator in this repo.', rule: 'No route removed. Segments and channels keep the URLs they have (/highlights, /highlights/[channel], /posts/upvoted and the rest render inside the shell). Retired navigation entries redirect only where a page goes away (/squads/create to /squads/new). Head tags per page are not touched.' },
  { area: 'Back, history and scroll position', today: 'On main a single useScrollRestoration in _app restores by history.state.key; the post modal uses kind post-modal; useActiveNav reads activeFeed, the route and the viewport to light a tab; articles/[id] uses beforePopState for its hard navigation.', rule: 'The shell uses the one restoration hook and history.state, never a second store. The lit tab extends useActiveNav for the owning root (decided in 9e); the arbitrage page keeps its beforePopState.' },
  { area: 'Tests that must stay green', today: 'GoBackHeaderMobile, MainLayoutHeader, HeaderButtons, FeedNav, MobileFeedActions, UnifiedMobileFeedNav, ExploreChipsBar, FeedExploreTabs, TabContainer, Drawer, Spotlight, SmartComposerModal, ProfileButton, ReadingStreakPopup, useScrollRestoration, usePostModalNavigation specs; webapp FooterWrapper, PostPage, MainLayout, SearchPage, SquadPage, SourcePage, TagPage, BookmarksPage, Profile pages; on main the MobileApp* specs.', rule: 'Every step runs them. A test rewritten because the DOM moved keeps its assertion; a test deleted needs a line in the PR saying which behaviour is gone and why the design decided it.' },
  { area: 'The native bridge', today: 'iOS: ios.ts sends native-auth, update-user-id, track-event, push-*, iap-*, app-icon-*; the wrapper sets the ios class and safeArea.css offsets .fixed.top-0 and .sticky.top-0. Android: no bridge; isAndroidApp comes from the ?android query kept in the boot cache. Universal links match /* except helloworld, callback and cores; App Links via assetlinks.json.', rule: 'Nothing changes before step 4. The block and the cluster use the same safe-area variables; the top offsets the ios class applies to sticky elements are checked on the block (it is transformed, not sticky). Step 4 adds the 6b messages and the Android back contract, in chapter 8.' },
  { area: 'Ads on public pages', today: 'PhoneTopAdStrip publishes --phone-top-ad-height; CustomAuthBanner, GoBackHeaderMobile and FixedPostNavigation read it; the arbitrage page forces light mode and hard-navigates out.', rule: 'The block reads the same variable for its top offset (9f); nothing else in the ads code is touched.' },
  { area: 'Main has moved', today: 'The review worktree is 14 commits behind main: the logged-out header (#6731, #6744), the footer and sheet (#6735) and the scroll restoration rewrite (#6754) are on main only.', rule: 'Every step starts from main. The visitor header in chapter 4 is MobileAppActions, not a new component; the footer in 9h is MobileAppFooter as merged.' },
];

export interface StepProof {
  step: string;
  touches: string;
  proves: string;
}

export const stepProofs: StepProof[] = [
  { step: '0 · Fixes', touches: 'TabContainer swipe, FooterWrapper first paint, pull to refresh in the feed, press states, the touch-blind menus, the footer events.', proves: 'TabContainer, FooterWrapper, HighlightsPage and MainLayout specs; a manual pass on the Happening now channels and the post menu on a phone; the new bar events visible in the log stream.' },
  { step: '1 · The shell', touches: 'FooterWrapper, MobileFooterNavbar, FooterPlusButton, MainLayoutHeader below laptop, GoBackHeaderMobile, MobileFeedActions, Drawer as the sheet, useActiveNav, the no-shell layouts.', proves: 'The full shared and webapp suites; the extension build; a phone pass on every root and leaf in chapter 4b’s list; the event stream for the post bar, the streak, the bell, the visitor buttons unchanged.' },
  { step: '2 · Places', touches: 'UnifiedMobileFeedNav, ExploreChipsBar, FeedExploreHeader, the Explore, tags, sources, squads and profile pages, SpotlightTrigger placement.', proves: 'FeedNav, UnifiedMobileFeedNav, ExploreChipsBar, FeedExploreTabs, Spotlight, SquadPage, SourcePage, TagPage and Profile specs; every URL in chapter 5’s table opens the right segment; head tags diffed before and after on tags, sources, squads and profiles.' },
  { step: '3 · Post and you', touches: 'MobilePostFloatingBar, PostPage layout, SmartComposerModal for comments, ReadingStreakPopup content as a sheet, the settings and form pages.', proves: 'PostPage, SmartComposerModal, ReadingStreakPopup specs; the stable mobile-*-post-btn ids; vote, bookmark and share events unchanged with origin ArticlePage; a pass under post_redesign on and off, engagement_bar_v2 on and off.' },
  { step: '4 · Reading the link, the wrappers', touches: 'A new reading screen in the iOS wrapper and a sheet in the Android one, the bridge messages from chapter 8, edge to edge, the back contract.', proves: 'The bridge messages exercised from the web layer with a fake handler in tests; Universal links and App Links still land in the app; the arbitrage page still hard-navigates; reads counted as today.' },
];

export const outOfScope: string[] = [
  'New destinations, content or recommendations on any page.',
  'Backend, GraphQL or shell-state changes.',
  'Retiring or adding a feature flag; running an experiment.',
  'Changes to onboarding, the sign-up screen, checkout or the logged-out prompts themselves (their PRs own them).',
  'Changes to the ads code beyond reading the strip’s height variable.',
  'The desktop layout, layout v2, the extension.',
  'Notification permission logic, push, or anything the wrappers do beyond chapter 8.',
  'Content of the post page, feed cards, comments or the composer.',
];
