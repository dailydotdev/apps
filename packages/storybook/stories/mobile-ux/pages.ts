// Page-by-page audit of phone chrome, from the 2026-09-28 code inventory
// (file references are in the notes). "Top" and "Actions" describe today;
// "Proposed" applies the floating-chrome system from chapter 3b.

export interface PageRow {
  page: string;
  today: string;
  todayActions: string;
  proposed: string;
  proposedActions: string;
  back: string;
}

export const pageRows: PageRow[] = [
  {
    page: 'Home (For you, Following, custom feeds)',
    today: 'Logo row + tab/chip strip, both sticky; Sort and Feed settings icons on the right of the strip',
    todayActions: 'Streak, quests, gear, avatar; per-card ⋮',
    proposed: 'Brand row (logo, streak, avatar) slides away on scroll; segmented feed row pins',
    proposedActions: 'Sort and Feed settings behind one control at the end of the segmented row (opens a sheet); per-card ⋮ opens the action sheet',
    back: 'Root, no back',
  },
  {
    page: 'Explore (/posts, upvoted, discussed, By date, Best of)',
    today: 'Sticky search bar, blank band, sticky sort tabs + period dropdown (ListDrawer without a close button)',
    todayActions: 'none',
    proposed: 'No header. Search field floats above the tab bar; on scroll the tab bar slides away and the field stays as a compact bar (post-leaf mechanics). It opens Spotlight. Popular / Discussions / Happening now / Tags / Sources / Leaderboard are rows, then the Explore feed (popular posts) scrolling on, its order a small menu on the feed heading',
    proposedActions: 'Period as a sheet from the segmented row',
    back: 'Root, no back',
  },
  {
    page: 'Search results',
    today: 'Search bar + right-aligned Filters button (bottom drawer, hand-rolled header, no portal)',
    todayActions: 'Filters',
    proposed: 'Spotlight sheet with the query; results page keeps the cluster',
    proposedActions: 'Filters as a button beside the field, opening the standard sheet',
    back: 'Back button returns to Explore',
  },
  {
    page: 'Happening now (/highlights, today\u2019s Headlines tab)',
    today: '"Happening Now" gradient h1 + copy-link, swipeable channel tabs',
    todayActions: 'Copy link',
    proposed: 'Home segment "Happening now" with the channels as a second segmented row (axis-locked); also an Explore row',
    proposedActions: 'Share in the row control',
    back: 'Segment, no back',
  },
  {
    page: 'Squads hub (tab)',
    today: 'Two destinations depending on membership: "Squads" title + New Squad + category tabs, or My Squads',
    todayActions: 'New Squad (Primary, shown logged out)',
    proposed: 'One hub: Your squads first (posts and list), then Discover by category. Title row "Squads"',
    proposedActions: 'New Squad lives in the Create sheet (when allowed)',
    back: 'Root, no back',
  },
  {
    page: 'Squad page',
    today: 'GoBackHeaderMobile (empty bar with ← or logo) + cover + SquadActions row (Edit, Bell, Share, Search, ⋮) + Join/Boost + Share page',
    todayActions: 'Up to six, three of them share-ish; ⋮ has a MANAGE group + 7 items',
    proposed: 'Floating back button; the hero keeps the name, Join and stats',
    proposedActions: 'Search button + ⋮ button. Notifications, Share, Invite, Manage, Leave, Report live in the action sheet; Manage group stays first for staff',
    back: 'Back button: previous screen',
  },
  {
    page: 'Squad sub-pages and Manage',
    today: 'SquadSubPageHeader (MoveToIcon ←, title, one action); Manage is a list page with "Back to Manage" links',
    todayActions: 'One per page',
    proposed: 'Same leaf header as everywhere: back button + one action button; the page heading is the first content row',
    proposedActions: 'Unchanged',
    back: 'Back button: the list it came from',
  },
  {
    page: 'Activity (/notifications)',
    today: 'In-page "Notifications" h2 + gear, filter bar; footer calls it Activity',
    todayActions: 'Gear to /notifications/settings',
    proposed: 'Root title row "Activity" + filter bar. Page title matches the tab',
    proposedActions: 'Settings button opens the notification settings page (with proper chrome)',
    back: 'Root, no back',
  },
  {
    page: 'Tag page',
    today: 'Tag strip (All tags, tag, related) + centred hero with Follow, Notify/Block, CopyLink, ⋮ (Share, Add to custom feed)',
    todayActions: 'Five, two of them copy the link',
    proposed: 'Back button; the hero keeps the name and Follow and scrolls with the content',
    proposedActions: 'Follow button + ⋮ button (Share, Notify, Block, Add to custom feed). Copy link only inside Share',
    back: 'Back button: previous screen',
  },
  {
    page: 'Tags directory',
    today: 'Logo row + chip strip + tag strip + hero + search + letters',
    todayActions: 'none',
    proposed: 'Leaf under Explore: back button; "Tags" heading, search field and letters in content',
    proposedActions: 'none',
    back: 'Back button: Explore',
  },
  {
    page: 'Source page',
    today: 'No header; breadcrumbs, logo + h1, action row Follow / Notify or Block / CopyLink / ⋮ (Share, Add to custom feed)',
    todayActions: 'Five, two of them copy the link',
    proposed: 'Back button + hero keeps its name and Follow',
    proposedActions: 'Follow button + ⋮ button. Copy link only inside Share',
    back: 'Back button: previous screen',
  },
  {
    page: 'Sources directory, Leaderboard',
    today: 'Logo row + chip strip; breadcrumbs hidden on phones, so no title',
    todayActions: 'Suggest new source (sources)',
    proposed: 'Leaves under Explore: back button; heading in content',
    proposedActions: 'Suggest source in the ⋮ sheet',
    back: 'Back button: Explore',
  },
  {
    page: 'Profile (someone else)',
    today: 'Sticky Header: ← "Profile" + Follow + Award + ⋮; hero repeats Follow + Award + ⋮',
    todayActions: 'Duplicated row',
    proposed: 'Back button; hero keeps the name, Follow and Award once',
    proposedActions: '⋮ button only (Share, Add to custom feed, Block, Report, Gift Plus)',
    back: 'Back button: previous screen',
  },
  {
    page: 'Profile (own) and the You page',
    today: 'Sticky Header: ← "Profile" + BuyCredits + Jobs + gear ("Edit profile" aria label); gear opens the settings drawer',
    todayActions: 'Four',
    proposed: 'Avatar in the Home brand row opens the You page (profile card, Bookmarks, History, Following, Custom feeds, My squads; Your progress: Achievements, Streak, DevCard, Hot takes, Game center; Plus, Core wallet, Invite friends, Settings, Help). Public profile is one tap further',
    proposedActions: 'Settings button on the You page; Edit profile inside the profile',
    back: 'Back button: Home',
  },
  {
    page: 'Profile sub-tabs (posts, replies, upvoted, achievements) and experience lists',
    today: 'GoBackHeaderMobile + bold title; experience lists use a MoveToIcon ← link to the profile',
    todayActions: 'none',
    proposed: 'Back button; heading in content',
    proposedActions: 'none',
    back: 'Back button: the profile',
  },
  {
    page: 'Bookmarks, Read it later, folders',
    today: 'Full Home header + "Bookmarks" title + Search bookmarks + Sort + Share + folder ⋮ + folder list; Read it later is titled Bookmarks',
    todayActions: 'Four in a row',
    proposed: 'Leaf under You: back button; heading in content ("Bookmarks", "Read it later", the folder name); folder list first, search inside content',
    proposedActions: 'Sort button + ⋮ button (Share bookmarks, Rename, Delete)',
    back: 'Back button: You page',
  },
  {
    page: 'History, Following',
    today: 'Full Home header + tab; History adds a search field, no title',
    todayActions: 'none',
    proposed: 'Leaves under You: back button; heading in content',
    proposedActions: 'Search inside content',
    back: 'Back button: You page',
  },
  {
    page: 'Post (article, share, poll, collection, brief, digest)',
    today: 'GoBackHeaderMobile: ← + Read post + Boost + ⋮ (up to 20 rows); copy link hidden on phones; engagement pill + tab bar + spacer',
    todayActions: 'Read post, ⋮',
    proposed: 'Back, Share, ⋮ buttons; source row once in content; Read the full post as a button; engagement bar folds inline beside a Home button',
    proposedActions: 'Share sheet (with copy link), action sheet grouped and capped',
    back: 'Back button: previous screen',
  },
  {
    page: 'Post analytics, Wallet, Game Center, Analytics, Daily quests, Briefings, Plus, Cores',
    today: 'Six different title rows: some with ←, some without, one linking to /bookmarks',
    todayActions: 'Varies',
    proposed: 'Leaf header: back button + one action button; heading in content',
    proposedActions: 'Buy cores / Generate / Boost as the single action',
    back: 'Back button: previous screen',
  },
  {
    page: 'Settings list and sub-pages',
    today: 'Left full-screen NavDrawer with 33 rows in 7 groups; sub-page ← reopens the drawer; drawer ← goes to the profile; notification settings has no ← and no title',
    todayActions: 'Cores balance in the drawer bar',
    proposed: 'Pages under You: Settings list (back button, heading in content) → sub-page (same). Notification settings gets the same chrome',
    proposedActions: 'none in the header; Cores balance is a row',
    back: 'Back button: the list, then You',
  },
  {
    page: 'Feed settings, Squad Manage',
    today: 'Feed settings: list inside a full-screen modal with Cancel/Save; Squad Manage: list page with hard links',
    todayActions: 'Save',
    proposed: 'Same list → page pattern as Settings, Save as the single action button',
    proposedActions: 'Save',
    back: 'Back button: the list',
  },
];

