// Every horizontal row of tabs, segments or chips a member can see on a
// phone, from the 2026-09-29 code inventory and simulator captures. Levels
// are the proposed grammar: 0 = the tab bar, 1 = the page's segments,
// 2 = chips that filter the list under them.

export enum TabLevel {
  Bar = 'Bar',
  Segments = 'Segments',
  Chips = 'Chips',
  Menu = 'Menu',
  None = 'Not a tab',
}

export enum TabVerdict {
  Keep = 'Keep',
  Reshape = 'Reshape',
  Move = 'Move',
  Remove = 'Remove',
}

export interface TabRow {
  page: string;
  routes: string;
  labels: string;
  component: string;
  scrolling: string;
  linking: string;
  swipe: string;
  verdict: TabVerdict;
  level: TabLevel;
  proposed: string;
}

export const tabRows: TabRow[] = [
  {
    page: 'Home strip',
    routes: '/, /my-feed, /popular, /upvoted, /discussed, /following, /history, /feeds/*, /explore/[tag], /tags, /sources, /users; /bookmarks* on phones; /notifications on tablets',
    labels: 'For you · custom feeds · + · | · Agents · Bookmarks · History · Following · Popular · Discussions · Tags · Sources · Leaderboard · Squads · Happening Now · Hot Takes · Game Center',
    component: 'UnifiedMobileFeedNav via FeedNav (feed_chips V3)',
    scrolling: 'Pinned with the logo row: sticky top-0, z 75, about 116px never leaves',
    linking: 'Links, one URL per chip; active only on an exact path match',
    swipe: 'None',
    verdict: TabVerdict.Reshape,
    level: TabLevel.Segments,
    proposed: 'Becomes the Home segments: For you · Happening now · Following · +. Popular, Discussions, Tags, Sources, Leaderboard, Squads, Hot Takes and Game Center move to Explore as rows; Bookmarks, History and the Following list move to You; Squads is already in the bar.',
  },
  {
    page: 'Explore sort',
    routes: '/posts, /posts/upvoted, /posts/discussed, /posts/latest, /posts/best-of',
    labels: 'Popular · By upvotes · By comments · By date · Best of, plus a calendar dropdown on two of them',
    component: 'FeedExploreHeader TabContainer in MainFeedLayout',
    scrolling: 'Pinned under the pinned search header: sticky top-4.5rem, z 75, a blank band between them',
    linking: 'Links',
    swipe: 'None',
    verdict: TabVerdict.Reshape,
    level: TabLevel.Chips,
    proposed: 'Sorting is an order, not a list, so it is a small text menu: "Popular ▾" on the Explore feed\u2019s header line opens a sheet with Popular · Upvoted · Discussed · Latest · Best of, plus the period (Last week, Last month, Last year) for Upvoted and Discussed, where production offers it. No chip row, nothing to pin; the choice is in the URL.',
  },
  {
    page: 'Tags directory',
    routes: '/tags',
    labels: 'Row 1 the Home strip (Tags active) · Row 2 All tags · Technical Debt · Career · AWS · Node.js · React · Row 3 All · A to Z · #',
    component: 'FeedNav + TagPageNavbar + TagDirectoryFilter in TagsDirectoryPage',
    scrolling: 'Row 1 pinned, rows 2 and 3 scroll away',
    linking: 'Rows 1 and 2 links, row 3 local state',
    swipe: 'None',
    verdict: TabVerdict.Remove,
    level: TabLevel.Chips,
    proposed: 'A leaf under Explore: floating back button, heading in content, search, Recommended as a chip row of links, the A to Z index as the one chip row. The strip goes with Home, the tag navbar goes because the Recommended list already shows the same tags.',
  },
  {
    page: 'Tag page',
    routes: '/tags/[tag]',
    labels: 'All tags · React · Next.js · Web Development (the current tag plus up to four related)',
    component: 'TagPageNavbar in TagTopicPage',
    scrolling: 'Scrolls away',
    linking: 'Links',
    swipe: 'None',
    verdict: TabVerdict.Remove,
    level: TabLevel.None,
    proposed: 'Not a tab row: four of its five items leave the page. The back button replaces All tags, and the related tags become a Related chip row of links inside the hero.',
  },
  {
    page: 'Sources directory, Leaderboard',
    routes: '/sources, /users',
    labels: 'The Home strip only (Sources or Leaderboard active)',
    component: 'FeedNav; ExploreHubHeader is desktop only',
    scrolling: 'Pinned',
    linking: 'Links',
    swipe: 'None',
    verdict: TabVerdict.Remove,
    level: TabLevel.None,
    proposed: 'Leaves under Explore with the heading in content and no row. Reached from the Explore rows and from Spotlight.',
  },
  {
    page: 'Happening now',
    routes: '/highlights, /highlights/all, /highlights/[channel]',
    labels: 'Headlines · All · Agentic · Security · Career · more channels',
    component: 'HighlightsPage TabContainer (swipeable, shallow)',
    scrolling: 'Pinned: sticky top-0, z 2, under a gradient title that scrolls away',
    linking: 'Links, shallow push',
    swipe: 'react-swipeable, delta 40, no axis lock (the feedback in chapter 7)',
    verdict: TabVerdict.Reshape,
    level: TabLevel.Chips,
    proposed: 'A Home segment named Happening now, and no second row. The active segment carries a chevron that opens the channel sheet; the chosen channel shows on the list header line with a clear control (?channel= in the URL). The Headlines tab goes because the segment carries the name. Swipe moves between segments.',
  },
  {
    page: 'Activity',
    routes: '/notifications',
    labels: 'All activity · Upvotes · Mentions · Comments · Followers · Squads · Agents · Updates',
    component: 'NotificationFilterBar in NotificationsFeed',
    scrolling: 'Scrolls away; on tablets the Home strip pins above it',
    linking: 'URL query (type=), shallow replace',
    swipe: 'None',
    verdict: TabVerdict.Keep,
    level: TabLevel.Chips,
    proposed: 'The right shape already: chips with a URL. They become the page’s only row, so they pin under the Activity heading, and the strip stops rendering above them on tablets.',
  },
  {
    page: 'Bookmarks',
    routes: '/bookmarks, /bookmarks/later, /bookmarks/[folderId]',
    labels: 'The Home strip (Bookmarks active only on /bookmarks) over a vertical list: Quick saves · Read it later · folders',
    component: 'FeedNav + BookmarkSection list in BookmarkFeedLayout',
    scrolling: 'Strip pinned, list scrolls away',
    linking: 'Links',
    swipe: 'None',
    verdict: TabVerdict.Reshape,
    level: TabLevel.Segments,
    proposed: 'A leaf under You. The lists become segments with their existing URLs (Quick saves · Read it later · each folder · +), pinned under the floating buttons on scroll. Sort and the folder menu stay as icon buttons top right.',
  },
  {
    page: 'Squads directory',
    routes: '/squads/discover, /squads/discover/featured, /squads/discover/my, /squads/discover/[category]',
    labels: 'My Squads · Discover · Featured · Languages · Web · Mobile · more categories',
    component: 'SquadDirectoryNavbar in SquadDirectoryLayout',
    scrolling: 'Scrolls away',
    linking: 'Links',
    swipe: 'None',
    verdict: TabVerdict.Reshape,
    level: TabLevel.Chips,
    proposed: 'The Squads root has no segments: Your squads first, then Discover with the categories as one chip row (All · Languages · Web · Mobile · …) that pins when it reaches the top. Featured is a section, not a tab; My Squads is the section above.',
  },
  {
    page: 'Squad page',
    routes: '/squads/[handle], /squads/[handle]/members',
    labels: 'Posts · About; on members Members · Moderators · Blocked',
    component: 'SquadPageLayout and SquadMembersList TabContainer',
    scrolling: 'Scrolls away, below the fold under Join',
    linking: 'Local state, no URL',
    swipe: 'None',
    verdict: TabVerdict.Keep,
    level: TabLevel.Segments,
    proposed: 'Segments with URLs (/squads/x and /squads/x/about; members, moderators, blocked) that pin under the floating buttons when the hero scrolls out, so the switch is always reachable.',
  },
  {
    page: 'Profile',
    routes: '/[userId]; /[userId]/posts, /replies, /upvoted',
    labels: 'About · Posts · Replies · Upvoted',
    component: 'ActivityHeader TabList in ProfileLayout',
    scrolling: 'Scrolls away; a fixed name bar appears above once scrolled',
    linking: 'Local state, although /[userId]/posts, /replies and /upvoted exist as separate pages with a back header',
    swipe: 'None',
    verdict: TabVerdict.Keep,
    level: TabLevel.Segments,
    proposed: 'Segments with the existing URLs (shallow), pinned under the floating buttons on scroll. The three standalone pages become the same profile scrolled to its segments, so one destination has one door.',
  },
  {
    page: 'Search results',
    routes: '/search/posts',
    labels: 'Posts · Squads · People · Tags (proposed in chapter 3c as chips; today only the search header)',
    component: 'Proposed',
    scrolling: 'Proposed: pinned when reached',
    linking: 'URL query',
    swipe: 'None',
    verdict: TabVerdict.Reshape,
    level: TabLevel.Segments,
    proposed: 'Posts, Squads, People and Tags are different lists (different things, each its own URL), so they are segments under the query, pinned. Filters stays a floating icon button and opens a sheet.',
  },
  {
    page: 'Settings pages',
    routes: '/settings/notifications, /settings/feed/blocked, /settings/feed/sources, /settings/customization/devcard',
    labels: 'Notifications · Email; Sources · Squads · Users · Tags; Sources · Squads · Users; Embed · Customize',
    component: 'TabContainer, ModalTabs, pressed buttons (DevCardStep2)',
    scrolling: 'Scroll away, except DevCard which pins at top-0 without a z-index under the pinned heading and overlaps it',
    linking: 'Local state',
    swipe: 'None',
    verdict: TabVerdict.Keep,
    level: TabLevel.Segments,
    proposed: 'One segment component with a tab= query, pinned under the page heading with one z-index. Same look on all four pages.',
  },
  {
    page: 'Not navigation',
    routes: 'Comment composer, agent pane, feed hero',
    labels: 'Write · Preview; open-content tabs; carousel dots',
    component: 'MarkdownInput, AgentContentPane, FeedHeroCarousel',
    scrolling: 'Inline',
    linking: 'Local state',
    swipe: 'Carousel swipes',
    verdict: TabVerdict.Keep,
    level: TabLevel.None,
    proposed: 'Controls inside a form or a drawer, not page navigation. They keep their look and stay out of this system, but Write · Preview should use the segment component so the two tabs on a page never look different.',
  },
];

