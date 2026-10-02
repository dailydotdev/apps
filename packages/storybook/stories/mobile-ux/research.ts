export interface Benchmark {
  app: string;
  tabs: string;
  center: string;
  homeHeader: string;
  postOpens: string;
  gesture: string;
  source: string;
}

// Desk research, 2026-09-28. Every row was checked against a primary or
// trade-press source; the URL is in `source`.
export const benchmarks: Benchmark[] = [
  {
    app: 'Reddit (2025-26)',
    tabs: 'Home · Communities/Discover · Create · Inbox · Profile',
    center: 'Create',
    homeHeader: 'Persistent search bar, feed switcher (Home / Popular / Latest) under it',
    postOpens: 'Full-page push; comments button jumps straight to comments with a sticky context bar',
    gesture: 'Removed swipe-between-feeds; the un-fixed header test was received badly',
    source: 'https://support.reddithelp.com/hc/en-us/articles/43910393846420-Changelog-December-2-2025',
  },
  {
    app: 'Threads',
    tabs: 'Home · Search · Compose · Activity · Profile',
    center: 'Compose',
    homeHeader: 'Pinned, swipeable For you / Following / custom feeds; default feed is a setting',
    postOpens: 'Push',
    gesture: 'Swipe between feeds, pull to refresh',
    source: 'https://techcrunch.com/2024/11/27/threads-now-lets-you-swipe-between-different-feeds-right-from-the-home-screen',
  },
  {
    app: 'X',
    tabs: 'Home · Search · Grok · Communities · Notifications · Messages (6)',
    center: 'Grok (a product bet)',
    homeHeader: 'Pinned For you / Following / Lists tabs',
    postOpens: 'Push',
    gesture: 'Swipe between home tabs; old Twitter held a 4-tab limit',
    source: 'https://www.socialmediatoday.com/news/x-tests-communities-quick-link-bottom-nav-bar/717306/',
  },
  {
    app: 'LinkedIn',
    tabs: 'Home · Video · My Network · Notifications · Jobs',
    center: 'Video / My Network',
    homeHeader: 'Avatar, search, messaging in one top bar',
    postOpens: 'Push',
    gesture: 'Pull to refresh; tested moving all nav into the top bar',
    source: 'https://www.linkedin.com/help/linkedin/answer/a528037/navigating-the-linkedin-mobile-app-overview',
  },
  {
    app: 'Substack',
    tabs: 'Home · Inbox · Chat (notifications moved to the top bar)',
    center: 'Inbox',
    homeHeader: 'Reading queue + Notes; compose inside Home',
    postOpens: 'Push',
    gesture: 'Swipe filters in Inbox',
    source: 'https://techcrunch.com/2023/09/20/substack-redesigns-its-mobile-app-to-boost-discovery-and-engagement',
  },
  {
    app: 'Flipboard 4.1',
    tabs: 'For You · Following · Explore · Notifications · Profile',
    center: 'Explore',
    homeHeader: 'Carousel of feeds',
    postOpens: 'Story page',
    gesture: 'Swipe between feeds; 4.0 removed the bar and 4.1 brought it back',
    source: 'https://about.flipboard.com/inside-flipboard/core-navigation-is-back-bottom-tab-bar-three-story-layouts-and-redesigned-explore/',
  },
  {
    app: 'Octal (Hacker News)',
    tabs: 'Feed tabs only: Top · New · Ask · Show · Best · Jobs',
    center: 'none',
    homeHeader: 'Feed name',
    postOpens: 'In-app Safari or reader; comments push',
    gesture: 'Re-tap a tab: scroll to top, then refresh, then pop when nested',
    source: 'https://apps.apple.com/us/app/octal-for-hacker-news/id1308885491',
  },
  {
    app: 'Perplexity',
    tabs: 'Home · Discover · Spaces · Library (4)',
    center: 'none',
    homeHeader: 'Logo + ask box, nothing else',
    postOpens: 'Answer thread push; sources in an in-app browser',
    gesture: 'Pull down for a new thread',
    source: 'https://techpp.com/2026/04/15/perplexity-icons-explained/',
  },
  {
    app: 'Forem (dev.to)',
    tabs: 'WebView shell, web header, no native bar',
    center: 'none',
    homeHeader: 'Web header',
    postOpens: 'Web page',
    gesture: 'Swipe between communities',
    source: 'https://github.com/forem/ForemWebView-ios',
  },
];

export interface Evidence {
  who: string;
  what: string;
  result: string;
  source: string;
}

