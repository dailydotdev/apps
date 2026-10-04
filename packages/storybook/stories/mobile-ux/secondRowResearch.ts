// Outside research for chapter 4c, round 5: how apps expose a second
// dimension (channel, topic, sort) under a primary row of feed tabs on a
// phone, from vendor docs, press coverage and design guidelines gathered
// 2026-09-29. "Unverified" marks details from product memory only.

export interface Benchmark {
  app: string;
  primary: string;
  second: string;
  pins: string;
  differs: string;
}

export const benchmarks: Benchmark[] = [
  { app: 'X, Home', primary: 'Text tabs with underline: For you, Following, pinned Lists, topic timelines', second: 'None. Anything else becomes another tab in the same row; swipe or tap.', pins: 'Header and row hide on scroll down, return on up (unverified)', differs: 'One level by design.' },
  { app: 'Instagram, Home', primary: 'Logo only. Tapping it opens Following and Favorites', second: 'A title dropdown, not a row; the 2025 redesign moves feed variants into a "Your feeds" sheet.', pins: 'Header collapses', differs: 'No tab strip at all.' },
  { app: 'Threads, Home', primary: 'Text tabs under the logo: For you, Following, custom feeds (since Nov 2024; before that a logo tap)', second: 'None. Custom feeds join the row.', pins: 'Row scrolls away, returns on up (unverified)', differs: 'One level; Threads abandoned the hidden logo menu for visible tabs.' },
  { app: 'Bluesky, Home', primary: 'Text tabs: Following, Discover, pinned feeds, a feeds icon at the end', second: 'None. Feed management is a separate screen.', pins: 'Visible (users asked for an option to hide it)', differs: 'One level.' },
  { app: 'YouTube, Home', primary: 'Bottom tabs; header is the logo with cast, bell, search', second: 'One chip row under the header: All, Music, Gaming, Live…', pins: 'Chips hide on scroll down and return on up', differs: 'Filled pills under a plain header; no underline anywhere.' },
  { app: 'YouTube, Subscriptions', primary: 'A row of channel avatars', second: 'A chip row under it: All, Today, Videos, Shorts, Live, Posts…', pins: 'Both scroll away (unverified)', differs: 'Level 1 is circles with images, level 2 is text pills: different shapes, so two rows never read alike.' },
  { app: 'Spotify, Home', primary: 'Greeting and avatar, then chips All, Music, Podcasts, Audiobooks', second: 'Drill in: pick a chip and an X appears at the start; sub-chips appear to the right (documented for Your Library, market-dependent on Home).', pins: 'Chip row pins (unverified)', differs: 'One row that mutates in place; the X and the slide carry the hierarchy.' },
  { app: 'Apple News, Today', primary: 'Floating tab bar: Today, News+, Following, Search', second: 'Channels and topics are titled sections inside the one feed; iOS 26.2 adds four quick-link pills (Sports, Puzzles, Politics, Food) that deep-link to sections.', pins: 'Pills scroll away', differs: 'No top tab row; the feed is the navigation.' },
  { app: 'Google News, Home (late 2024)', primary: 'Bottom tabs Home, Following, Newsstand', second: 'One chip carousel under the app bar with both modes and topics: For you, Headlines, Local, U.S., World, Business, Technology…', pins: 'Stays under the app bar (unverified)', differs: 'Merged the two levels into one chip row instead of tabs plus chips.' },
  { app: 'Reddit, Home', primary: 'Sept 2022: the feed switcher moved from top tabs to a title dropdown (Home ▾: Home, Popular, News, Latest) to have "fewer options competing for attention"; swipe stayed the fast path. Dec 2025 test: a chip row under a big search bar.', second: 'Sort is a lone dropdown at the top of the list (Best ▾).', pins: 'Header no longer fixed in the 2026 build', differs: 'A single title with a chevron; sub-sorts are one small control in the list header.' },
  { app: 'Reddit, community', primary: 'Header with community info, then the list', second: 'Posts / About as tabs or menu; sort as one dropdown at the top of the list.', pins: 'Sort scrolls with content (unverified)', differs: 'A lone dropdown reads as a control, not a strip.' },
  { app: 'NYT, Home (Oct 2024)', primary: 'A horizontally scrolling ribbon under the masthead: Today in the centre, sections one way, sub-brands the other', second: 'None on the ribbon; each page changes its whole art direction.', pins: 'Ribbon pinned', differs: 'Small serif labels; the page, not the row, tells you where you are.' },
  { app: 'The Guardian (2025)', primary: 'Section bar under the masthead with an underline', second: 'None; My Guardian is a tab for followed topics.', pins: 'Pinned', differs: 'Typographic only. Reported as more effective than continuous scroll with dividers (second-hand).' },
  { app: 'Substack, Home', primary: 'Bottom tabs; Home is a card stack of posts, then the Notes feed', second: 'A small Following / Explore toggle and category tabs above Notes; interests in Settings.', pins: 'Toggle scrolls with content (unverified)', differs: 'Level 1 is content (cards); level 2 is a toggle inside the feed.' },
  { app: 'Flipboard, Home', primary: 'Home carousel of favourites (max nine) with red underlines', second: 'A tune icon opens a personalisation sheet.', pins: 'Pinned (unverified)', differs: 'One level plus a sheet.' },
  { app: 'Airbnb, Explore (May 2025)', primary: 'Homes / Experiences / Services with 3D icons above the search pill; icons shrink on scroll', second: 'Card rails below; the old icon category strip is gone.', pins: 'Search pill and small tabs pin', differs: 'Icon tabs vs photo rails; no second control row.' },
  { app: 'App Store, Top Charts', primary: 'Segmented control Top Free / Top Paid', second: 'One trailing "All Categories" button that opens a picker.', pins: 'Segmented control pins under the title', differs: 'Two dimensions, one row, two controls that look nothing alike.' },
  { app: 'Artifact (2023–24)', primary: 'Three bottom icons; a scrollable topic row at the top of For You', second: 'Topics were the row; Headlines clustered stories per event.', pins: 'Pinned', differs: 'Monochrome pills; the topic row was the dominant navigation. Yahoo News adopted it.' },
];