export interface Duplicate {
  what: string;
  where: string;
  fix: string;
}

export const duplicates: Duplicate[] = [
  {
    what: 'Squads appears in the bar and in the Home strip',
    where: 'Every Home page: the bar’s fifth tab and the strip’s twelfth chip open the same directory.',
    fix: 'Squads stays in the bar only.',
  },
  {
    what: 'Happening now has three names on one screen',
    where: 'Bar tab Headlines, strip chip Happening Now, page tab Headlines, page title Happening Now.',
    fix: 'One name, Happening now, as a Home segment; the channels live in its menu.',
  },
  {
    what: 'Two different pages called Popular',
    where: 'The strip’s Popular is /popular, a Home feed; Explore’s first tab Popular is /posts, another feed with its own sort tabs.',
    fix: 'One Popular: the Explore feed’s default sort. /popular redirects there.',
  },
  {
    what: 'Two active tabs for one place on /tags',
    where: 'The strip shows Tags selected and the row under it shows All tags selected; the Recommended list below repeats the same five tags a third time.',
    fix: 'Tags becomes a leaf under Explore with no strip and no navbar; Recommended stays as the one chip row of links.',
  },
  {
    what: 'A tab row that is really a list of other pages',
    where: '/tags/[tag]: All tags · React · Next.js · Web Development, where only React is this page.',
    fix: 'Back button plus a Related chip row inside the hero.',
  },
  {
    what: 'Explore exists twice',
    where: 'Popular, Discussions, Tags, Sources, Leaderboard and Squads are chips on Home and the content of the Explore tab in the bar.',
    fix: 'They live on Explore as rows; Home keeps feeds only.',
  },
  {
    what: 'Lists about you sit in the feed row',
    where: 'Bookmarks, History and Following make the Home strip fifteen chips long, and Bookmarks then repeats the strip on its own page.',
    fix: 'They move to You; Bookmarks becomes a leaf with segments for its lists.',
  },
  {
    what: 'Profile tabs reachable two ways',
    where: 'About · Posts · Replies · Upvoted are local tabs on the profile and also three standalone pages with a back header.',
    fix: 'Segments with the existing URLs; the standalone pages render the same profile scrolled to the segments.',
  },
  {
    what: 'Rows with nothing selected',
    where: 'The strip matches the path exactly, so /upvoted, /explore/[tag], /bookmarks/later and /bookmarks/[folder] show no active chip.',
    fix: 'Active state comes from a route prefix; every row always has exactly one selected item.',
  },
];