export const evidence: Evidence[] = [
  {
    who: 'Spotify iOS, 2016',
    what: 'Hamburger to a 5-tab bar',
    result: '+9% clicks overall, +30% on menu items, retention and consumption unchanged',
    source: 'https://techcrunch.com/2016/05/03/spotify-ditches-the-controversial-hamburger-menu-in-ios-app-redesign/',
  },
  {
    who: 'Facebook iOS, 2013',
    what: 'Dozens of nav designs tested on 5-10M users each',
    result: 'Bottom tab bar won across engagement, satisfaction, revenue and speed metrics',
    source: 'https://techcrunch.com/2013/09/18/facebooks-new-mobile-test-framework-births-bottom-tab-bar-navigation-redesign-for-ios-5-6-7/',
  },
  {
    who: 'Redbooth iOS',
    what: 'Hamburger to 5 tabs',
    result: 'Sessions doubled, session time +70%, DAU +65% (self-reported)',
    source: 'https://redbooth.com/blog/hamburger-menu-iphone-app',
  },
  {
    who: 'Nielsen Norman Group',
    what: 'Hidden vs visible navigation, controlled study',
    result: 'Hidden nav used in 57% of sessions vs 86%; discoverability down 20%+, tasks 15% slower, rated 21% harder',
    source: 'https://www.nngroup.com/articles/hamburger-menus/',
  },
  {
    who: 'Flipboard 4.0 to 4.1',
    what: 'Removed the bottom bar, then restored it',
    result: '+30% engagement for new users, but retained users could not find their stuff; bar came back',
    source: 'https://about.flipboard.com/inside-flipboard/core-navigation-is-back-bottom-tab-bar-three-story-layouts-and-redesigned-explore/',
  },
  {
    who: 'Instagram, 2020 to 2023',
    what: 'Reels in the centre slot, Shop replacing Activity',
    result: 'Sustained backlash; Compose returned to the centre and Shop was dropped',
    source: 'https://techcrunch.com/2023/01/09/instagram-is-removing-the-shop-tab-moving-reels-from-the-center-spot-in-design-overhaul-next-month/',
  },
  {
    who: 'Threads, 2023 to 2024',
    what: 'Added Following, then pinned swipeable feed tabs, then default feed choice',
    result: 'Shipped in response to user pressure; "should make navigating the app much simpler" (Mosseri)',
    source: 'https://techcrunch.com/2023/07/25/metas-threads-app-is-rolling-out-a-following-feed/',
  },
  {
    who: 'Artifact, 2023 to 2024',
    what: 'Reading app added Links, Posts, Places, AI voices in nine months',
    result: 'Diluted focus, 444k lifetime downloads, shut down',
    source: 'https://techcrunch.com/2024/01/18/why-artifact-from-instagrams-founders-failed-shut-down/',
  },
  {
    who: 'Steven Hoober',
    what: '1,333 observations of how people hold phones',
    result: '49% one-handed, 75% of interactions thumb-driven; grip changes every few seconds',
    source: 'https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php',
  },
];

export interface Guidance {
  platform: string;
  rule: string;
  implication: string;
  source: string;
}

export const guidance: Guidance[] = [
  {
    platform: 'Apple HIG, tab bars',
    rule: 'Tab bars are for navigation, not actions. Do not hide the tab bar except under a modal. Reserve badges for critical information. Avoid a "More" tab.',
    implication: 'Create belongs in the bar only as the one sanctioned action slot; our floating "+" is neither a tab nor a toolbar. Post pages hiding the bar is defensible only if the post reads as a modal-like leaf.',
    source: 'https://developer.apple.com/design/human-interface-guidelines/tab-bars',
  },
  {
    platform: 'iOS 26, Liquid Glass',
    rule: 'Tab bar minimizes on scroll-down (active tab stays visible), re-expands on scroll-up. Search is its own trailing pill. Back gesture can start anywhere in the content area.',
    implication: 'Minimize, do not hide. Any horizontal swipe surface in content now competes with system back, so swipe rows need an axis lock.',
    source: 'https://developer.apple.com/videos/play/wwdc2025/284/',
  },
  {
    platform: 'Apple HIG, navigation bars',
    rule: 'Large titles collapse to a standard title on scroll; standard Back symbol, no label; keep toolbar items few.',
    implication: 'The PageBar is a 44-48pt row with back, title, two actions. Our centred tag hero is the large title, and it should collapse.',
    source: 'https://developer.apple.com/design/human-interface-guidelines/toolbars',
  },
  {
    platform: 'Material 3',
    rule: 'Navigation bar has 3 to 5 destinations, always one active. Top app bar scroll behaviours: pinned, enterAlways, exitUntilCollapsed.',
    implication: '5 destinations is the ceiling. enterAlways (bar returns on any upward scroll) is the model for our brand row.',
    source: 'https://m3.material.io/components/navigation-bar/guidelines',
  },
  {
    platform: 'Material 3 Expressive, 2025',
    rule: 'Navigation drawer deprecated. Show the navigation bar on primary pages and toolbars on subsequent pages with actions, never both.',
    implication: 'Our post page shows both. The engagement bar should be the only bottom bar there.',
    source: 'https://9to5google.com/2025/05/18/material-3-expressive-toolbars/',
  },
  {
    platform: 'Android predictive back',
    rule: 'Intercepting KEYCODE_BACK is no longer supported; use OnBackPressedCallback enabled only while the WebView can go back.',
    implication: 'The Android wrapper needs a back contract with the web layer or system back will exit the app from a post.',
    source: 'https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture',
  },
  {
    platform: 'Apple HIG, sheets',
    rule: 'Support swipe to dismiss, a medium detent for progressive disclosure, one sheet at a time.',
    implication: 'Create, share, sort and comment options are sheets. Never stack a drawer on a drawer.',
    source: 'https://developer.apple.com/design/human-interface-guidelines/sheets',
  },
  {
    platform: 'Google Search, interstitials',
    rule: 'App-install interstitials that obscure the page are penalised; small dismissible banners and the native Smart App Banner are fine.',
    implication: 'Never show a web "Open in app" bar inside the app wrapper itself, and never stack one on iOS Safari where the native banner already shows.',
    source: 'https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials',
  },
];