export interface Pattern {
  id: string;
  name: string;
  examples: string;
  pros: string;
  cons: string;
}

export const patterns: Pattern[] = [
  { id: 'P1', name: 'Fold it into the one row', examples: 'X lists, Threads and Bluesky custom feeds, Medium topics, Google News 2024', pros: 'Zero new chrome; swipe works; one control.', cons: 'Flattens hierarchy (a topic sits next to Following); rows get long; off-screen tabs are weakly discovered.' },
  { id: 'P2', name: 'Chips under a plain header, no tab strip', examples: 'YouTube Home, YouTube Music, Spotify Home', pros: 'Chips read as filters, not destinations; cheap to change.', cons: 'Only works when the primary switch lives elsewhere (bottom bar or a title menu).' },
  { id: 'P3', name: 'Drill in with an exit', examples: 'Spotify (chip row collapses to the parent plus an X, children slide in)', pros: 'One row height; the X and the motion encode the level.', cons: 'State is invisible after the animation; hard to deep-link; Spotify only does it reliably in Library.' },
  { id: 'P4', name: 'Title or segment menu', examples: 'Instagram logo dropdown, Reddit Home ▾ (2022), iOS title menus', pros: 'No horizontal space; the primary row stays alone; Reddit did it to remove a competing bar.', cons: 'A chevron is a quiet affordance; Threads moved back to visible tabs; needs the current value echoed in content.' },
  { id: 'P5', name: 'Trailing sort or filter control that opens a sheet', examples: 'Reddit community sort, App Store All Categories, LinkedIn Sort by, NN/g facet tray', pros: 'Scales to many options; reads as a control; keeps results visible behind the sheet.', cons: 'One extra tap; the current value must show in the button label or it is lost.' },
  { id: 'P6', name: 'Second level as a rail of visuals', examples: 'YouTube Subscriptions avatars, Apple News channel cards, Airbnb rails, Flipboard tiles', pros: 'A different shape, so the two rows never look alike; each item previews its destination.', cons: 'Taller; fewer items visible; wrong for abstract dimensions like sort.' },
  { id: 'P7', name: 'Section headers inside one feed', examples: 'Apple News Today, Bloomberg Home, Ground News, Apple Music New', pros: 'No controls; the dimension is scanned by scrolling; all channels visible at once.', cons: 'No way to stay in one channel without a jump; deep sections are far down.' },
  { id: 'P8', name: 'Quick-link pills that push a screen', examples: 'Apple News 26.2 (Sports, Puzzles, Politics, Food), Pinterest search guides', pros: 'Nothing to keep in sync with the feed; scrolls away harmlessly.', cons: 'Navigation dressed as chips; eBay and Material warn against it unless the push is obvious.' },
  { id: 'P9', name: 'Whole-page paging with a thin ribbon', examples: 'NYT Home ribbon, Guardian section bar, Google News Headlines', pros: 'Each channel can have its own layout; orientation stays visible.', cons: 'When channels only re-sort the same cards it reads as a filter bar; this is the two-row look.' },
  { id: 'P10', name: 'Segmented control plus one trailing menu', examples: 'App Store Top Charts, Mail scope bar', pros: 'Two dimensions in one row with two visibly different controls.', cons: 'Segments cap at about five on iPhone; the menu hides the value unless the title echoes it.' },
];