export interface MenuRow {
  menu: string;
  today: string;
  proposed: string;
}

export const menuRows: MenuRow[] = [
  {
    menu: 'Post (card and page)',
    today: 'Up to 20+ rows in a 16rem popup: pin group, Share via, analytics, Hide, Report, Boost, Downvote, Read it later, Translate, Move to, Follow/Notify source, Follow author, Block source, Block author, content type, Block per tag, Edit, Delete, moderator tools',
    proposed: 'Action sheet, three groups, seven rows visible: Share · Read it later · Follow {source} · Not interested (opens a sub-sheet: hide, block source, block author, block tags, content type) · Report · then owner rows (Edit, Delete, Analytics, Boost, Pin) · then "More" for moderator tools and Translate',
  },
  {
    menu: 'Comment',
    today: 'Edit, Delete, Share via (narrow only), Block, Follow/Unfollow (AddUser icon for both), Report comment, Gift Plus',
    proposed: 'Sheet: Share · Follow/Unfollow {author} (RemoveUser icon when unfollowing) · Report · Block · owner rows Edit, Delete · Gift Plus last',
  },
  {
    menu: 'Profile, source, tag (CustomFeedOptionsMenu)',
    today: 'Share (native or copy), Add to custom feed, plus Block/Report/Gift on profiles; a separate CopyLink button beside it',
    proposed: 'Sheet: Share (sheet with copy link inside) · Notify · Add to custom feed · Block · Report · Gift Plus. No separate copy-link button',
  },
  {
    menu: 'Squad page and squad card',
    today: 'Two different menus for the same squad: SquadOptionsMenu (Manage group, Add to custom feed, Invitation link, Award, Learn, Feedback, Report, Leave) and SquadHeaderMenu (Add to custom feed, Squad settings, Invitation link, Learn, Feedback, Report, Delete, Leave); a hover-only trigger on cards',
    proposed: 'One sheet for both: Manage group first for staff (Moderation with count, Members, Analytics, Settings) · Share · Invite · Notifications · Add to custom feed · Award · Report · Leave (destructive, last). Always visible trigger on cards',
  },
  {
    menu: 'Bookmark folder, bookmark button, history row, notification row',
    today: 'Popups with Title Case labels, missing icons, rotated MenuIcon on notifications',
    proposed: 'Same sheet component, sentence case, MenuIcon XSmall everywhere',
  },
  {
    menu: 'Hover-only triggers (HighlightCardOptions, SquadOptionsButton, entity cards)',
    today: 'Invisible on touch, so the actions do not exist on phones',
    proposed: 'Always visible ⋮ at Tertiary size on touch devices',
  },
];

