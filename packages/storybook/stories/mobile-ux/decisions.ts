// Decisions taken with Tsahi across the review rounds, in order. Each row
// is a call he made, not a proposal; chapters cite them.
export interface Decision {
  round: string;
  decision: string;
  where: string;
  // A later row overturned this one, wholly or in part; the note says how.
  // Developers build from the latest row, never from a superseded one.
  supersededBy?: string;
}

export const decisions: Decision[] = [
  {
    round: '1',
    decision:
      'Scope is the phone shell: tab bar, headers, menus, drawers, how a post opens and closes. Member experience; logged-out prompts are separate PRs.',
    where: '0',
    supersededBy:
      'Round 5: the visitor header (Log in, Open app) is in scope after all; only the logged-out prompts themselves stay separate.',
  },
  {
    round: '2',
    decision:
      'Floating bar, iOS 26 direction, not docked. One layout for both stores; glass on iOS, solid on Android.',
    where: '3b',
    supersededBy:
      'Round 4: no glass; one flat blur material on both platforms.',
  },
  {
    round: '3',
    decision:
      'Match Apple’s proportions (62 / 21 / 8 / 4 / 10pt) as the starting point.',
    where: '3b',
    supersededBy:
      'Round 4: Instagram, X and Facebook proportions, 56px at rest and 44px compact.',
  },
  {
    round: '3',
    decision:
      'Create leaves the bar and becomes its own square button beside it, like the Search button in Photos.',
    where: '3, 3b',
  },
  {
    round: '3',
    decision:
      'Profile leaves the bar for the header avatar; the bar keeps Squads: Home · Explore · Squads · Activity.',
    where: '3',
  },
  {
    round: '3',
    decision:
      'Nothing appears twice: the top chrome never repeats the source, the name or the menu the content already shows (X’s post screen is the model).',
    where: '4',
  },
  {
    round: '3',
    decision:
      'Explore search field floats above the cluster, in our rectangle radius, not a capsule.',
    where: '3b, 3c',
  },
  {
    round: '3',
    decision: 'The post page keeps both bars. Hiding the tab bar is withdrawn.',
    where: '6',
    supersededBy:
      'Round 4: both bars at rest, but on scroll the tab bar slides away and the action bar takes its slot.',
  },
  {
    round: '3',
    decision:
      'Instagram’s shrink is the motion model, improved: continuous and direction-aware.',
    where: '3b',
  },
  {
    round: '3',
    decision:
      'Safari’s row (button, bar, button) is the grammar for every cluster, top and bottom.',
    where: '3b',
  },
  {
    round: '3',
    decision:
      'Every page, menu, drawer and settings screen follows the same system; 27 fixes listed.',
    where: '4b',
  },
  {
    round: '4',
    decision:
      'No circles or capsules anywhere: our rounded rectangle on the bar, the buttons and the field. The radius follows the height (22 at rest, 18 compact) so bar and buttons keep one proportion.',
    where: '3b',
  },
  {
    round: '4',
    decision:
      'No floating title box in the middle of the top row; headings live in the content.',
    where: '3b, 4',
  },
  {
    round: '4',
    decision:
      'Compact means shorter and narrower: the bottom cluster pulls in from the edges as it shrinks. Only the bottom cluster; the top buttons never move or resize.',
    where: '3b',
  },
  {
    round: '4',
    decision:
      'Top back and action buttons are smaller than the bar, Telegram’s proportion: fixed 38px squares, 14px radius, 16px from the edges so they line up with the content padding.',
    where: '3b, 4',
  },
  {
    round: '4',
    decision:
      'Bar proportions follow Instagram, X and Facebook: icons only, 56px at rest and 44px compact, every icon in the primary colour with the active one filled, red badge. Apple’s labelled 62px bar is kept as a variant. No purple in the bar.',
    where: '3b',
    supersededBy:
      'Round 5 (1 Oct 2026): the badge is the brand bubble, purple and a rounded rectangle, not red and not a circle.',
  },
  {
    round: '4',
    decision:
      'The bar’s selection treatment: Tint (filled glyph, nothing behind it) is the default; Lens, Dot and Fill are side by side in Tuning the bar to choose from.',
    where: '3b',
    supersededBy:
      'Round 5 (1 Oct 2026): Tint is decided; Lens, Dot and Fill are reference only.',
  },
  {
    round: '5',
    decision:
      'The bar’s selection look is Tint: the active tab is the filled glyph in the primary colour with nothing behind it. Lens, Dot and Fill stay in chapter 3b for the record.',
    where: '3b',
    supersededBy:
      'Round 7 (1 Oct, Tsahi after seeing Instagram’s bar): the lit tab gets a soft pill behind it (surface-float, the bar’s inner radius) as well as the filled glyph. Press and hold, then move along the bar, and the pill follows the finger with the glyph under it lit; lifting selects that tab. No glass, no magnification.',
  },
  {
    round: '4',
    decision:
      'Explore’s tab icon is a compass so the magnifier only ever means search.',
    where: '3b',
  },
  {
    round: '4',
    decision:
      'Post page: no fold. Both bars at rest; on scroll the tab bar slides below the screen and the action bar takes its slot, shrinking like the Home bar; fully continuous, reversed on scroll-up. The action bar keeps today’s icon set (upvote, downvote, comment, bookmark, share); the comment field is a sheet. A playground shows every state.',
    where: '6',
    supersededBy:
      'Round 5: the comment field opens the full-page composer, not a sheet; the rest stands.',
  },
  {
    round: '4',
    decision:
      'The post action bar and the Explore search field share one accessory height (52 at rest, 44 compact) and one motion.',
    where: '3b, 6',
  },
  {
    round: '4',
    decision:
      'Explore behaves like the post leaf: the search field stays at the bottom as a compact bar while the tab bar slides away on scroll; no folding into a square.',
    where: '3b, 3c',
  },
  {
    round: '4',
    decision:
      'Home feed row is For you · Happening now · Following · +, where Following includes the posts from squads you joined; custom feeds added with the plus become segments. The four-segment row is rejected.',
    where: '4',
  },
  {
    round: '4',
    decision:
      'Text actions (Follow, Join, Read post, Buy cores) never float in the top row; they live once in the content. The floating row holds icon buttons only; Save on a form, as a check icon, is the exception.',
    where: '4',
    supersededBy:
      'Round 5: on things, once the top block is solid, Join or Follow sits at its right edge with the menu just left of it; over the cover only icons show.',
  },
  {
    round: '4',
    decision:
      'Search stays on Explore as the floating field, opening Spotlight. A Home header search icon and a Slack-style Search square beside the bar were both tried and rejected as duplicates; Create is the one square beside the bar.',
    where: '3b, 3c, 4',
  },
  {
    round: '4',
    decision:
      'Home brand row stays flat (logo, streak, avatar) with its slide-away on scroll; a Slack-style floating logo square and streak/avatar pill were tried and reverted. Floating chrome is for leaves and the bottom cluster.',
    where: '4',
  },
  {
    round: '4',
    decision:
      'Search flow documented in 3c: the Explore field opens Spotlight as a full page attached to the top (empty, typing, scoped) that can be dragged down to dismiss; results are a leaf under Explore; back returns to Explore.',
    where: '3c',
  },
  {
    round: '4',
    decision:
      'Menus as sheets, settings as pages: every three-dots menu becomes a grouped action sheet, every drawer uses one sheet primitive, Settings and Feed settings and Squad Manage become pages under You.',
    where: '4b',
  },
  {
    round: '4',
    decision:
      'Explore is a page with a feed: the places (Popular, Discussions, Happening now, Tags, Sources, Leaderboard) on top, then the Explore feed of popular posts, scrollable. Trending tags were dropped in round 5; the feed\u2019s order is a small text menu (Popular ▾) with the period inside the sheet for the two sorts that have one.',
    where: '3b, 4b',
  },
  {
    round: '4',
    decision:
      'No glass effect: the floating material is production\u2019s flat blur (blur-baseline surface at 88% over a 40px backdrop blur, hairline ring, soft shadow), no rim or highlight.',
    where: '3b',
  },
  {
    round: '4',
    decision:
      'The Home brand row slides up continuously with the scroll (height and offset on the same progress) instead of switching states, so the header never jumps.',
    where: '4',
  },
  {
    round: '4',
    decision:
      'The Home segment for the published feed is called Happening now, the name the page already uses, not Headlines.',
    where: '4',
  },
  {
    round: '4',
    decision:
      'Create opens the production composer directly (SmartComposerModal): kind via its KindModePicker chip and audience via its AudienceChip, no drawer in front and no invented Post to bar; posting lands back where you were with the post in view and a toast. The choice sheet and a bar-morph idea are kept as alternatives.',
    where: '3d',
  },
  {
    round: '4',
    decision:
      'Top buttons sit 16px from the edges so their outer edges align with the content padding; the bottom cluster keeps its 20px inset.',
    where: '3b, 4',
  },
  {
    round: '5',
    decision:
      'Tabs follow one grammar: the bar, one segment row (the page\u2019s views) and one chip row (filters of the list under it), never two rows of one level and never a row that repeats a level above it. Links are never tabs.',
    where: '4c',
  },
  {
    round: '5',
    decision:
      'One pinned row per page: segments pin, under the status bar on Home and under the floating buttons on a leaf, where the button band turns solid with them; a page without segments may pin its chip row. No pinned row ever stacks under another pinned bar, and a chip row never sits directly under a segment row.',
    where: '4c',
  },
  {
    round: '5',
    decision:
      'Happening now channels: no second row under the Home segments (it read as two similar bars). The active segment carries a chevron that opens the channel sheet, the choice shows on the list header line with a clear control, and the channel is in the URL. Six other treatments are mocked for comparison.',
    where: '4c',
    supersededBy:
      'Round 7 (1 Oct, on the shell PR): no list header line either. The chevron and its sheet are the only channel control; the sheet marks the channel you are on.',
  },
  {
    round: '5',
    decision:
      'Every segment has a URL and every row has exactly one selected item, from a route prefix; swipe moves segments only, with the axis lock, never chips or the bar.',
    where: '4c, 7',
  },
  {
    round: '5',
    decision:
      'Nine duplicates go: Squads and Happening now stop being Home chips, Popular is one page, /tags loses the strip and the tag navbar, /tags/[tag] replaces its navbar with a back button and Related links, profile and squad tabs get URLs, Bookmarks lists become segments under You.',
    where: '4c',
  },
  {
    round: '5',
    decision:
      'Page titles live in the top header area: pages show the name as plain text (20px, no box) beside the back button; things (squad, profile, tag, source) keep a 24px hero name and the row shows it once the hero scrolls out; roots put the name in the brand row where Home has the logo. In-content headings, 32px and 24px, are withdrawn.',
    where: '4d',
    supersededBy:
      'Round 5: hero names on things are 20px too, one size for a name wherever it appears.',
  },
  {
    round: '5',
    decision:
      'Visitors get the same header, confirmed by Tsahi: Log in and Open app sit where members see the streak and avatar (flat in the brand row on roots, floating beside the back button on leaves), same 38px height and 14px radius; the flat bar and a bottom visitor bar stay on the page as alternatives.',
    where: '4',
  },
  {
    round: '5',
    decision:
      'Which control: two questions. Which list → segments; narrow this list → chips (only where there are no segments); reorder, period or a second dimension → a menu (label + chevron, a sheet). Search results become segments, the Explore sort becomes a menu, Happening now keeps the X-style menu on its segment (Tsahi\u2019s pick).',
    where: '4c',
  },
  {
    round: '5',
    decision:
      'Squad and profile covers run edge to edge under the status bar, X\u2019s profile model: light status text over the image, the floating buttons on top, half-speed parallax, the cover collapsing under the band as the name fades into the row and the segments pin.',
    where: '4',
  },
  {
    round: '5',
    decision:
      'Pinned rows and the top band are solid page background, never translucent: no glass and no see-through blur behind segments or titles. The floating buttons and the bottom cluster keep production\u2019s flat blur material.',
    where: '3b, 4, 4c',
  },
  {
    round: '5',
    decision:
      'Search everywhere: every page that is a searchable list (Explore, Tags, Sources, Squads root, Bookmarks, History, Members, Feed settings sections) gets the Explore field cluster above the tab bar with its own placeholder; pages where search is one action among others (squad page, Following) get a top-row button that opens the same field; the rest have no search. The query is always in the URL.',
    where: '3c',
  },
  {
    round: '5',
    decision:
      'One title size: the page name is 20px wherever it appears, beside the back button on leaves and in the brand row on roots (Explore, Squads, Activity were 24 and are not any more). Things keep a 24px hero name.',
    where: '4d',
    supersededBy: 'Round 5: hero names are 20px.',
  },
  {
    round: '5',
    decision:
      'On scroll the buttons keep floating and the title stays, over the iOS 26 soft scroll edge effect (content blurred and faded under the top, page background fading in), verified against WWDC25 and the HIG. No solid band, no glass. Pinned segments sit on the same fade without a background. Apple\u2019s hard edge (a frosted band) is the fallback if legibility fails.',
    where: '4d, 4c',
    supersededBy:
      'Round 5, later: the whole top block hides while reading down, buttons included, as one solid piece; pinned rows are solid page background; the soft edge survives only as the status-bar fade once the block is hidden.',
  },
  {
    round: '5',
    decision:
      'Hide on scroll, X\u2019s model: reading down hides the top block (brand row plus the page\u2019s row on roots; the pinned row on leaves) and any short scroll up brings it back anywhere in the page. The block scrubs with the finger and snaps at the end; a dead zone at the top; floating buttons stay on leaves; the bottom cluster keeps its shrink. Hiding the buttons or the cluster are arms on the page.',
    where: '4e',
    supersededBy:
      'Round 5, later: revised so the buttons hide with the block and the block is solid page background; see the next row.',
  },
  {
    round: '5',
    decision:
      'Scroll behaviour, revised on review: the whole top block hides as one solid page-background piece while reading down, buttons included, and returns on any short scroll up; things start transparent over the cover and turn solid with the name once the hero has passed; the bottom cluster shrinks and never leaves. The soft scroll edge and the always-floating leaf buttons are withdrawn. Nothing at the top is permanently sticky.',
    where: '4e, 4d',
  },
  {
    round: '5',
    decision:
      'On things, the returning block carries the primary action: once the block is solid it is back, name, then the menu and Join or Follow at the right edge (Tsahi\u2019s pick: the menu just left of the primary action, X puts it after); over the cover only icons show. Rows that start below a hero dock under the name row as sticky content, so nothing crossfades or jumps.',
    where: '4e',
  },
  {
    round: '5',
    decision:
      'The Create square is Material: the same material as the bar with a primary glyph (Tsahi\u2019s pick over the primary fill, which read too dominant on dark). Six other tints stay in chapter 3b for the record.',
    where: '3b',
  },
  {
    round: '5',
    decision:
      'No frame at the top: every page runs under the status bar. The block covers the status area while shown; once it hides, content passes under the clock behind Apple\u2019s soft scroll edge (blur and fade), so the page reads as endless. Covers keep light status text.',
    where: '4e',
  },
  {
    round: '5',
    decision:
      'The three levels are the product\u2019s own chip at three sizes, none filled in the primary colour: segments 32px callout bold with the active one on a soft tonal fill and a hairline (the feed strip\u2019s chip today); filter chips 28px footnote, hairline, the active one tonal; link chips the same with no state; menus text with a chevron. The underline, the track and the filled pills (too dominant) stay in chapter 4c for the record.',
    where: '4c',
    supersededBy:
      'Round 5, later: segments and filter chips are both the 28px chip; segments plain with a tonal active, filter chips outlined with a primary-button active.',
  },
  {
    round: '5',
    decision:
      'Reading the link, X\u2019s way, corrected on Tsahi\u2019s review: the page fills the screen with a small solid top bar (close, domain, share, menu) and the post becomes a bottom drawer with four heights: actions alone while reading (counts fade as it folds), title line and actions at rest, the post and its comments when pulled up, and the full post page when pulled to the top, from which a drag down reveals the link again (a gesture that exists only while a page is behind the post) (X, October 2025). A wrapper feature (WKWebView on iOS because Apple forbids overlays on its Safari view; WebView with a bottom sheet on Android); the mobile web keeps a new tab.',
    where: '6b',
    supersededBy:
      'Round 5, later: the drawer’s bar is the post page’s own capsule at its rest size, counts never fade; the title line alone folds while reading; Read sinks the post into the drawer, nothing slides in from the side.',
  },
  {
    round: '5',
    decision:
      'Rows decided: segments and filter chips are both the product\u2019s 28px chip. Segments are plain tertiary text with the active one on a soft tonal fill and a hairline; filter chips are hairline-outlined with the active one a primary button (black on white, white on black); link chips hairline with no state; menus text with a chevron.',
    where: '4c, 4e',
  },
  {
    round: '5',
    decision:
      'Hero names on things (squad, profile, tag, source) are the same 20px as the block title, not 24: one size for a name wherever it appears. The Home logo uses production\u2019s Logo proportions (icon and wordmark both 18px tall, 4px apart).',
    where: '4d, 4',
  },
  {
    round: '5',
    decision:
      'Commenting opens the same full-page composer everywhere (post page and the in-app browser): the post as a compact card, the field, the toolbar and Post; the bottom comment sheet from round 4 is withdrawn. Opening the link never pushes a screen in from the side: the post page sinks to the bottom and becomes the drawer while the article is revealed behind it, from a normal post page and from the full post page reached by pulling the drawer up alike.',
    where: '6, 6b, 3d',
  },
  {
    round: '5',
    decision:
      'Reading the link: one action bar, never redrawn. The post page’s floating capsule keeps its size, inset, radius and material in every state: on Read the tab row folds away under it and the drawer card rises around it with the title line above; reading folds only the title line away, the bar never shrinks (its compact form belongs to the post page’s scroll, where it takes the tab bar’s slot); pulled up, it is still there over the post. A docked edge-to-edge version was tried and rejected as cut off. No second row of actions, no floating card with a grabber. Device stories render frameless (Phone device mode) so the simulator shows the real viewport.',
    where: '6b, 6',
  },
  {
    round: '5',
    decision:
      'No A/B tests and no experiments anywhere in this work. The shell ships behind one rollout flag with the control default until launch, turned on per phase for everyone, and is read with metrics after the fact. Every alternative in the chapters is reference only; the "A/B arm" verdict is retired.',
    where: '3, 3b, 3d, 4, 4c, 4e, 9',
    supersededBy:
      'Round 5 (1 Oct 2026): no flag either. Nothing in this work is behind a flag or hidden; each step goes live for everyone when it merges.',
  },
  {
    round: '5',
    decision:
      'Android and iOS look the same: the flat blur material on both, no glass on either. Solid is not a platform default; it appears only when the OS asks for reduced transparency or a WebView cannot draw the blur at frame rate.',
    where: '3b, 6, 8',
  },
  {
    round: '5',
    decision:
      'Post page top chrome follows the rule of every page without a cover: back, share and menu are one solid block that hides while reading and returns on any scroll up; no name in the row. The always-floating buttons of chapter 6 are withdrawn.',
    where: '4e, 6, 6b',
  },
  {
    round: '5',
    decision:
      'One scroll progress for everything: the top block and the bottom cluster (tab bar, action bar, search field) move on hideSpec’s numbers (64px travel, 96px dead zone, 24px down and 8px up tolerances, 300ms stop, 140ms scrub, 220ms snap). No fold at p = 0.5 and no haptic on the fold.',
    where: '3b, 4e, 6',
  },
  {
    round: '5',
    decision:
      'Field geometry: the radius follows the height like every other piece (22 at rest, 18 compact); a focused field is 52px everywhere, on a page and inside Spotlight; the mobile web keeps the floating cluster at compact size above Safari’s pill.',
    where: '3b, 3c, 4',
  },
  {
    round: '5',
    decision:
      'Back, history and URLs: a segment change replaces the history entry, a leaf pushes; Spotlight, sheets and the composer are not history entries; inside the reading page back pops the page’s own history first, then closes it; a deep link with no stack goes to the root that owns the URL. Route table in chapter 5.',
    where: '4c, 5, 6b, 7',
  },
  {
    round: '5',
    decision:
      'Destinations: Agents is a row on Explore; Hot takes and Game center are not on Explore; Explore loses its Happening now row (it is a Home segment); New squad first sat in the Squads brand row (revised in 9c: it is the first tile of Your squads and the row is name and avatar); the profile page stays as production has it (about me, achievements showcase, stack, hot takes, workspace photos, reading overview, experiences) with segments About · Posts · Replies · Upvoted, About the default and the Activity block’s tabs promoted to the other three; achievements, streak, DevCard, hot takes and game center are rows in the menu behind the avatar (You), not on the profile page; Share stays on things.',
    where: '3c, 4b, 4c, 4e',
  },
  {
    round: '5',
    decision:
      'The no-shell class: checkout, Plus, onboarding, sign-in, OAuth, join, verification, the invite landing and the permission prompt get no cluster and no floating buttons, one close button top left, system back closes.',
    where: '4b, 5, 8',
  },
  {
    round: '5',
    decision:
      'Reading the link, details: reload lives in the page menu; Share appears once, on the page’s bar; reading is counted as the Read button counts it today, with no scroll percentage; the Open links in the app setting lives under Settings, General.',
    where: '6b',
  },
  {
    round: '5',
    decision:
      'Best-of archives are plain leaves named after the month, reached from the sort menu, where the period (this week, this month, this year, a month in the archive) is one option inside the menu.',
    where: '4c',
  },
  {
    round: '5',
    decision:
      'Sign-up on a gated action: production’s full-screen Sign up stays exactly as it is, same providers in the same order (Google, GitHub, Apple, Facebook), same email step, same terms line, same Log in link, same component, flow and analytics. The only changes are UI: the close button top left instead of the back chevron (the no-shell class) and one line under the title naming what the action gets you, keyed by the trigger. The round 1 login sheet is withdrawn; daily.dev/onboarding and the log-in page are untouched; the visitor header’s Log in opens the log-in page.',
    where: '4, 4b, 7, 9b',
  },
  {
    round: '5',
    decision:
      'Activity root: the trailing icon is the settings glyph, not a bell, because it opens notification settings; a bell on a notifications page reads as more notifications.',
    where: '4d, 4e',
  },
  {
    round: '5',
    decision:
      'The You page behind the avatar: no streak on the name row; every row icon in the same outline treatment (the streak and Core wallet included); order: daily.dev Plus, Custom feeds, My squads, Following, Bookmarks, History; then Your progress (Achievements, Streak, DevCard, Hot takes, Game center); then Core wallet, Invite friends, Settings. Help leaves the list and is the page’s one top-bar action on the right.',
    where: '5, 9b, 9c',
  },
  {
    round: '5',
    decision:
      'Root brand rows, after seeing the avatar-left simulation (9c): the avatar stays on the right and the name or logo on the left. The streak shows on Home only, with the number before the flame; Explore, Squads and Activity carry no streak. The Squads root keeps its avatar; New squad is the first tile of Your squads (look 5 of the five compared in 9c), so the row is name and avatar only.',
    where: '4, 4e, 9c',
    supersededBy:
      'Round 7 (1 Oct, on the shell PR): New Squad is a plus square in the Squads brand row, before the avatar; the Primary button under the title is gone on phones.',
  },
  {
    round: '5',
    decision:
      'The You page: Streak takes the flame outline and Hot takes the megaphone, so every row icon is the same outline weight.',
    where: '9b, 9c',
  },
  {
    round: '5',
    decision:
      'The streak opens a sheet built from the layout v2 streak panel one to one (big count with the 3D fire, gear, longest and total, Today with the timezone, the 30-day calendar, the freeze row, Daily quests); the tier ladder from the milestone rewards work is inside it (the tier held as the hero with its flame artwork and name chip, then Milestones under the calendar: earned, next with reward and days left, the one after); milestones are a separate moment and keep their popup, the one from the Milestone rewards review (the tier’s flame over the ember wash, tier name, count, day strip, Snapshot and Share, No thanks), opening by itself on the milestone day; the drawer never carries the celebration. Every overlay (sheet, composer, Spotlight) covers the whole screen, status bar included. Everything in production’s streak language: pink discs with the white flame for read days, a ring for today, the dashed pattern for freezes, quaternary outlines otherwise; never a check mark, never black. The compact popup sheet is archived.',
    where: '9d',
  },
  {
    round: '5',
    decision:
      'Settings and forms: Settings is a list page of plain leaves; forms are leaves with Save as the check icon top right, dimmed until something changed, no second Save at the bottom; list pages (work experience, education, certifications, projects, custom feeds, blocked content) add with a plus top right; back with unsaved changes asks once in a sheet; destructive actions sit last and red.',
    where: '9d, 4b',
  },
  {
    round: '5',
    decision:
      'The header avatar is the platform’s rounded square, not a circle (circles are for squads and sources): 38px, 14px radius, the hairline ring and soft shadow of the floating top buttons, so it sits in the brand row like every other top control.',
    where: '4, 4e, 9c',
  },
  {
    round: '5',
    decision:
      'Last-pass calls (9e): Agents is a leaf under Explore’s Agents row with segments Agents · Arena · Ask, and an agent wears the circle; creating a squad is one route and one form leaf from the New tile with Save as the check; organization settings is one leaf with segments General · Members · Billing; not found, error and offline stay inside the shell (one line and one way out with the cluster; offline is a strip on top of everything, under the status bar and above the block, that stays while the block hides).',
    where: '9e',
  },
  {
    round: '5',
    decision:
      'States: an empty page carries the one action that makes it fill (Activity: Turn on notifications; Bookmarks: Browse Popular); the lightbox’s close is the header button itself (38px, 14px radius, 16px inset, the page’s material, so it follows the theme), top left over the dark overlay.',
    where: '9e',
  },
  {
    round: '5',
    decision:
      'Last-pass calls, second batch (9e): the tab that lights on a deep link is the root that owns the URL, the place back goes (Home for posts, tags, sources and profiles; Squads for squads; Explore for search and the directories); the Activity count is the only badge, nothing on Squads and nothing on the avatar; Jobs pages are leaves and the candidate flow’s steps are the no-shell class; 360px is the narrowest width and nothing scales with width; iPad keeps the desktop layout; a phone turned sideways keeps the shell, laid out for landscape (chapter 9g).',
    where: '9e, 9g, 3, 5',
  },
  {
    round: '5',
    decision:
      'Landscape (9g): the portrait shell turned. The cluster stays at the bottom, compact by default and centred at portrait width inside the safe areas; the block is one line (name or logo, the segments, streak and avatar) that hides while reading; content at reading width; sheets open from the side; video and the lightbox own landscape. The rail, the corners and the reading-mode looks are reference only.',
    where: '9g',
  },
  {
    round: '5',
    decision:
      'Bottom prompts (9h): the consent banner is a sheet, the same primitive as every menu, covering the status bar and the cluster, accept, reject and choose at one level, on the first page before anything else in the regions that need it; the logged-out Charm footer replaces the cluster at its trigger as merged (#6735) and the logged-in See daily.dev in… sheet covers Home once per snooze window; one owner of the bottom at a time, one sheet at a time, consent first, toasts 12px above whatever owns the bottom and never over a sheet; nothing of this inside the wrappers; Open app may appear in the block and in the footer at once.',
    where: '9h, 4b',
  },
  {
    round: '5',
    decision:
      'Last-pass calls, third batch (9e): editing a post opens the full-page composer, prefilled, Post reading Save, with /posts/[id]/edit as the URL that opens it; visitors see Explore and Squads as members do minus the personal parts (Log in and Open app in the row, no Your squads, no New tile), and the Activity tab and the Create square open the sign-up page directly with its context line.',
    where: '9e, 3d, 4, 9b',
  },
  {
    round: '5',
    decision:
      'Ads (9f): the pinned 320×50 strip takes the top strip slot, under the status bar and above the block, the one thing at the top that never hides, on the public post page and the arbitrage page only; every other unit is content where production puts it, white card and gray label in both themes; no anchor; the auth banner leaves the top for the leaf block’s right slot; the arbitrage page is the visitor post leaf with the cluster, keeping its own rules (noindex, light theme, hard navigation out, read_ads switch). The consent banner follows 9h.',
    where: '9f',
  },
  {
    round: '5',
    decision:
      'No flag, no experiment, nothing hidden: every step of this work goes live for everyone when it merges and deploys, the way the logged-out mobile header shipped. A problem is fixed forward or reverted by a PR. The five steps are an order of delivery, not five switches; the mobile_shell_phase dial is withdrawn.',
    where: '9, 9i',
  },
  {
    round: '5',
    decision:
      'Plus on Home (9k): free members get one door, an icon square (the Plus glyph in the Plus colour on the top-button material, 38px) in the brand row between the streak and the avatar, Home only, hiding with the block, opening the Plus page (no-shell class); members lose the door and are shown by the Plus mark on the logo that production already draws, no badge on the avatar; the You row carries the state (Upgrade, Manage, Renew, Ends on, Through the organization). States and the sale come from the app; no new data.',
    where: '9k, 4, 9c',
  },
  {
    round: '5',
    decision:
      'Counts and dots on the bar follow the product’s own bubble, the one the layout v2 rail uses (Bubble with railCountBubbleClass): the brand colour (accent cabbage) with white bold caption digits, tabular, a rounded rectangle (8px radius) at least 18px square, sitting 4px above and 16px into the icon. Dots are the same colour with rounded corners. Never red, never a circle.',
    where: '3b, 3, 9e',
  },
  {
    round: '5',
    decision:
      'The steps (9, 9i): five, in the order of chapter 9 (fixes; the shell; the places; the post and you; reading the link and the wrappers), the order to be revisited when the implementation plan is written. No time gate: one PR at a time, built, reviewed, merged and QA’d before the next starts, as fast as that allows; the metrics inform the next PR and never hold it. Tsahi decides a step is done; engineering reverts without asking when something is broken.',
    where: '9, 9i',
  },
  {
    round: '5',
    decision:
      'People are always the rounded square, squads and sources always the circle. A person’s avatar takes the radius production’s ProfilePicture gives its size (20 → 6, 24 → 8, 32 → 10, 40 → 12, 48 → 14, 56 → 16, 64 → 18, 96 → 26), in the header, on the profile, in comments, in the composer and the You page alike.',
    where: 'all',
  },
  {
    round: '7',
    decision:
      'Buttons go in the block, not under it (Tsahi, 1 Oct, reviewing dailydotdev/apps#6767): a page never keeps its own button row above the content once the block exists. Applied in the PR: the Squads root carries New Squad as a plus square; Home shows the streak and the quest count beside the Plus square; Happening now loses its channel line and copy link under the segments; search results are a page (back, the query, a Filters square, the field in the row); the squad page block carries Search and the menu, the hero keeps the link and Join; the profile block carries the menu only, the hero keeps Follow and Award; Bookmarks carries Sort, Share and the folder menu in the block, the search field stays in the content.',
    where: '4b, 4c, 10',
  },
  {
    round: '7',
    decision:
      'Page actions are portaled into the block from the page\u2019s own tree (ShellPage renders them into the block\u2019s slot), so an action keeps its page\u2019s providers; the hero copies are gated by viewport in JS, never CSS, so a label exists once in the DOM.',
    where: '10',
  },
  {
    round: '7',
    decision:
      'Going back from a sub-sheet (Not interested, More): a sub-level is the same sheet with its content slid left, never a second sheet stacked on the first. The title row carries a back chevron that slides the first level back in; swipe down or tapping the scrim closes the whole sheet from either level; the Android back button does what the chevron does. The height animates between the two levels.',
    where: '4b',
  },
  {
    round: '7',
    decision:
      'Every page registers its header with the block (Tsahi, 1 Oct, after the Sources page kept a full-width Suggest new source button under it): a route-by-route pass at 393px over 110 member routes; Sources, Jobs, the Core wallet, the briefings, squad moderation, post analytics, Gear, the best-of archives, the experience lists, the squad form, the leaderboard detail and the tag explore page now put their title and actions in the block; the composer hides it. Standalone layouts (Plus, Cores) keep their own header because they never render the block. Headings inside the content (Analytics, Game Center, Daily quests, Worlds) stay: a heading is content, a header row is not.',
    where: '4b, 10',
  },
  {
    round: '7',
    decision:
      'The bar’s selection indicator (Tsahi, 1 Oct, Instagram reference): a soft pill behind the lit tab, slid on the travel curve in 220ms when the root changes; press and hold then move the finger along the bar and the pill follows it, the tab under the finger lights, lifting selects it (a 6px travel threshold keeps taps as taps). The same look as iOS 26’s bar minus the glass: no refraction, no magnification, the flat blur material only.',
    where: '3b, 10',
  },
  {
    round: '7',
    decision:
      'The bar lifts under a finger (Tsahi, 1 Oct, Instagram and iOS 26): a finger on the bar scales the whole bar to 1.04 from its bottom edge, 150ms ease-out in and 220ms on the no-bounce curve out; the per-tab 0.96 press goes, the bar answers as one piece. The pill slides on the no-bounce curve (9l), not the sheet curve. Member-only squares (New Squad, Suggest new source, Job preferences) never render for visitors; the visitor row is Log in and Open app only.',
    where: '3b, 9l, 10',
  },
  {
    round: '7',
    decision:
      'The in-app browser\u2019s controls ride on the drawer (Tsahi, 1 Oct, X\u2019s in-app browser): close, the domain capsule with the page menu, reader and reload sit 10px above the drawer\u2019s top edge over the dimmed page, one thumb away; they fold down with the drawer while reading and go with the page when the post is pulled up. The top of the page is the page, no page top bar. Drawn in 6b for step 4.',
    where: '6b',
  },
  {
    round: '7',
    decision:
      'Step 1 closed against the plan and the chapters (2 Oct, a line-by-line audit of 1.1 to 1.8): the page behind an open sheet is inert (aria-hidden\u2019s inertOthers, every open panel kept live so a sheet opened from a sheet still works); the block carries the offline strip at its top and, once hidden, turns the status area into Apple\u2019s soft scroll edge instead of a solid frame (4e, decision 51); the post edit form puts its title and Post in the block; the last four circles on people (Spotlight rows, the linked profile on the job form, the count in a people stack, the claimed-by chip) are rounded squares; the DropdownMenu spec covers both widths. The sign-up context line, the You page order, the owning-root back, the re-tap and the extension build were already in.',
    where: '4e, 4b, 7, 10',
  },
  {
    round: '7',
    decision:
      'Checked in iOS Safari (simulator) and Chrome (Pixel profile), 2 Oct: a plain tap on the bar worked everywhere but a held finger never dragged in Safari, because Safari turns a long press on a link into its URL preview and cancels the pointer (touch-callout off is not enough). The bar now owns its touches (touchstart prevented on the track) and resolves a touch tap on release the way a drag is, so Safari, Chrome and the wrapper behave the same; a mouse click still goes through the link. The phone menu sheet had no scrim in either browser; it now carries the Drawer\u2019s scrim (overlay-quaternary-onion) drawn by the popper wrapper, with Radix\u2019s will-change cleared so the scrim covers the page, and a tap on it closes the menu.',
    where: '3b, 4b, 7, 10',
  },
  {
    round: '7',
    decision:
      'Server and first paint agree (Chris\u2019s QA, 2 Oct): the phone gates that swap hero controls for block actions read useIsPhone, which says \u201cnot a phone\u201d on the server and on the first client render and settles after mount, so a desktop profile or squad page hydrates clean and keeps its menu and search in the server HTML; the hero copies also carry hidden tablet:flex so a phone never paints them before hydration. The feed page container\u2019s pt-10 made room for the old mobile header; from tablet up only now, which closes the gap under the block on tag, bookmark and other list pages.',
    where: '4b, 4d, 10',
  },
  {
    round: '7',
    decision:
      'Home row with sorting on (Tsahi, 2 Oct, from his phone): the block row lays the segments out beside the sort and feed-settings controls at the row\u2019s own 44px; the old header\u2019s sticky action wrapper and fixed row height stay with the tablet header, since inside the block they drew an empty band under the segments and let the row cover the first card. The You page\u2019s one top action is Feedback, opening the app\u2019s feedback sheet; Help lives in Settings.',
    where: '4, 9b, 10',
  },
  {
    round: '7',
    decision:
      'Sheets, from Tsahi\u2019s phone (2 Oct): every sheet drags to dismiss, menus included (one drag helper shared by the Drawer and the phone DropdownMenu; the close slide starts where the finger let go); the post menu is as tall as the level on screen; a sheet taller than its resting height grows to the top on the first swipe up and reads as a page (square corners), a short drag down returns it, a long drag or flick closes it; inside a form sheet the grabber and the Cancel row pin under the top and the submit pins at the bottom under the thumb; the quest ring opens its panel as a sheet, the last phone popover. Chrome on iOS paints its bars from the phone\u2019s appearance and ignores theme-color; Safari and the wrapper follow it.',
    where: '4b, 7, 9l, 10',
  },
  {
    round: '7',
    decision:
      'The bar and the You page, from Tsahi\u2019s phone (2 Oct): the bar leaves on settings and forms (settings, custom feed new and edit, squad create, edit, manage and moderate, post edit), the way Instagram drops it on Settings and Edit profile, so a half-edited page cannot be abandoned by a tab; content leaves (post, squad, profile, tag, source) keep it. A tap on the lit tab does what X and Instagram do: from a leaf it returns to the root, on the root it scrolls to the top, at the top it refreshes (every mounted query refetches). The You page is one screen with no scroll, X\u2019s mindset in our language: an identity header (avatar, name with the Plus mark, handle, Following and Followers counts that open their lists, then Reputation, Streak and Cores as tiles that open the profile, the streak sheet and the wallet), then only the places nothing else leads to (Profile, daily.dev Plus, Bookmarks, History, Game center, DevCard), then Invite friends, Settings and Help. Following, My squads, Custom feeds, Streak, Core wallet, Achievements and Hot takes left the list because the tabs, the header or the profile already reach them.',
    where: '3, 5, 9b, 10',
  },
  {
    round: '7',
    decision:
      'You is a side drawer (Tsahi, 2 Oct, X\u2019s side menu mirrored): the avatar opens it from the right over the dimmed page, 85% wide, the Help pill and the avatar on its top row, no back button and no title; the page is not pushed aside because the block and the cluster are fixed and transforms would trap them. Rows take the settings page\u2019s touch language, a full-row tint, not the 0.96 press. Reputation and Cores are the v2 rail\u2019s two-cell strip; the streak stays on the Home row. Feed settings is a row; Help opens a sheet with Send feedback and Help center; Settings opens the settings menu, not the profile form; Log out is the last row. The bar and the squares answer a finger like iOS 26 glass within our material: the pill stretches with the finger\u2019s speed (up to 12%), the bar leans up to 10px past its ends, a release away from the bar cancels, and the squares swell to 1.06 under a press. Chris\u2019s review of #6767 is resolved line by line (quest ring outside the streak guard, banners under the block, one back check on history.state.idx, no experiment enrolment from the phone row, a create-post trigger, the menu sheet above modals, /you redirects visitors, drag ignores fields and scrolled lists).',
    where: '3b, 4, 9b, 9l, 10',
  },
  {
    round: '7',
    decision:
      'Revised the same night (Tsahi): the You menu is uncovered, not overlaid: the page slides to the left and the menu sits under it on the right, a layer below the app; the page is inert while away and its fixed chrome fades (a transformed ancestor would pin it). Avatar on the menu\u2019s left, Help on its right, Log out back in Settings. The bar\u2019s feel after a look at the iOS 26 tab bar (WWDC25 sessions 284 and 323, the Liquid Glass HIG, QuickLiquid and the CSS linear() spring method): the lens follows the finger at once on a stiff spring (420/32), squashes along its motion up to 18% keeping its volume, lifts to 1.08 while held, and a release settles on a light 320/24 spring (one small overshoot) sampled into linear(), shared by the bar\u2019s scale and the squares\u2019 press. The one exception to 9l\u2019s bounce-free rule, for the glass pieces only. The bar paints above the Create square. A lit-tab refresh opens a spinner row under the block while the mounted queries refetch.',
    where: '3b, 9b, 9l, 10',
  },
  {
    round: '7',
    decision:
      'The You menu by hand (Tsahi, 2 Oct, X\u2019s interactive reveal): a swipe in from the right edge drags the page open under the finger, dragging the page\u2019s strip or the panel drags it back; the page sits where the finger puts it (no transition), its corner radius and the chrome\u2019s fade follow the same progress; a release settles by a flick first, then the half-way point, the remaining travel taking time in proportion. While away or returning the page is an opaque rounded card with a shadow on its leading edge, because the app paints its background on body and a transformed root would otherwise show the menu through it; the fixed chrome hides at once and returns only once the page has landed.',
    where: '4, 7, 9b, 9l, 10',
  },
  {
    round: '8',
    decision:
      'Reverted the same day (Tsahi): the slide-aside menu made the animation and every overlay opened from it fragile (the feedback form only appeared after the menu closed, since the page was inert and away). You is a standalone page at /you again, behind the avatar, with the block\u2019s back button and the Help pill as its action; everything opened from it (follow lists, the feedback form, the Help sheet) opens in place. The content stays as redesigned: name row, follow counts, Reputation and Cores as two small pills (no card), then Profile, Plus, Feed settings, Bookmarks, History, Analytics, Game center, DevCard; Invite friends, Settings. Analytics joins the list since nothing else on a phone reaches it, and the page takes the block title on phones.',
    where: '4, 7, 9b, 10',
  },
  {
    round: '8',
    decision:
      'The Help sheet carries the v2 rail\u2019s Support menu: Send feedback (the in-app form), Report a bug, Docs, Changelog, Get the mobile app (phone browsers only; the native wrappers and the PWA never see it), then Privacy policy and Terms of service. The browser extension link stays off the phone.',
    where: '9b, 10',
  },
  {
    round: '8',
    decision:
      'No layout jump between the tabs (Tsahi\u2019s recording). The block used to settle in two or three steps after each switch, and the content\u2019s top padding followed every step: the feed name behind the header lagged the route by one render (a state set in an effect), the Explore search slot had no height until its chunk loaded, and the block published its height after paint. Now the feed name derives from the route in the same render, the search slot reserves its 52px, and the block publishes before paint, so a switch is one step together with the page. Measured with a layout-shift observer: zero shift on Home, Explore and Squads switches; the one remaining entry is the legitimate height difference between a two-row and a one-row block.',
    where: '3, 3b, 9l, 10',
  },
  {
    round: '8',
    decision:
      'Settings must be on screen without a scroll (Tsahi): on a phone browser the address bar plus the floating bar hid the last row. Invite friends becomes a pill beside Help in the block (Help, then Invite, both at the right), which empties the second group, so You is one list with no separator; rows are 44px and the identity header loses a little air. Settings ends above the bar on a 393\u00d7660 viewport, the shortest a current phone browser gives.',
    where: '4, 9b, 10',
  },
  {
    round: '8',
    decision:
      'Sheets reach their edges (Tsahi\u2019s Report post recording): a sheet is a header (grabber, title), a scroller and a foot, so a row pinned inside the scroller meets the panel\u2019s edges and nothing scrolls through above the grabber or below the Cancel and Submit bar; under the status bar the grabber keeps clear of it. Titles sit at the left in every sheet. List sheets (Help, Happening now, Sort) and menu sheets run their rows edge to edge like the settings lists, the row\u2019s own 16px inside.',
    where: '4b, 9d, 9l, 10',
  },
  {
    round: '8',
    decision:
      'Two glasses, one base (Tsahi, 2 Oct, corrected twice the same evening): the bottom bar, the block\u2019s squares and pills and the back-to-top square keep the blur-baseline material (production\u2019s footer recipe, opaque enough that a white image behind the bar never takes it). The action pieces, the Create square and the post page\u2019s floating bar, wear the lighter action glass: the surface-float tint over that same base, with the shadow token, so the two read as the same family and the actions stand out. A first cut gave every piece the tint alone, which washed out over white images; a second gave every piece the layered recipe, which Tsahi did not want on the bar and the header pieces.',

    where: '3b, 9l, 10',
  },
  {
    round: '8',
    decision:
      'Back to top returns: a 38px square of the bar\u2019s material above the Create square, at the bar\u2019s inset, on the main feed only; it fades in once a screen of feed has gone by, takes the page to the top and fades out. The bar never hides for it.',
    where: '3b, 5, 10',
  },
  {
    round: '8',
    decision:
      'Chapter 10 audited against the code (routes, events, flags, specs, where things live). One bug: /posts/upvoted, /posts/discussed, /posts/latest and /posts/best-of lit Home through the /posts/ prefix; owningRoot asks isRootView first now, with a shellNav spec. Also: the channel chevron is one button instead of a button inside a link; a You page spec; react-flip-toolkit removed. Plan text corrected where the build moved on (no ?channel=, no /squads/create redirect, no ShellScrollProvider, the lit-tab refresh, the block after hydration, the sweep script and the mobile-shell stories not built). Open by decision: /you adds one follow-counts query (the plan said no new data) and the block is not in the server HTML.',
    where: '10',
  },
  {
    round: '8',
    decision:
      'The block and the bar hide and return as a whole (Tsahi: the bar lurched with the scroll\u2019s speed and duration). The reader no longer scrubs a progress from scroll deltas: Safari delivers scroll events in bursts, during momentum above all, so a scrubbed value with a short transition re-targets from burst to burst and tracks a slow finger. Research: iOS 26 minimises its tab bar as a state change once a scroll down begins (tabBarMinimizeBehavior, WWDC25 session 284) and restores it as a whole; Material\u2019s HideViewOnScrollBehavior slides the view out or in on direction alone with fixed 175ms and 225ms animations. Ours: two states, reading down past 24px hides, 8px up reveals, the 96px dead zone at the top always shows, and both pieces play their own 220ms on the interaction curve. Measured on synthesized gestures: every change is one ~190ms window with even steps; the slow drag that used to move the bar for 800ms now triggers the same 190ms.',
    where: '3b, 4e, 9l, 10',
  },
  {
    round: '8',
    decision:
      'How a sheet closes (Tsahi\u2019s post-menu recording: a grabber that would not drag). Research: Apple\u2019s HIG makes the swipe the expected dismissal and the grabber its sign; Material lists scrim tap, swipe, back and a close affordance in the sheet\u2019s top bar, required for full-height sheets; NN/g adds that the handle is easy to miss, so a visible Close belongs at the top. Ours: every bottom sheet keeps the grabber, the drag (past a third or a flick), the scrim tap and Escape; a sheet with a title carries a small X at the right of the title row (Drawer titles and modal headers rendered as sheets alike); a form sheet keeps Cancel in its bottom bar; a plain menu sheet relies on grabber, drag and scrim like X\u2019s and Instagram\u2019s. The bug itself was WebKit-only: the menu sheet attached its drag in an effect that, under Radix\u2019s own mounting, ran before the panel existed; the ref callback attaches it now, and a closing sheet no longer hands focus back to its trigger.',
    where: '4b, 9d, 9l, 10',
  },
  {
    round: '8',
    decision:
      'Icons follow the app (Tsahi): each shell row and tab uses the glyph production shows for the same concept in the profile menu, the v2 rail and its panels and the shortcuts dock. Changed: History is the eye (not the timer), Invite is the invite glyph (not add-user), Game center is the joystick the rail uses (not the sparkle). Already matching: profile, Plus, feed settings (filter), bookmarks, analytics, DevCard, settings, the help square and the support rows, Home, the compass and the bell. The Squads tab takes the glyph the phone footer always drew for Squads (the source knot), not the desktop rail\u2019s two-people glyph: the bar replaces that footer, and its users know the knot as Squads. Explore keeps the compass of the rail rather than the footer\u2019s AI spark, as decided in chapter 3. The Game center page registers its title with the block on phones.',
    where: '4, 9b, 10',
  },
  {
    round: '8',
    decision:
      'Sheet details (Tsahi, 3 Oct): rules between groups inside a sheet or a list are inset 16px like the settings lists, only the header rule runs edge to edge; the close X wears the float fill in a small square; every modal sheet mounts on the root portal (a modal rendered inside a page, Bookmarks sharing, had put its sheet under the fixed block and bar with a scrim that stopped short); the sheet title row leaves 16px before the content; a sheet locks the page behind it.',
    where: '4b, 9d, 10',
  },
  {
    round: '8',
    decision:
      'One size for everything in the block (Tsahi: the settings back and gear looked off). Measured across 23 routes the back square sat at the same spot on every page; what varied were the actions beside it, 32px and 40px DS buttons next to 38px squares. Rule: an action in the block is a 38px square (icon) or a 38px pill (text), whatever the DS size underneath. Applied to settings Save, feed settings Save and Cancel, Buy Cores, Create Squad, the briefing squares, the post page\u2019s Read pill and menu square, the profile owner\u2019s squares. Pages that showed an empty block title now register one: notification settings, the feed settings sections menu, tag, source and squad pages (the squad\u2019s name).',
    where: '4, 4b, 4d, 10',
  },
  {
    round: '8',
    decision:
      'Sheets grow to the top on a swipe up whatever their content (Tsahi: a short list that would not move; the Claude app\u2019s sheets grow the same way): the swipe pins the resting height and the sheet animates to full and back, menus included. The title row carries the block\u2019s 38px square as its X and no rule under it; the settings menu\u2019s header is the block\u2019s page row. Two WebKit-only bugs fell out of it: a drag attached from an effect ran before Radix mounted the node, and a drag attached from the ref callback was torn down by Radix recomposing its refs on every render, so the callback keeps the drag until a different node arrives.',
    where: '4b, 9d, 10',
  },
  {
    round: '8',
    decision:
      'Composer and settings follow the block (Tsahi\u2019s screenshots, 3 Oct): the composer header\u2019s scheduled-posts, schedule, markdown and close buttons are the block\u2019s squares; the formatting menu is a full-width sheet (the field variant had sized it to its 32px trigger, a strip at the left with unreachable rows); Add link, Schedule post and Report squad open as sheets with the title row; the GIF picker opens on pictures (favorites, else a suggestion\u2019s results). Feed settings: the modal covers the block, so it draws the page row itself (back to the sections menu, then to the feed; the feed\u2019s name; Save). Settings: the sections menu is the page behind every section, so a section\u2019s back opens it and the \u22ee square is gone; closing the menu goes back in the app. A page may own its back (ShellPage onBack).',
    where: '4, 4b, 9d, 10',
  },
  {
    round: '8',
    decision:
      'A sheet is under the finger the whole time (Tsahi: the swipe up flipped it straight to full, and the keyboard covered the Add link sheet). It rides down 1:1, grows as the finger pulls it toward the top and shrinks as the finger comes down from full; nothing snaps while a finger is down; a release settles on the nearest stop (rest, full) with a flick deciding first, and a release past a third of the resting height or a quick downward flick dismisses: iOS detents, the Claude app\u2019s sheets. The sheet\u2019s overlay is the visual viewport, like the full-screen drawer\u2019s, so a field inside a sheet raises the keyboard without covering it.',
    where: '4b, 7, 9d, 10',
  },
  {
    round: '8',
    decision:
      'The You page hides the bottom bar (Tsahi, 3 Oct): You is a menu, not a place to browse from, so its back square is the one way out, as on settings and forms; the list gains the bar\u2019s room on short phones.',
    where: '3b, 4, 9b, 10',
  },
  {
    round: '8',
    decision:
      'Back goes up the hierarchy, not through history (Tsahi, 3 Oct: You, Settings, sections, feed settings, then back looped inside settings). A section\u2019s back opens the sections menu; the menu\u2019s back leaves settings as a whole, past every settings page in history in one move, to the page the member came from, You when there is none; You\u2019s back goes home; feed settings goes one level up the same way (to the menu when opened from it, else to the feed). iOS Settings and X do this. A small ordered route stack in sessionStorage (pops told apart from pushes through popstate, Next no longer numbers its entries) gives every back its target. Feed settings on a phone is one header row the width of the page with the feed\u2019s name, and its sections are the settings menu\u2019s rows.',
    where: '4, 9d, 10',
  },
  {
    round: '8',
    decision:
      'A sheet\u2019s release settles, nothing else moves (Tsahi\u2019s recording, 3 Oct: the formatting menu jumped to the bottom and slid in again on release). A menu sheet\u2019s enter animation was switched off while a finger was down and restored on release, and a restored CSS animation starts over. The sheet is marked entered once its enter animation has ended, or when a drag starts, and an entered sheet keeps no enter animation. Rule for every sheet: the only motion on release is the height settling to the nearest stop.',
    where: '4b, 9d, 10',
  },
  {
    round: '8',
    decision:
      'Chapter 10 re-audited against #6767 on 3 Oct (Tsahi\u2019s ask): the status table gained 3.1, 3.3, 3.4, 3.5, 3.6 and 3.9 as partly shipped (the shell PR carried their header, back, Save, sheet and composer halves); the flag, route and event tables now say what the branch does under each (no flag added, feed_chips not evaluated on phones, one new sign-up trigger value, /you live, the bar leaving forms and You); a new events table and a new ordered list of the next PRs (2.B search first, then 3.1 the capsule, 2.C covers, 2.D hubs, settings and forms as one PR, the bottom, the content moves, feel, then the wrappers).',
    where: '10, 9j',
  },
  {
    round: '8',
    decision:
      'Device pass on #6767 (Tsahi\u2019s ask, 3 Oct): ten Chromium device profiles (Samsung S8 and S9+, Pixel 7, iPhone SE, 13 mini, 14, 15 Pro Max, Chrome-on-iOS UA, two landscapes), members on 22 routes and visitors on 9, eight geometry checks and five interactions per device, plus Safari on the simulator for 40 pages. Portrait is clean on every size; the You list scrolls only on a 568px screen. One fix: the old phone visitor header (logo, Log in, Open app) no longer doubles the block on tag, highlights, best-of and source pages. Landscape above 656px is the tablet layout by the breakpoint (3.8 stays open); the 320px Home row ends in a hard cut (minor).',
    where: '4, 4b, 9g, 10',
  },
  {
    round: '8',
    decision:
      'The real iPhone inside the wrapper (Tsahi connected his phone, 3 Oct) found what Safari cannot: the app draws under the status bar and keeps a 62px inset, and five things ignored it. Sheets sat 62px too low; a full-height sheet double-counted the inset; the hidden block left its last row under the clock; the page behind a menu jumped by the inset (the menu\u2019s scroll lock zeroes the body\u2019s padding); the menu sheet\u2019s rows jumped by the inset at full height. Rule from now on: anything fixed to the top, sized to the viewport or covering the status bar is checked with --safe-area-top at 62px, and a sheet that covers the status bar pads its content by exactly how far it has entered it. The wrapper build pointed at the preview is the test for that; post permalinks hop to production in such a build unless the build rewrites them.',
    where: '4b, 8, 9d, 10',
  },
  {
    round: '8',
    decision:
      'The inset family, swept (Tsahi, 3 Oct: the action bar sat behind the bottom bar in the app; check the whole app for the pattern). --shell-bottom now includes the home-indicator inset and everything above the bar is sized from it; a sheet with a height in vh is a bug now that its overlay is the visual viewport (Spotlight is 90% of its overlay); the phone ad strip, the block and the content stack in that order; pages without the bar still end above the home indicator; a sheet that overrides the drawer\u2019s padding restates the bottom inset; a page with its own fixed call to action loses the bar. Older inset bugs outside the shell were fixed in the same PR on Tsahi\u2019s word (the safe-area rules, full-height modals, scroll targets, DevCard, welcome, World, the bars under a pinned page); the onboarding top bar, the recruiter pages and the consent card stay open.',
    where: '3b, 4b, 6, 9f, 9h, 10',
  },
  {
    round: '8',
    decision:
      'No hover on a touch screen (Tsahi, 3 Oct: the last row of the feed settings list was lit when it opened). A touch screen keeps hover on whatever lands under the last tap. Buttons take hover only where a pointer can hover; list rows a phone shows take their hover background through the mouse screen; pressed states carry the feedback on touch. Then Tsahi\u2019s rule replaced that pass: no hover on a phone, but a row answers the finger while pressed, as on X. The hover: variant is redefined for the whole app: hover where a pointer can hover, the pressed state on touch, in its original place in the cascade (a spec holds it). The mouse-only prefixes were reverted. group-hover stays as it is, because a dozen controls are revealed by it. On a phone the settings menu marks no current row.',
    where: '9l, 4b, 10',
  },
  {
    round: '8',
    decision:
      'A post opens from what the feed already fetched, and a hard load paints in place (Tsahi, 3 Oct: a post takes too long to open in the app, and the action bar starts behind the bottom bar then jumps). The list cards linked to the absolute permalink; Next prefetched the post under one data URL and navigated under another, so every tap paid a round trip (150 to 290ms on production), and on any other origin (previews, the test build on his phone) every tap was a full page load. Cards, their comment link and history rows link to the same-origin path now: about 15ms from touch to post on the preview build, normal and throttled network. Compared with the server paint (JavaScript off), a hard-loaded phone page had five things that moved once React started: the toast wrapper from the second review broke hydration on every page (React 418/423, the tree rendered twice), the action bar took its clearance after hydration, the column had no room held for the top block, an empty desktop header painted over the content, and the post page held a 48px placeholder for the old back header. All five are fixed; the post page hard-loads with zero console errors and the action bar in place from the first frame. Left for their own PRs: the block itself in the server HTML (Squads directory and search still move 40 to 48px once), the ad strip that pushes the post page 66px, and the widgets that still open posts with a full page load.',
    where: '6, 9f, 9g, 10',
  },
  {
    round: '8',
    decision:
      'The top block is in the server HTML (Tsahi, 4 Oct: do the server-render follow-up here, and compare with what engineering did on layout v2). Layout v2 and the phone shell share one cause of trouble: the frame of the app depends on something the server does not know when it prebuilds a page (v2: a flag, a session, laptop width; the shell: the screen width). Decide on the first client render and hydration fails; decide after it and the frame swaps in late. Engineering’s rule on v2 (#6453, #6587, #6726): the first render is the same on the server and the client, the client-only answer applies from the second render on, and the room for the frame is held up front. The block follows it now: the server and the first client render emit both the block and the wider header, CSS shows one, and only this screen’s stays mounted afterwards. The column holds the height the block rests at on this route (page row, root row, the rows Home, Squads and Explore keep, the field on search). Measured at 393px: the block is in the JavaScript-off paint on every route, main sits at the same top before and after hydration on ten routes, the Squads directory and search no longer move, no hydration message names the block at phone, tablet or desktop width. Page titles and the session’s controls still fill in after hydration, inside the row.',
    where: '6, 9f, 9g, 10',
  },
  {
    round: '8',
    decision:
      'Widgets and lists open a post inside the app, and the ad strip stays as it is (Tsahi, 4 Oct). Similar posts, a collection’s related posts and the squad post list were plain anchors, a full page load on production too; Best discussions, a highlight’s Read more, the reposts list, the topic sign-up previews and the two creator analytics links pointed at the absolute permalink. All use the same-origin post path now, with viewport prefetch off on the widgets as Best discussions already had it; six queries return the slug so the address keeps its slug form. The phone ad strip: the page has to decide whether to hold the strip’s 66px before it knows who is visiting, so either visitors or members see one move on a cold post load. Tsahi chose members: nothing is held, members never see a move, visitors see the article pushed down when the ad loads, as on production. No change to the strip.',
    where: '6, 9f, 10',
  },
  {
    round: '8',
    decision:
      'The composer’s Post to sheet shows the whole list (Tsahi’s screenshot, 4 Oct: the squad list cut mid-row at full height, nothing to scroll). The picker is a popover on wider screens, with a list capped at 240px that scrolls under its header; on a phone that capped list stayed a second scroller inside the sheet, so a swipe up grew the sheet instead of scrolling the list. The cap applies from tablet up; on a phone the sheet scrolls as one piece and its rows take the sheet’s 48px height and 16px inset. No other menu nests a capped list.',
    where: '4b, 9d',
  },
  {
    round: '8',
    decision:
      'A menu sheet’s list fills the sheet (Tsahi’s recording, 4 Oct: the Post to list stayed six rows behind a curtain while the sheet was pulled up, and appeared only after release). The list kept its own height cap until the sheet was marked expanded. The sheet owns the height now: it rests at up to 70% of the screen and the list fills whatever height the sheet has, so a long list shows as much as fits at rest and a pull up uncovers more as it goes. Short menus still size to their rows.',
    where: '4b, 9d',
  },
  {
    round: '8',
    decision:
      'The Post to sheet takes a sheet’s title row (Tsahi, 4 Oct: make the title and Reset consistent with the other drawers). On a phone the title is 20px bold at the left, as in every sheet, and Reset is a pill of the close square’s material, height and inset; dimmed and inert when there is nothing to reset. The desktop popover keeps its small label and text link.',
    where: '4b, 9d',
  },
  {
    round: '8',
    decision:
      'Every sheet that names itself uses the sheet’s title row (Tsahi, 4 Oct: are there more drawers whose title needs fixing or is missing). Each modal and drawer that opens as a sheet on a phone was opened and measured. Seven were off: Set a reminder showed its title twice; Squad notifications had a 28px title with the X beside it; the achievement picker, showcase and comparison and Intro quests drew their heading in the body and had no X on a phone; search Filters built its own row; the form sheets (report, New Folder) set their title at 17px. All take the row now: 20px bold at left 16, the close square at right 8 (form sheets keep Cancel and Submit instead of an X). Left as they are by design: hero and celebration sheets with a centred headline, confirmations, action menus, and the See daily.dev in sheet (out of scope, Tsahi).',
    where: '4b, 9d',
  },
];