export interface Guidance {
  source: string;
  says: string;
  url: string;
}

export const guidance: Guidance[] = [
  { source: 'Material 3, Tabs', says: 'Primary tabs "should be used when just one set of tabs are needed"; secondary tabs exist "when a screen requires more than one level of tabs" and use "a simpler style of indicator" (a full-width 2dp line, no icons) so the two levels never look the same.', url: 'https://m3.material.io/components/tabs/guidelines' },
  { source: 'Material 3, Chips and segmented buttons', says: 'Filter chips "filter content" and are "a good alternative to toggle buttons"; segmented buttons are "for simple choices between two to five items", for more "use chips".', url: 'https://m3.material.io/components/chips/guidelines' },
  { source: 'Apple HIG, Segmented controls', says: '"Use a segmented control to provide closely related choices that affect an object, state, or view"; "no more than about five segments on iPhone"; for separate sections "use a tab bar instead".', url: 'https://developer.apple.com/design/human-interface-guidelines/segmented-controls' },
  { source: 'Apple HIG, Searching', says: '"Use a scope bar to filter among clearly defined search categories", "default to a broader scope", "clearly display the current scope".', url: 'https://developer.apple.com/design/human-interface-guidelines/searching' },
  { source: 'Nielsen Norman Group, Tabs, Used Right', says: '"Mixing in-page and navigation tabs within one tab control will disorient users"; keep a single row, since stacking makes the selection indicator "ambiguously positioned"; "tabs should all look and work the same".', url: 'https://www.nngroup.com/articles/tabs-used-right/' },
  { source: 'Nielsen Norman Group, Mobile Subnavigation', says: 'Lists accordions, sequential menus, section menus and landing pages as sub-navigation; a second tab row is not among them.', url: 'https://www.nngroup.com/articles/mobile-subnavigation/' },
  { source: 'Nielsen Norman Group, Carousels on Mobile', says: 'People reach the last item in three or four steps and stop; "dots are generally weak signifiers"; a partially visible item is the strongest cue that there is more.', url: 'https://www.nngroup.com/articles/mobile-carousels/' },
  { source: 'Baymard, Applied filters', says: 'On mobile show half or more of the last chip, fade the edge and state the count; never add arrows to a chip row.', url: 'https://baymard.com/blog/how-to-design-applied-filters' },
  { source: 'eBay Playbook, Filter chip', says: '"Don’t use filter chips to navigate users to new experiences or views. Use tabs instead."', url: 'https://playbook.ebay.com/design-system/components/filter-chip' },
  { source: 'Reddit, Sept 2022', says: 'Replaced top feed tabs with a title dropdown to have "fewer options competing for attention on the main screen"; swipe remained "the primary way most redditors switch".', url: 'https://www.socialmediatoday.com/news/reddit-launches-updated-feed-switching-process-as-part-of-broader-ui-reasse/631380/' },
  { source: 'Apple News, iOS 26.2', says: 'Channels stay sections inside the Today feed; four quick-link pills deep-link to sections; Following got its own tab so the channel list is one tap away.', url: 'https://9to5mac.com/2025/11/04/ios-26-2s-apple-news-app-has-a-new-and-improved-design/' },
];