export const principles: { title: string; body: string }[] = [
  {
    title: 'One bottom bar, five places, always visible except under a modal',
    body: 'HIG forbids hiding it; M3 caps it at five; Flipboard lost retained users when it removed it.',
  },
  {
    title: 'The bar holds places, not verbs',
    body: 'If Create needs prominence it takes the centre slot like Reddit, Threads and YouTube. It is never a floating button and never disguised as search.',
  },
  {
    title: 'Search is thumb-reachable',
    body: 'iOS 26 moved system search to the bottom for one-handed use; Reddit enlarged and persisted its bar. A top-right icon is the wrong place.',
  },
  {
    title: 'Profile and lists are a tab, not a drawer or a gear',
    body: 'Reddit deleted its profile drawer; M3 deprecated the drawer; NN/g measured a 20%+ discoverability loss for hidden navigation.',
  },
  {
    title: 'Feed switching is one pinned segmented row',
    body: 'For you, Following, Headlines, Squads and custom feeds in one swipeable row under the brand row (Threads and X). The default is a setting.',
  },
  {
    title: 'Header budget: one brand row that collapses, one row that pins',
    body: '92px at rest, 44px scrolled. The brand row returns on any scroll-up (M3 enterAlways). Kill empty logo rows.',
  },
  {
    title: 'Minimize, do not hide',
    body: 'On scroll-down shrink the chrome (iOS 26 model); keep the active tab and the feed selector visible.',
  },
  {
    title: 'Posts push, with motion and a single bottom bar',
    body: 'Full-page push with a View Transition, a PageBar on top, the engagement bar docked at the bottom, external links in an in-app browser.',
  },
  {
    title: 'One back stack per tab, one back semantics everywhere',
    body: 'Header chevron, iOS swipe, Android back and history all call the same goBack. Re-tapping the active tab pops to root, scrolls to top, then refreshes.',
  },
  {
    title: 'Scroll position survives back',
    body: 'Manual scroll restoration after the feed reaches height; render from cache so a peel never reveals blank.',
  },
  {
    title: 'Sheets for secondary flows',
    body: 'Medium detent, grabber, swipe to dismiss, one at a time. Portaled overlays stop propagation.',
  },
  {
    title: 'Respect the geometry',
    body: 'viewport-fit=cover, max(16px, env(safe-area-inset-*)), 44pt targets, content padding equal to the bar, composers sized from visualViewport.',
  },
  {
    title: 'Gestures never fight the platform',
    body: 'Axis lock on every horizontal swipe surface; touch-action: pan-y on chips; overscroll-behavior: contain only inside sheets; pull-to-refresh owned by the web layer.',
  },
  {
    title: 'Badges are rationed',
    body: 'One badge at a time (Activity), dots only for genuinely new state, cleared on view.',
  },
  {
    title: 'Ship as measured experiments',
    body: 'Instrument first, segment new vs retained users, watch first-session depth and D7. Never add a tab for a product bet without a rollback plan. Superseded in round 5: no A/B tests or experiments; one rollout flag, metrics read after the fact.',
  },
];