export interface TabRule {
  id: string;
  rule: string;
  detail: string;
}

export const tabRules: TabRule[] = [
  {
    id: 'T1',
    rule: 'Two questions decide the control',
    detail: 'Does the tap change WHICH LIST you are looking at (different things or a different source, something you would link to)? Segments. Does it NARROW the same list to a subset? Chips. Does it REORDER the list or set a period or a secondary dimension? A menu. Nothing else is a tab.',
  },
  {
    id: 'T2',
    rule: 'One of each, never stacked',
    detail: 'A page has at most one segment row, one chip row and one menu. A chip row never sits directly under a segment row: when a segment’s list needs narrowing, the segment gets the menu (Happening now). The bar is level 0 and never repeats in a row.',
  },
  {
    id: 'T3',
    rule: 'Links leave, tabs stay',
    detail: 'If the tap opens another page, it is a link in content (a row, a card, a chip drawn as a link), never a segment or a chip. Tag pages, related tags and the Explore places are links.',
  },
  {
    id: 'T4',
    rule: 'Every choice is in the URL',
    detail: 'Segments push a path (shallow); chips and menus set a query. The selected item comes from a route prefix, never an exact match, so a row is never shown with nothing selected.',
  },
  {
    id: 'T5',
    rule: 'One pinned row, under the top chrome',
    detail: 'Segments pin. On Home under the status bar once the brand row has slid away; on a leaf under the floating buttons, on the soft scroll edge (content fading under the top), with no background of their own; nothing behind the buttons is ever a solid band or glass. A page without segments pins its chip row instead. A menu is a line in content and never pins.',
  },
  {
    id: 'T6',
    rule: 'Pinned rows never stack under another pinned bar',
    detail: 'No blank bands, no second sticky header, no overlapping z-indexes: the pinned row is the last thing before content, always 44px, one z-index for all of them.',
  },
  {
    id: 'T7',
    rule: 'Swipe moves segments, never chips or the bar',
    detail: 'Horizontal swipe on the content switches segments with the axis lock from chapter 7. Chip rows and the tab bar do not respond to swipe; a chip row scrolls sideways instead.',
  },
  {
    id: 'T8',
    rule: 'One family, three weights, one primary',
    detail: 'Every row is the product\u2019s own 28px chip in the 8px radius. Segments: footnote bold, plain tertiary text, the active one on a soft tonal fill with a hairline (the feed strip\u2019s chip today). Filter chips: hairline-outlined, the active one a primary button (black on white, white on black). Link chips: hairline, regular weight, no state. Menu: text with a chevron. No underline, no purple.',
  },
  {
    id: 'T9',
    rule: 'One name per destination',
    detail: 'The bar tab, the segment, the chip and the title use the same word: Happening now, Activity, Explore. A row never carries a name the page already shows.',
  },
];

