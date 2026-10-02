// The scroll behaviour of the phone shell (chapter 4e), decided with Tsahi:
// nothing at the top is permanently sticky. The top block hides while you
// read down and comes back on any short scroll up. Only the bottom cluster
// (and the page's search field) stays.

export interface StickRule {
  element: string;
  atRest: string;
  readingDown: string;
  scrollUp: string;
  why: string;
}

export const stickRules: StickRule[] = [
  {
    element: 'Top block on a root (brand row + the page’s row)',
    atRest: 'Solid page background: logo or page name with streak and avatar, then the segments or chips',
    readingDown: 'Slides up and out as one block after 24px of downward movement; scrubs 1:1 with the finger; snaps at the end',
    scrollUp: 'Comes back as one block after 8px of upward movement, anywhere in the page',
    why: 'Reading is the job of the page; the row is one nudge away, which is what X, Instagram and YouTube train people to expect.',
  },
  {
    element: 'Top block on a page (back, name, actions + segments or chips)',
    atRest: 'Solid page background with the buttons, the name and the row',
    readingDown: 'The whole block hides, buttons included (Tsahi’s pick: Activity’s behaviour on every page)',
    scrollUp: 'Back as one block; back and the actions are one nudge away, the edge swipe works at any time',
    why: 'One rule for roots and pages; no page keeps a bar while another does not.',
  },
  {
    element: 'Top block on a thing (squad, profile, tag, source)',
    atRest: 'Transparent over the cover or the hero: only the buttons show, floating',
    readingDown: 'When the hero has passed, the block turns solid and takes the name, the segments and the primary action (Join or Follow alone on the right, the menu moving beside back); then it hides like any block',
    scrollUp: 'Comes back solid with the name; at the very top it turns transparent again over the cover',
    why: 'The hero is the page at rest; once it is gone the name and the segments are what you need, then reading takes over. X keeps its profile bar pinned; we treat it like every other block so the rule stays one.',
  },
  {
    element: 'Segments and chips',
    atRest: 'In the block (roots, pages) or in the content under the hero (things)',
    readingDown: 'Travel with the block; never pinned alone',
    scrollUp: 'Return with the block',
    why: 'A row pinned on its own is the two-bar problem from chapter 4c in another form.',
  },
  {
    element: 'Bottom cluster (tab bar + Create)',
    atRest: 'Full size',
    readingDown: 'Shrinks and pulls in (chapter 3b), never leaves',
    scrollUp: 'Grows back',
    why: 'The bar is the way out of every page; Instagram, X and YouTube all keep it.',
  },
  {
    element: 'Page search field (Explore, Tags, Squads, Bookmarks, History, Members)',
    atRest: 'Above the cluster',
    readingDown: 'Stays as a compact bar in the cluster’s slot while the tab bar slides away (chapter 3c)',
    scrollUp: 'Full size again with the tab bar',
    why: 'Search is the page’s main action; it stays within reach without a top bar.',
  },
  {
    element: 'Post page',
    atRest: 'Back and actions floating, both bars at the bottom',
    readingDown: 'Chapter 6: the tab bar slides out, the action bar shrinks; the top buttons hide with the same block rule',
    scrollUp: 'Both return',
    why: 'Decided in round 4; only the top buttons join the block rule now.',
  },
  {
    element: 'Status bar',
    atRest: 'Not a frame: the block covers it while shown; over a cover the status text is light on the image',
    readingDown: 'Once the block is gone the content runs under the clock behind a small edge, Apple-sized: the status bar\u2019s height plus a short tail, a light blur and a fade that is mostly gone at the bar\u2019s bottom edge, so the page reads as endless',
    scrollUp: 'The block returns and covers it again',
    why: 'Tsahi\u2019s call: no frame at the top; the same edge effect Apple uses under floating controls, here only behind the status bar.',
  },
];

export interface PageScroll {
  page: string;
  block: string;
  row: string;
  bottom: string;
  note: string;
}

