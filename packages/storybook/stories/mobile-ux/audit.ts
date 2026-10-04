import { Severity } from './kit';

export enum Area {
  TabBar = 'Tab bar',
  Header = 'Header',
  Navigation = 'Navigation',
  Post = 'Post page',
  Gestures = 'Gestures',
  Wrapper = 'Wrapper',
  Measurement = 'Measurement',
}

export interface Issue {
  id: string;
  area: Area;
  severity: Severity;
  title: string;
  evidence: string;
  fix: string;
  where: string;
  chapter: string;
}

// Everything below was verified on 2026-09-28 either on app.daily.dev in
// iOS Simulator Safari (logged out) or on a local build with a fake member
// against the production API, plus the source files named in `where`.
export const issues: Issue[] = [
  {
    id: 'N1',
    area: Area.Navigation,
    severity: Severity.High,
    title: 'Two navigation systems point at the same places',
    evidence:
      'The bottom bar has Explore, Headlines and Squads. The home chip strip has Popular, Discussions, Tags, Sources, Leaderboard, Squads, Happening Now (= Headlines) and more. Bookmarks, History, Following, custom feeds, Game Center and Hot Takes exist only as chips on the home feed, so they vanish the moment you leave Home.',
    fix: 'One place per destination. Feeds live in a segmented row on Home, places live in the Explore tab, personal lists live behind the avatar. The chip strip goes away.',
    where: 'UnifiedMobileFeedNav.tsx, MobileFooterNavbar.tsx',
    chapter: '3',
  },
  {
    id: 'N2',
    area: Area.Navigation,
    severity: Severity.High,
    title: 'No consistent way back or "up" on most pages',
    evidence:
      'Tag pages show only a chip row, no back and no logo. Source pages show a logo row with no back. Squad pages show a lone chevron. Profile shows back + "Profile". Post shows back + "Read post" + menu. Notifications and Squads directory have in-page titles and no back at all. Five different top bars for the same job.',
    fix: 'One PageBar for every secondary screen: back, title, up to two actions. Tabs are roots and never show a back arrow.',
    where: 'GoBackHeaderMobile.tsx, MainLayoutHeader.tsx, profile/Header.tsx, SquadDirectoryLayout.tsx',
    chapter: '4',
  },
  {
    id: 'T1',
    area: Area.TabBar,
    severity: Severity.High,
    title: 'Home stays highlighted on post, source and discussion pages',
    evidence:
      'useActiveNav marks Home active for /posts/[id], /explore/* and any home-type feed, so reading a post reached from Squads still lights up Home. On /discussed the footer says Home while the chip strip says Discussions.',
    fix: 'Active tab = the tab whose stack you are in. Post pages inherit the tab they were opened from; if that is unknown, no tab is active.',
    where: 'hooks/useActiveNav.ts:23-52',
    chapter: '3',
  },
  {
    id: 'T2',
    area: Area.TabBar,
    severity: Severity.Medium,
    title: 'A floating "+" button sits on top of content and the bar',
    evidence:
      'FooterPlusButton is absolutely positioned above the bar and covers the last card and the See all links on every list page (Squads, Tags). It is hidden on posts and settings, so its presence itself is inconsistent. It opens the same 3-row drawer on every page.',
    fix: 'Move Create to the centre tab (Reddit, Threads, YouTube pattern). No floating button anywhere.',
    where: 'FooterPlusButton.tsx, FooterWrapper.tsx:42-45',
    chapter: '3',
  },
  {
    id: 'T3',
    area: Area.TabBar,
    severity: Severity.Medium,
    title: 'The bar only renders after window load',
    evidence:
      'FooterNavBarLayout gates the bar on `windowLoaded`, so on a slow connection the page paints, then the bar pops in and pushes nothing (it is fixed), but the user sees chrome appear late and the spacer is already there.',
    fix: 'Render the bar with the shell; gate only the badge count on data.',
    where: 'FooterNavBarLayout.tsx:18-34',
    chapter: '7',
  },
  {
    id: 'T4',
    area: Area.TabBar,
    severity: Severity.Medium,
    title: 'Headlines and Squads earn a tab, Search and You do not',
    evidence:
      'Search is reached through the Explore tab which renders a search bar on top of the popular feed. Profile, bookmarks, history and settings are reached through two small icons in the home header. Peer apps (Reddit 2025, Threads, Flipboard) put Search and Profile in the bar; none puts a news channel there.',
    fix: 'Home · Explore · Squads · Activity plus a Create button; the profile becomes the header avatar. Headlines becomes a Home segment and an Explore row.',
    where: 'MobileFooterNavbar.tsx:62-102',
    chapter: '3',
  },
  {
    id: 'H1',
    area: Area.Header,
    severity: Severity.High,
    title: 'Home spends 108px on chrome before the first card, and never gives it back',
    evidence:
      'Logo row (48) + chip strip (60) are both sticky. Explore-family pages stack logo row + chips + a second tab row + a hero; on Tags that is three navigation rows and a marketing intro before any tag. Nothing collapses on scroll.',
    fix: 'One brand row that hides on scroll-down and returns on scroll-up, one pinned segmented row. 92px at rest, 44px while reading.',
    where: 'FeedNav.tsx:176-245, MobileFeedActions.tsx',
    chapter: '4',
  },
  {
    id: 'H2',
    area: Area.Header,
    severity: Severity.Medium,
    title: 'Explore shows a blank band between the search bar and the sort tabs',
    evidence:
      'On /posts, both in production and locally, there is an empty ~80px band under the search field before Popular / By upvotes. The sticky FeedExploreHeader is offset by top-[4.5rem] to clear a header that is not there on phones.',
    fix: 'Remove the offset on phones; search field and sort row sit flush.',
    where: 'MainFeedLayout.tsx:765-780',
    chapter: '4',
  },
  {
    id: 'H3',
    area: Area.Header,
    severity: Severity.Medium,
    title: 'Logged-out pages show an empty logo row',
    evidence:
      'MobileFeedActions renders the logo with nothing on the right when there is no user (32px of dead space on Discussions, Tags, Sources). The post page stacks an auth strip, a logo row and a back bar.',
    fix: 'Covered by the logged-out header PR (dailydotdev/apps#6731): Log in + Open app fill the row. This review assumes that lands.',
    where: 'MobileFeedActions.tsx:27-72',
    chapter: '4',
  },
  {
    id: 'P1',
    area: Area.Post,
    severity: Severity.High,
    title: 'The post page shows two bottom bars and reserves 160px for them',
    evidence:
      'MobilePostFloatingBar (engagement pill) floats above MobileFooterNavbar, and FooterNavBarLayout adds an h-40 spacer. The comment composer opens as a third layer (full-screen drawer). Reading space on a 667px-tall phone is under 50%.',
    fix: 'On a post the engagement bar is the bottom bar: docked, with the comment field inside it. The tab bar returns when you go back. M3 says exactly this (toolbar on secondary screens, nav bar on primary ones).',
    where: 'FooterWrapper.tsx:58-65, FooterNavBarLayout.tsx',
    chapter: '6',
  },
  {
    id: 'P2',
    area: Area.Post,
    severity: Severity.Medium,
    title: 'Opening a post is a hard page swap',
    evidence:
      'Phones never use the reader modal (eligibility needs tablet width), so a tap does a full route change: white flash of the new page, no motion, scroll position restored later by useScrollRestoration. Back is a header chevron calling router.back().',
    fix: 'Same-document View Transition (slide in from the right, reverse on back) on top of the existing route change. Safari 18+ and Chrome 111+ cover the store apps.',
    where: 'Feed.tsx:690-714, useReaderModalEligibility.ts:37-38',
    chapter: '5',
  },
  {
    id: 'G1',
    area: Area.Gestures,
    severity: Severity.High,
    title: 'Horizontal swipe switches Headlines channels while you scroll',
    evidence:
      'User feedback (2026-09, michaelkoslap, "highly sensitive to swiping left/right, causing it to randomly switch categories while I am trying to scroll up/down"). HighlightsPage passes swipeable to TabContainer, which uses react-swipeable with delta: 40 and no axis lock, so any drag that ends with |dx| > |dy| and |dx| > 40px changes channel, even if the browser scrolled the page.',
    fix: 'Lock the axis on the first 10px of movement: if the gesture starts vertical, ignore it entirely. Accept a switch only when |dx| > 56px, |dx| > 2|dy| and velocity > 0.3. Make the content follow the finger so a switch is never a surprise. Apply the same rule to every swipeable row.',
    where: 'TabContainer.tsx:166-171, HighlightsPage.tsx:188',
    chapter: '7',
  },
  {
    id: 'G2',
    area: Area.Gestures,
    severity: Severity.Medium,
    title: 'No pull-to-refresh in the web layer, and the iOS one reloads the whole page',
    evidence:
      'The webapp has no pull-to-refresh. The iOS wrapper sets `pullToRefresh = true` with a native control and `scrollView.bounces = false`, so the feed cannot rubber-band at all inside the app, and a pull reloads the document instead of refetching the feed.',
    fix: 'Web-layer pull-to-refresh that refetches the active feed; the wrapper turns its own control off (or bridges it to the same refetch).',
    where: 'ios/Settings.swift, ios/WebView.swift',
    chapter: '7',
  },
  {
    id: 'G3',
    area: Area.Gestures,
    severity: Severity.Low,
    title: 'No haptics, no press states, no scroll-to-top on tab re-tap',
    evidence:
      'navigator.vibrate is never called; the iOS bridge has no haptic handler. Bar items have no pressed state. Re-tapping the active tab does nothing.',
    fix: 'Octal rule: re-tap pops to root, then scrolls to top, then refreshes. Bridge a haptic handler on iOS, vibrate on Android; use it for upvote, tab change and streak.',
    where: 'FooterNavBarItem.tsx, lib/ios.ts',
    chapter: '7',
  },
  {
    id: 'W1',
    area: Area.Wrapper,
    severity: Severity.Medium,
    title: 'Android has no bridge and no back contract',
    evidence:
      'Android is detected only by a persisted ?android= query. There is no message channel for share, haptics or back. Android 16 stops delivering KEYCODE_BACK to WebView activities that do not opt into predictive back, so the system back either exits the app or, once opted in, needs a canGoBack() contract with the web layer.',
    fix: 'Give the Android wrapper the same bridge surface as iOS (back, haptic, open-in-browser, share) and wire OnBackPressedCallback to history.',
    where: 'BootProvider.tsx:305-306, useWebappVersion.ts',
    chapter: '8',
  },
  {
    id: 'W2',
    area: Area.Wrapper,
    severity: Severity.Low,
    title: 'iOS swipe-back exists but peels a stale snapshot',
    evidence:
      'allowsBackForwardNavigationGestures is on, so the edge swipe works, but WebKit peels its own screenshot of the previous history entry, which for an SPA is often a blank or outdated frame before the app re-renders.',
    fix: 'Keep the gesture. Make the web layer restore instantly from cache on popstate (feed data is already in react-query) and restore scroll before paint.',
    where: 'ios/WebView.swift, useScrollRestoration.ts',
    chapter: '8',
  },
  {
    id: 'M1',
    area: Area.Measurement,
    severity: Severity.High,
    title: 'Tab taps and the "+" button send no analytics',
    evidence:
      'Bottom bar items, the plus button, its drawer, the settings gear and the avatar log nothing. We cannot say today how many sessions reach a second destination, which is the metric every navigation change should move.',
    fix: 'Log `click footer tab` (tab, from route) and `open create sheet` before anything else ships, then read two weeks of baseline.',
    where: 'FooterNavBarItem.tsx, FooterPlusButton.tsx',
    chapter: '9',
  },
];