// The rule applied to every row, so a new page can copy the nearest line.
export interface Worked {
  page: string;
  items: string;
  question: string;
  control: TabLevel;
}

export const worked: Worked[] = [
  { page: 'Home', items: 'For you · Happening now · Following · custom feeds', question: 'Different lists', control: TabLevel.Segments },
  { page: 'Home, Happening now', items: 'All · Agentic · Security · Career…', question: 'Narrows the segment’s list, and a chip row cannot sit under segments', control: TabLevel.Menu },
  { page: 'Explore feed', items: 'Popular · Upvoted · Discussed · Latest · Best of; period for Upvoted and Discussed', question: 'Reorders one list', control: TabLevel.Menu },
  { page: 'Activity', items: 'All activity · Upvotes · Mentions · Comments · Followers · Squads · Updates', question: 'Narrows one stream; no segments on the page', control: TabLevel.Chips },
  { page: 'Search results', items: 'Posts · Squads · People · Tags', question: 'Different things', control: TabLevel.Segments },
  { page: 'Bookmarks', items: 'Quick saves · Read it later · folders', question: 'Different lists, each with a URL', control: TabLevel.Segments },
  { page: 'Squads root', items: 'All · Languages · Web · Mobile · DevOps…', question: 'Narrows the Discover list; no segments on the page', control: TabLevel.Chips },
  { page: 'Squad page', items: 'Posts · About; Members · Moderators · Blocked', question: 'Different lists', control: TabLevel.Segments },
  { page: 'Profile', items: 'About · Posts · Replies · Upvoted', question: 'Different views of one person; About (bio, highlights, experience) is the default', control: TabLevel.Segments },
  { page: 'Tags directory', items: 'All · A to Z · #', question: 'Narrows one list (jump index)', control: TabLevel.Chips },
  { page: 'Tags directory, Recommended; tag page, Related', items: '#react · #nextjs · #webdev…', question: 'Each opens another page', control: TabLevel.None },
  { page: 'Settings', items: 'Notifications · Email; Sources · Squads · Users · Tags', question: 'Different lists', control: TabLevel.Segments },
  { page: 'Comment composer', items: 'Write · Preview', question: 'A control inside a form', control: TabLevel.None },
];

