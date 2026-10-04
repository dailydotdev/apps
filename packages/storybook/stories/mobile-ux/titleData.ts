// How each page names itself on a phone today (2026-09-29 captures and code)
// and what it becomes under one title line. Sizes are the design-system
// classes: mega3 36, large-title 32, title1 28, title2 24, title3 20, body 17.

export interface TitleRow {
  page: string;
  today: string;
  size: string;
  place: string;
  proposed: string;
}

export const titleRows: TitleRow[] = [
  { page: 'Home feeds', today: 'No title; the logo in the sticky row', size: 'Logo', place: 'Sticky logo row', proposed: 'Unchanged: the logo is the title of Home.' },
  { page: 'Explore (/posts)', today: 'No title; a search field and the sort tabs (the "Explore" breadcrumb is desktop only)', size: 'None', place: 'Sticky header', proposed: '"Explore" at title2, first in content.' },
  { page: 'Search results', today: 'No title; the query sits in the search field', size: 'Field', place: 'Sticky header', proposed: 'The query at title2 with the counts as the meta line.' },
  { page: 'Happening now', today: '"Happening Now" in an animated gradient with a copy-link icon', size: 'large-title 32, gradient', place: 'In content, scrolls away', proposed: 'No title: it is a Home segment and the segment carries the name.' },
  { page: 'Tags directory', today: '"Explore tags" centred over two lines of marketing copy, under the tag navbar', size: 'large-title 32, centred', place: 'In content', proposed: '"Tags" at title2, left, one meta line.' },
  { page: 'Tag page', today: 'The tag name centred, "Tag · 44.4K stories" under it, description, Follow · Block · link', size: 'large-title 32, centred', place: 'In content', proposed: 'The tag name at title2, left, meta line, description, Follow full width.' },
  { page: 'Sources directory, Leaderboard', today: 'No title on phones (breadcrumbs and the v2 hub header are desktop only); Sources shows only a Suggest new source button', size: 'None', place: 'Sticky logo row', proposed: '"Sources" and "Leaderboard" at title2.' },
  { page: 'Source page', today: 'Source name beside a 40px logo inside a bordered card, a visible breadcrumb above it', size: 'title2 24, left', place: 'In content', proposed: 'Unchanged size: mark, name, meta line; the breadcrumb and the card go.' },
  { page: 'Squads directory', today: '"Squads" as bold body text, left, in the same row as New Squad (or Log in and Open app for visitors)', size: 'body 17, left', place: 'In content, not sticky', proposed: '"Squads" at title2 as the first content line.' },
  { page: 'Squad page', today: 'Squad name (h1) under the 112px cover and 80px avatar, left, with the verified badge; description, meta line, stats, Join', size: 'title2 24, left', place: 'In content', proposed: 'The reference: mark, name, meta line, then description, stats and Join.' },
  { page: 'Profile', today: 'Name (a paragraph, not a heading) with the Plus badge, handle, join date, bio, stats; "Profile" in the back bar, which turns into avatar + name + reputation once scrolled', size: 'title2 24 in content; body 17 in the bar', place: 'Both', proposed: 'Avatar, name, handle line, once; the bar goes.' },
  { page: 'Activity (/notifications)', today: '"Notifications" as bold body text with a gear, then the filter bar', size: 'body 17 (h2), left', place: 'In content', proposed: '"Activity" at title2 with the bell as trailing icon.' },
  { page: 'Bookmarks and folders', today: 'No visible title on phones: the "Bookmarks" or folder heading is desktop only, so the page opens on the logo row, a Bookmarks tab and the list', size: 'None (title3 on desktop)', place: 'Sticky strip', proposed: '"Bookmarks" at title2 with a meta line; the lists are segments below.' },
  { page: 'History, Following', today: 'No visible title: History opens on a search field, Following on the strip tab', size: 'None', place: 'Sticky strip', proposed: 'Both at title2.' },
  { page: 'Custom feed', today: 'Feed name in the chip strip only', size: 'Chip', place: 'Sticky strip', proposed: 'A Home segment; no title (like Happening now).' },
  { page: 'Settings pages', today: 'AccountPageHeading: back arrow + section name in a 56px sticky row (title3 from tablet up); the settings menu drawer says "Settings" the same way', size: 'body 17 bold', place: 'Sticky row', proposed: 'Section name at title2 first in content; the floating back button replaces the row.' },
  { page: 'Squad Manage, Members, Rules', today: '56px row with back and the section name ("Manage React Israel", "Members", "Rules")', size: 'body 17 bold', place: 'Top row', proposed: 'Same as Settings.' },
  { page: 'Post page', today: 'No page title; GoBackHeaderMobile above the post. The post title is large-title 32 in the classic page and title3 20 in the redesign', size: 'None', place: 'Sticky row', proposed: 'Unchanged: the post title is the content.' },
  { page: 'Feed settings, New custom feed', today: 'Feed name centred in the modal bar as bold body text; "New custom feed" as bold body text with a Plus badge', size: 'body 17', place: 'Modal bar', proposed: 'Title2 in the sheet header.' },
  { page: 'Search filters drawer', today: '"Filters" with a close button', size: 'title3 20', place: 'Drawer header', proposed: 'Title2 like every sheet header.' },
  { page: 'Agents', today: '"Agents" as a 13px footnote in the top row; the agent page shows the topic name truncated at 13px in a 48px bar', size: 'footnote 13', place: 'Top row', proposed: 'Title2 in content; the workspace keeps its bar for now (a drawer).' },
  { page: 'Plus, Cores', today: 'Plus: marketing headline at 32; Cores: "Get More Cores" as bold body text, centred, under an icon', size: 'large-title 32 / body 17', place: 'In content', proposed: 'Marketing pages keep their own headline scale; they are not shell pages.' },
];

export const titleRules: [string, string][] = [
  ['Pages: the name beside the back button', 'Bookmarks, Tags, Settings, Search, History, Following and every settings or manage section show their name as plain bold text (title3, 20px) right after the back button, in the same top row as the action buttons. No box behind it, X\u2019s "‹ Post" model. It is fixed with the buttons; content passing under it fades and blurs (the soft scroll edge), no band.'],
  ['Things: the name in the hero, then in the row', 'Squads, profiles, tags and sources keep their name in the hero (title3, 20px, the same size as in the row, with the mark or avatar) and the top row shows the same name once the hero\u2019s name line has scrolled under it. Nothing appears twice at the same time.'],
  ['Roots: the name in the brand row', 'Explore, Squads and Activity put their name (title3, the same 20px as beside a back button) where Home puts the logo, with the streak and avatar on the right, and the row slides away on scroll exactly like Home\u2019s.'],
  ['One meta line, in content', 'Counts, type or handle sit as a footnote under the hero name or as the first content line under a page name. Never a second heading, never marketing copy.'],
  ['One line, then an ellipsis', 'The row title truncates on one line; the hero name may wrap to two.'],
  ['Never twice', 'A name is never a segment and a title at once (Happening now, custom feeds), and never in the row and the hero at the same moment.'],
  ['Segments never carry the name', 'The row under a title lists views or filters, not the page name again (no "All tags" under Tags).'],
  ['Size ladder', 'A name is 20px wherever it appears: in the top row, in the brand row, in a hero. The post title is 28 and nothing else in the shell is above 20. Home is the exception: its title is the logo, at production\u2019s proportions.'],
];