export interface SheetRow {
  surface: string;
  today: string;
  proposed: string;
}

export const sheetRows: SheetRow[] = [
  {
    surface: 'Options menus (all ⋮)',
    today: 'Radix DropdownMenu popup, closes on scroll, 16rem',
    proposed: 'Action sheet: bottom sheet, grabber, grouped rows, destructive last, swipe to dismiss',
  },
  {
    surface: 'Sort, period, feed picker',
    today: 'ListDrawer, some with a bottom Close button, some without (Explore period)',
    proposed: 'Sheet with grabber and title, no bottom Close button; selected row checked',
  },
  {
    surface: 'Create (+), streak, share, reminder, gift, squad notifications',
    today: 'Bottom drawers with a full-width Close button, no title, no handle',
    proposed: 'Sheet with grabber and title; Create is the three rows; Share is one sheet with copy link, native share, and the social row',
  },
  {
    surface: 'Filters, schedule post, GIF picker',
    today: 'Hand-rolled headers (h2 + X), not portaled to root',
    proposed: 'Sheet with the shared header; GIF picker is a full-height sheet; all portaled to root',
  },
  {
    surface: 'Settings navigation, organization navigation',
    today: 'Left full-screen NavDrawer with a ← header',
    proposed: 'Pages, not a drawer (see Settings)',
  },
  {
    surface: 'Comment composer, post composer',
    today: 'Full-screen bottom drawers',
    proposed: 'Comment: keyboard-height sheet from the engagement bar (tab cluster hidden while typing). Post composer: full-screen modal, the one place that earns it',
  },
  {
    surface: 'Login for logged-out actions',
    today: 'Full-screen AuthModal, or a /onboarding link (the + button), or inline options (settings)',
    proposed: 'One medium-detent sheet (Log in / Sign up) from every gated action; full onboarding only after the choice',
  },
  {
    surface: 'Report, Add to custom feed, Move bookmark, list modals',
    today: 'Full-screen modals',
    proposed: 'Sheets (medium detent, grow to full for long lists). Full-screen stays for Hot takes and the composer',
  },
  {
    surface: 'Prompt (confirm dialogs)',
    today: 'Bottom drawer without a close affordance',
    proposed: 'Sheet with grabber; primary and cancel buttons; cancel on outside tap',
  },
];