export interface TabFix {
  id: number;
  fix: string;
  // The PR in chapter 10 that closes it.
  pr: string;
}

export const tabFixes: TabFix[] = [
  { id: 1, fix: 'One Segments component (the 28px quiet chip in a 44px row, URL-driven, axis-locked swipe) replaces TabContainer, TabList, SquadDirectoryNavbar, ModalTabs and the DevCard buttons on phones', pr: '2.1' },
  { id: 2, fix: 'One Chips component (the 28px outlined chip, primary-button active, query-driven) and one Menu control (label + chevron, opens a sheet) replace UnifiedMobileFeedNav chips, NotificationFilterBar, TagDirectoryFilter, the category pills and the explore period dropdown', pr: '2.1' },
  { id: 3, fix: 'Home strip becomes For you · Happening now · Following · +; the other twelve chips move to Explore, You and the bar', pr: '2.1' },
  { id: 4, fix: 'Active state from a route prefix everywhere; /upvoted, /explore/[tag] and bookmark folders stop showing an empty row', pr: '2.1' },
  { id: 5, fix: '/tags loses the strip and TagPageNavbar; keeps search, Recommended and the A to Z index as a leaf under Explore', pr: '2.4' },
  { id: 6, fix: '/tags/[tag] loses TagPageNavbar; related tags become a Related chip row in the hero', pr: '2.4' },
  { id: 7, fix: 'Explore sort tabs become the Explore feed’s text menu (Popular ▾); the blank band and the double sticky header go; Best of and the period are options inside the menu’s sheet', pr: '2.2' },
  { id: 8, fix: 'Happening now channels move into a sheet opened from the active segment, with the choice on the list header line; the Headlines tab is dropped; swipe moves segments only', pr: '2.1' },
  { id: 9, fix: 'Squad page Posts · About and Members · Moderators · Blocked get URLs and pin under the floating buttons', pr: '2.6' },
  { id: 10, fix: 'Profile About · Posts · Replies · Upvoted get the existing URLs; the three standalone pages redirect into the profile', pr: '2.7' },
  { id: 11, fix: 'Activity chips pin under the heading; the tablet strip above them is removed', pr: '2.8' },
  { id: 12, fix: 'Bookmarks lists become segments with URLs on a leaf under You', pr: '2.8' },
  { id: 13, fix: 'Squads directory categories become one chip row under Your squads; Featured becomes a section', pr: '2.5' },
  { id: 14, fix: 'Settings tabs on four pages share the Segments component and a tab= query; the DevCard z-index overlap is fixed', pr: '3.5' },
  { id: 15, fix: '/popular redirects to the Explore feed so one name means one page', pr: '2.2' },
];

export const pinnedToday: [string, string][] = [
  ['Home strip', 'sticky top-0, z 75, with the 48px logo row above it; about 116px never leaves'],
  ['Explore sort', 'sticky top-4.5rem, z 75, under the sticky search header; a 32px blank band shows between them'],
  ['Happening now', 'sticky top-0, z 2; the gradient title above it scrolls away'],
  ['DevCard Embed · Customize', 'sticky top-0 with no z-index, under a heading that is sticky at the safe-area top with z 1; they overlap once both stick'],
  ['Activity, Squads directory, squad page, profile, settings, bookmarks, tag pages', 'Scroll away, including rows that filter the main list, so the switch leaves the screen after one flick'],
];