export interface ChromeRow {
  page: string;
  top: string;
  bottom: string;
  back: string;
  note: string;
}

// What each page draws above and below content on a phone, logged in.
export const chromeInventory: ChromeRow[] = [
  {
    page: 'Home (For you)',
    top: 'Logo row 48 + chip strip 60, both sticky',
    bottom: 'Tab bar + "+"',
    back: 'none (root)',
    note: 'Chips mix feeds, lists and places.',
  },
  {
    page: 'Explore (/posts)',
    top: 'Search field 64 + blank band + sort tabs 50',
    bottom: 'Tab bar + "+"',
    back: 'none',
    note: 'The blank band is a phantom desktop offset.',
  },
  {
    page: 'Discussions / Tags / Sources / Leaderboard',
    top: 'Logo row + chip strip + page tabs (+ hero on Tags)',
    bottom: 'Tab bar + "+"',
    back: 'none',
    note: 'Footer highlights Home.',
  },
  {
    page: 'Headlines',
    top: 'Gradient title + channel tabs (swipeable)',
    bottom: 'Tab bar + "+"',
    back: 'none',
    note: 'Swipe fires on diagonal scrolls.',
  },
  {
    page: 'Activity',
    top: 'In-page title + gear',
    bottom: 'Tab bar + "+"',
    back: 'none',
    note: '"+" makes no sense here.',
  },
  {
    page: 'Squads directory',
    top: '"Squads" + New Squad button + category tabs',
    bottom: 'Tab bar + "+"',
    back: 'none',
    note: 'Two create buttons on one screen.',
  },
  {
    page: 'Squad page',
    top: 'Lone chevron bar + cover + actions row + Join',
    bottom: 'Tab bar + "+"',
    back: 'chevron (router.back)',
    note: 'Footer highlights Squads or nothing.',
  },
  {
    page: 'Tag page',
    top: 'Tag chips + centred hero (title, description, Follow, Block, link, menu)',
    bottom: 'Tab bar + "+"',
    back: 'none',
    note: 'No way up except the tab bar.',
  },
  {
    page: 'Source page',
    top: 'Logo row + cover + avatar + actions',
    bottom: 'Tab bar + "+"',
    back: 'none',
    note: 'Logo row is a back button in disguise.',
  },
  {
    page: 'Post',
    top: 'Back bar (back, Read post, menu); logged out also auth strip + logo row',
    bottom: 'Engagement pill + tab bar (160px reserved)',
    back: 'chevron (router.back)',
    note: 'Footer highlights Home.',
  },
  {
    page: 'Profile',
    top: 'Back + "Profile" + Follow/gear',
    bottom: 'Tab bar + "+"',
    back: 'chevron (falls back to /)',
    note: 'Own profile: gear opens settings drawer.',
  },
  {
    page: 'Settings',
    top: 'Full-screen drawer: back + "Settings" + Cores',
    bottom: 'none',
    back: 'chevron (to profile)',
    note: 'Not a page, a drawer with shouldKeepOpen.',
  },
  {
    page: 'Bookmarks / History / Following',
    top: 'Logo row + chip strip (same as Home)',
    bottom: 'Tab bar + "+"',
    back: 'none',
    note: 'Reachable only from the home chips.',
  },
];

export const feedback = {
  user: 'michaelkoslap',
  when: 'September 2026, via /settings/feedback',
  category: 'UX issue, urgency 3',
  summary: 'Mobile site swiping sensitivity issues disrupt scrolling experience.',
  quote:
    "I've noticed the mobile site is highly sensitive to swiping left/right, causing it to randomly switch categories while I am trying to scroll up/down. It would be great to be able to disable the left/right swiping, or even be able to adjust the sensitivity.",
};