export const pageScrolls: PageScroll[] = [
  { page: 'Home', block: 'Logo, streak, avatar', row: 'For you · Happening now · Following · + (with the block)', bottom: 'Cluster shrinks', note: 'The Happening now menu travels with its segment.' },
  { page: 'Explore', block: 'Explore, streak, avatar', row: 'None; the places and the feed heading are content', bottom: 'Field stays compact; tab bar slides away', note: 'The sort menu scrolls with the feed heading.' },
  { page: 'Squads root', block: 'Squads, streak, avatar', row: 'Category chips join the block once Your squads and Discover have passed', bottom: 'Field stays compact', note: 'Until then the chips are content.' },
  { page: 'Activity', block: 'Activity, settings, streak, avatar', row: 'Type chips (with the block)', bottom: 'Cluster shrinks', note: 'The model Tsahi picked; everything else follows it.' },
  { page: 'Bookmarks', block: 'Back, Bookmarks, sort, menu', row: 'Lists as segments (with the block)', bottom: 'Field stays compact', note: 'Buttons hide with the block.' },
  { page: 'Tags directory', block: 'Back, Tags', row: 'None pinned; Recommended and the A to Z index are content', bottom: 'Field stays compact', note: 'The index is a jump list, not navigation to pin.' },
  { page: 'History, Following, Settings', block: 'Back, name (+ actions)', row: 'Settings sections have segments with the block', bottom: 'History keeps the field; the others the cluster', note: '' },
  { page: 'Search results', block: 'Back, the query, Filters', row: 'Posts · Squads · People · Tags (with the block)', bottom: 'Cluster shrinks', note: 'The counts line is content.' },
  { page: 'Tag page, source page', block: 'Back, actions; the name joins once the hero has passed', row: 'None', bottom: 'Cluster shrinks', note: 'Roadmaps and Follow are content.' },
  { page: 'Squad page, profile', block: 'Transparent over the cover; solid with the name once the hero has passed', row: 'Posts · About or Posts · Replies · Upvoted join the block with the name', bottom: 'Cluster shrinks', note: 'Cover parallax as in chapter 4.' },
  { page: 'Post page', block: 'Back, share, menu', row: 'None', bottom: 'Tab bar slides out, action bar shrinks (chapter 6)', note: 'Comment opens a sheet.' },
];

// The one-glance decision per page: Hides = leaves while reading, back on a
// nudge up; Stays = never leaves; Shrinks = stays, smaller; Content = scrolls.
export const stickVerdicts: [string, string, string, string, string, string][] = [
  ['Home', 'Hides', 'Hides (with the block)', 'n/a', 'Shrinks', 'n/a'],
  ['Explore', 'Hides', 'Content (no row)', 'n/a', 'Shrinks', 'Stays compact'],
  ['Squads root', 'Hides', 'Hides (docks under the name row once reached)', 'n/a', 'Shrinks', 'Stays compact'],
  ['Activity', 'Hides', 'Hides (with the block)', 'n/a', 'Shrinks', 'n/a'],
  ['Bookmarks', 'Hides', 'Hides (with the block)', 'Hides (with the block)', 'Shrinks', 'Stays compact'],
  ['Tags directory', 'Hides', 'Content (A to Z index)', 'Hides', 'Shrinks', 'Stays compact'],
  ['History, Following', 'Hides', 'n/a', 'Hides', 'Shrinks', 'Stays compact (History)'],
  ['Search results', 'Hides', 'Hides (with the block)', 'Hides', 'Shrinks', 'n/a'],
  ['Settings sections', 'Hides', 'Hides (with the block)', 'Hides', 'Shrinks', 'n/a'],
  ['Tag page, source page', 'Hides (solid only after the hero)', 'n/a', 'Hides; Follow joins the solid block', 'Shrinks', 'n/a'],
  ['Squad page, profile', 'Hides (transparent over the cover, solid after the intro)', 'Hides (docks under the name once reached)', 'Hides; Join or Follow joins the solid block', 'Shrinks', 'n/a'],
  ['Post page', 'Hides', 'n/a', 'Hides', 'Shrinks (action bar); tab bar slides out', 'n/a'],
];