export const researchSources: string[] = [
  'https://m3.material.io/components/tabs/guidelines',
  'https://m3.material.io/components/chips/guidelines',
  'https://developer.apple.com/design/human-interface-guidelines/segmented-controls',
  'https://developer.apple.com/design/human-interface-guidelines/searching',
  'https://www.nngroup.com/articles/tabs-used-right/',
  'https://www.nngroup.com/articles/mobile-subnavigation/',
  'https://www.nngroup.com/articles/mobile-carousels/',
  'https://baymard.com/blog/how-to-design-applied-filters',
  'https://playbook.ebay.com/design-system/components/filter-chip',
  'https://www.socialmediatoday.com/news/reddit-launches-updated-feed-switching-process-as-part-of-broader-ui-reasse/631380/',
  'https://piunikaweb.com/2026/02/25/new-reddit-ui-navigation-and-search/',
  'https://techcrunch.com/2024/11/27/threads-now-lets-you-swipe-between-different-feeds-right-from-the-home-screen',
  'https://techcrunch.com/2022/03/23/instagram-launches-chronological-and-favorites-feeds-for-all-users-but-they-cant-be-the-default',
  'https://9to5google.com/2024/12/13/google-news-redesign-bottom-bar/',
  'https://9to5mac.com/2025/11/04/ios-26-2s-apple-news-app-has-a-new-and-improved-design/',
  'https://newsroom.spotify.com/2022-08-09/spotifys-new-home-feeds-make-discovering-your-new-favorites-easy/',
  'https://support.google.com/youtube/thread/7032195/new-in-the-subscriptions-tab-%E2%80%93-tap-channel-icons-to-filter-by-channel?hl=en',
  'https://wan-ifra.org/2025/06/read-play-swipe-the-strategy-behind-the-new-york-times-app-revamp/',
  'https://designcompass.org/en/2025/05-1tp-3tea/12/the-guardian-ux-redesign/',
  'https://news.airbnb.com/airbnb-2025-summer-release',
  'https://about.flipboard.com/inside-flipboard/add-topics-to-your-flipboard-home/',
  'https://techcrunch.com/2023/09/20/substack-redesigns-its-mobile-app-to-boost-discovery-and-engagement',
  'https://interestingengineering.com/culture/the-artifact-news-app-guide',
];

// Measured or documented numbers behind the two row components. D =
// documented, M = measured from the shipped product or source, E = estimated.
export const specFacts: [string, string][] = [
  ['Material 3 primary tabs', '48dp; indicator 3dp, rounded top, label width; scrollable rows start 52dp in; "at five or more tabs the container becomes cramped" (D).'],
  ['Material 3 secondary tabs', '48dp; indicator 2dp flat full width; active label on-surface, not primary; "always placed below primary tabs" (D).'],
  ['Material 3 filter chip', '32dp, 8dp corners, 8dp gap, 16dp side margin, selected = tonal fill with a check (D). Never a single option; scroll or wrap to two rows (D).'],
  ['Apple segmented control', '32pt, capsule on iOS 26; "no more than about five segments on iPhone"; for sections "use a tab bar instead" (D).'],
  ['X home tabs', '53px row; 4px rounded indicator the width of the label; weight 500 to 700 on selection; 16px inset when scrollable (M).'],
  ['Bluesky feed tabs', 'Text 16px semibold, 10px vertical padding, 2 to 3px indicator, unselected at 70% opacity, selected tab auto-scrolled into view (M, source).'],
  ['YouTube home chips', '32px pills, 8px gap, 12 to 16px inset, black fill when selected, 5% tonal fill at rest, no border; the header scrolls away and the chip row pins; 4 to 5 chips visible at 375 to 393 with the last one cut, no fade, no arrows (M/E).'],
  ['Spotify chips', '32px pills, brand fill when selected; picking a parent shows a round X chip at the start plus sub-chips (M).'],
  ['iOS title menu', 'A chevron after the 17pt title opens a menu; iOS 26 adds a subtitle and a large-subtitle view for a filter button under a large title (D).'],
  ['Viewport budget', 'Safe top plus header 44 plus segments 44 plus chips 56 = 203pt on a 393×852 phone, 24% of the height before the tab bar; with one 44px row pinned it is 147pt, 17% (D for sizes, arithmetic ours).'],
];

export const differentLevels: [string, string][] = [
  ['Shape family', 'Level 1 is text with an indicator on the bar surface; level 2 is contained shapes (pills). Nobody ships two underline rows.'],
  ['Container tone', 'Tabs sit on the header surface with a hairline; chips sit on the content surface (Spotify puts them on the page, not in the header).'],
  ['Scale', 'Tabs use the full 44 to 48 row as hit area; chips are 32px objects inside the row with air around them. Type size stays the same; fill and radius do the work.'],
  ['Spacing grammar', 'Tabs abut with internal padding; chips have an explicit 8px gap and a 16px margin.'],
  ['Selected treatment', 'Tabs: colour plus a moving indicator. Chips: fill inversion or a tonal fill with a check. Never an underline on both.'],
  ['Persistence', 'Only one row pins. YouTube pins the chips and collapses the header; X pins the tabs; Spotify pins neither.'],
  ['Gesture', 'Tabs page with a horizontal swipe; chips filter in place and never respond to a page swipe.'],
];