export interface BackRow {
  where: string;
  today: string;
}

export const backRows: BackRow[] = [
  { where: 'Post, squad page, profile sub-tabs', today: 'router.back() with a logo fallback' },
  { where: 'Profile', today: 'router.back() with a / fallback' },
  { where: 'Cores, Plus', today: 'back, else replace(/)' },
  { where: 'Squad sub-pages, experience lists, Briefings', today: 'Hard links (squad, profile, /bookmarks)' },
  { where: 'Settings sub-pages', today: 'Reopens the settings drawer' },
  { where: 'Settings drawer ←', today: 'Pushes to the profile page' },
  { where: 'Notification settings, source, tag, leaderboard, wallet, game center', today: 'No back at all' },
];

export const settingsLabels: [string, string][] = [
  ['Profile details', 'Profile'],
  ['Invite Friends', 'Invite friends'],
  ['Feature visibility', 'Streaks & gamification'],
  ['Subscriptions', 'Payment & Subscription'],
  ['Open Source', 'Open source'],
];

export const nameRows: [string, string, string][] = [
  ['Footer "Activity"', 'Page "Notifications"', 'Page title becomes Activity'],
  ['Footer "Headlines"', 'Page "Happening Now" with a "Headlines" tab inside', 'One name: the Home segment is "Happening now"; the footer tab goes away; channels keep their names'],
  ['Footer "Explore"', 'FeedNav tab "Popular" for the same route', 'Popular is a row inside Explore'],
  ['Bookmarks page title', 'List row "Quick saves"; Read it later also titled Bookmarks', 'Title chip shows the list you are in'],
  ['Own-profile gear', 'aria-label "Edit profile", opens Settings', 'Settings button on the You page, Edit profile inside the profile'],
  ['"Share via", "Share post via...", "Share", "Share page"', 'Four labels for one action', '"Share" everywhere'],
  ['"Report", "Report comment", "Report Squad"', 'Mixed casing', '"Report" (the sheet title says what is reported)'],
  ['"Manade Ad"', 'Typo', '"Manage ad"'],
  ['"Rename Folder", "Delete Folder"', 'Title Case', 'Sentence case, like every other row'],
];

export interface Fix {
  id: number;
  fix: string;
  // The PR in chapter 10 that closes it.
  pr: string;
}

export const fixes: Fix[] = [
  { id: 1, fix: 'Every ⋮ opens the action sheet on touch; DropdownMenuOptions gets a sheet renderer', pr: '1.7' },
  { id: 2, fix: 'Post menu grouped and capped at seven visible rows with Not interested and More sub-sheets', pr: '1.7' },
  { id: 3, fix: 'Hover-only ⋮ triggers become always visible on touch', pr: '0' },
  { id: 4, fix: 'One icon style for menu rows (MenuIcon XSmall); Unfollow uses RemoveUser', pr: '0' },
  { id: 5, fix: 'One label per action: Share, Report, Block @handle, sentence case; fix "Manade Ad"', pr: '0' },
  { id: 6, fix: 'One Share sheet everywhere (copy link inside); remove standalone CopyLink buttons on tag and source pages', pr: '1.7' },
  { id: 7, fix: 'One squad menu shared by page and card', pr: '1.7' },
  { id: 8, fix: 'Profile: actions once (hero), header carries only back, title on scroll and ⋮', pr: '1.7' },
  { id: 9, fix: 'Brief posts get copy link back through the Share sheet', pr: '1.7' },
  { id: 10, fix: 'Rename Notifications page to Activity; Headlines segment and page share a name; Popular becomes an Explore row', pr: '1.3, 2.2' },
  { id: 11, fix: 'Bookmarks heading names the list you are in; Read it later titled correctly', pr: '2.8' },
  { id: 12, fix: 'Settings menu labels equal page titles (five fixes)', pr: '0' },
  { id: 13, fix: 'Feed settings list shows the same sections as the Settings menu', pr: '3.5' },
  { id: 14, fix: 'One goBack(): history if the previous entry is in-app and in this tab, else the owner root; no hard links, no drawer reopen', pr: '1.4' },
  { id: 15, fix: 'One back icon (ArrowIcon Medium in the rounded-square button)', pr: '1.4' },
  { id: 16, fix: 'Notification settings, source, tag, leaderboard, wallet, game center, analytics, quests get the leaf header', pr: '1.4' },
  { id: 17, fix: 'Settings becomes pages under You; the NavDrawer retires; organization nav follows', pr: '3.5' },
  { id: 18, fix: 'Squad Manage and Feed settings adopt the same list → page pattern with Save as the action button', pr: '3.5' },
  { id: 19, fix: 'Sheet primitive: grabber, shared header, swipe to dismiss, auto height, always portaled to root; bottom Close buttons removed', pr: '1.6' },
  { id: 20, fix: 'Filters, Schedule, GIF picker use the shared sheet header', pr: '1.6' },
  { id: 21, fix: 'Prompt gets a cancel affordance', pr: '0' },
  { id: 22, fix: 'The gated Sign up page for every gated action (the round 1 login sheet is withdrawn, 9b); the + button stops linking to /onboarding', pr: '1.5' },
  { id: 23, fix: 'Report, Add to custom feed, Move bookmark, list modals become sheets', pr: '1.7' },
  { id: 24, fix: 'Comment opens the full-page composer form from the engagement bar (the keyboard-height sheet is withdrawn, round 5)', pr: '3.3' },
  { id: 25, fix: 'Explore period picker gets the sheet header (it has no close today)', pr: '0' },
  { id: 26, fix: 'Quest button next to the streak uses the same sheet as the streak, not a popover', pr: '3.4' },
  { id: 27, fix: 'Sort and Feed settings on Home collapse into one control at the end of the segmented row', pr: '2.1' },
];

export interface HeaderActionRow {
  page: string;
  floating: string;
  inContent: string;
  why: string;
}

// What floats in the top row on each page and what stays in the content.
// Rule: the floating row holds icon-only square buttons; text actions live
// once in the content, next to the thing they act on.
export const headerActions: HeaderActionRow[] = [
  { page: 'Home', floating: 'none (brand row: logo, streak, avatar is flat); Create in the bottom cluster', inContent: 'Feed segments; Sort and Feed settings behind one control at the row end', why: 'Roots have no back; the Home header is the one exception to floating chrome because it also carries the feed switcher. The search icon opens Spotlight.' },
  { page: 'Explore', floating: 'none on top; search field floats above the cluster', inContent: 'Rows, then the Explore feed with its sort menu', why: 'Search is thumb-reachable at the bottom, nothing competes at the top.' },
  { page: 'Search results', floating: 'Back · Filters', inContent: 'Query heading, results', why: 'Filters is a single icon action; it opens a sheet.' },
  { page: 'Headlines (segment)', floating: 'none', inContent: 'Channels row; share in the row control', why: 'It is a Home segment, not a page.' },
  { page: 'Squads hub', floating: 'none', inContent: '"Squads" heading, your squads, discover', why: 'Root. New Squad lives in the Create sheet.' },
  { page: 'Squad page', floating: 'Back · Search · Menu', inContent: 'Name, stats, Join (full width) in the hero', why: 'Join is a text action about the squad, so it sits with the squad. Notifications, Invite, Share, Manage, Leave are in the menu sheet.' },
  { page: 'Activity', floating: 'Settings (root, no back)', inContent: '"Activity" heading, filters', why: 'One icon action; the heading is content.' },
  { page: 'Tag page', floating: 'Back · Menu', inContent: 'Name, count, description, Follow in the hero', why: 'Follow is a text action about the tag; a floating "Follow" would repeat it and read as a second, unrelated button. Block, Notify, Share, Add to custom feed are in the menu.' },
  { page: 'Source page', floating: 'Back · Menu', inContent: 'Name, stats, Follow in the hero', why: 'Same as tag.' },
  { page: 'Tags and Sources directories, Leaderboard', floating: 'Back', inContent: 'Heading, search, letters or list', why: 'Nothing to act on at page level.' },
  { page: 'Profile (someone else)', floating: 'Back · Menu', inContent: 'Name, handle, reputation, Follow and Award (two half-width buttons) in the hero', why: 'Today the sticky header repeats Follow, Award and Menu above the hero. Follow stays in the hero only; the header keeps Back and Menu.' },
  { page: 'You page', floating: 'Back · Settings', inContent: 'Profile card, streak, lists', why: 'Settings is an icon action; Edit profile lives inside the profile.' },
  { page: 'Bookmarks', floating: 'Back · Sort · Menu', inContent: 'Heading, list segments, search', why: 'Sort is an icon action opening a sheet; Share bookmarks, Rename, Delete are in the menu.' },
  { page: 'History, Following, Custom feed edit', floating: 'Back (· Save on edit)', inContent: 'Heading, search or form', why: 'Save is the one text-shaped action allowed as an icon button (a check mark) because it belongs to the whole page, not to a thing on it.' },
  { page: 'Post', floating: 'Back · Share · Menu', inContent: 'Source row once, title, Read the full post button; engagement bar at the bottom', why: 'Read post is a text action about the article, so it is a full-width button after the summary, not a header link.' },
  { page: 'Settings list and pages', floating: 'Back (· Save on forms)', inContent: 'Heading, groups or fields', why: 'Never a floating title, never a floating Cores balance.' },
  { page: 'Wallet, Plus, Game Center, Analytics', floating: 'Back · one icon action', inContent: 'Heading, content', why: 'Buy cores, Boost and Generate are icon buttons opening their sheet or page.' },
];
