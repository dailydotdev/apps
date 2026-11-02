/**
 * Field research for the widget hero, October 2026. Every pattern links to the
 * source it was checked against; anything we could not verify is left out.
 */
export type ResearchPattern = {
  product: string;
  pattern: string;
  lesson: string;
  url: string;
};

export const researchPatterns: ResearchPattern[] = [
  {
    product: 'iOS · Smart Stack',
    pattern:
      'Drag one widget onto another to stack up to 10. Smart Rotate surfaces the timely one; Widget Suggestions slips in widgets you never added. Both are per-stack switches.',
    lesson:
      'Overflow becomes depth, not width, and the reader can turn the magic off.',
    url: 'https://support.apple.com/en-us/118610',
  },
  {
    product: 'iOS · WidgetKit',
    pattern:
      'Widgets score their own relevance with a duration. A score of zero is never rotated up, and the system caps how often anything rotates.',
    lesson:
      'Rotation needs an honest score and a frequency cap, or it feels random.',
    url: 'https://developer.apple.com/documentation/widgetkit/widget-suggestions-in-smart-stacks',
  },
  {
    product: 'iOS 18 · Resize',
    pattern:
      'In jiggle mode you drag a corner handle, and it snaps only between the sizes the widget supports.',
    lesson: 'A handful of sizes on a grid, never free-form.',
    url: 'https://www.macrumors.com/guide/ios-18-home-screen',
  },
  {
    product: 'StandBy',
    pattern: 'Two Smart Stacks side by side, each swiped vertically.',
    lesson: 'Two stacks are enough to make a glanceable dashboard.',
    url: 'https://www.tapsmart.com/tips-and-tricks/ios17-standby/',
  },
  {
    product: 'Android · Widgets',
    pattern:
      'A widget declares its default cells and resize bounds, and ships a layout per size breakpoint.',
    lesson:
      'Design every widget for each size it allows, not one layout stretched.',
    url: 'https://developer.android.com/develop/ui/views/appwidgets/layouts',
  },
  {
    product: 'Pixel · At a Glance',
    pattern:
      'A fixed strip whose content the system picks: date, events, weather, alerts.',
    lesson: 'A fixed, system-owned slot can coexist with user widgets.',
    url: 'https://9to5google.com/2023/10/06/at-a-glance-widget-redesign-pixel/',
  },
  {
    product: 'macOS · Desktop widgets',
    pattern:
      'Widgets fade back when you open an app, and never sit over your windows.',
    lesson: 'Widgets should recede when the reader is busy with the feed.',
    url: 'https://sixcolors.com/post/2023/09/macos-sonoma-review-small-moves/',
  },
  {
    product: 'Windows 11 · Widgets',
    pattern:
      'Widgets beside an MSN feed with ads drew years of complaints; 2026 builds now open on your own widgets, and you can make several dashboards.',
    lesson:
      'When sponsored content outweighs the reader’s own widgets, people abandon the surface.',
    url: 'https://pureinfotech.com/windows-11-widgets-remove-msn-feed/',
  },
  {
    product: 'Firefox · Sponsored shortcuts',
    pattern:
      'Two or three labeled sponsored tiles among your own, dismissible one by one or all off, reporting only aggregates.',
    lesson: 'The most trusted shape for an ad inside a personal surface.',
    url: 'https://support.mozilla.org/kb/sponsor-privacy',
  },
  {
    product: 'Opera · Speed Dial',
    pattern:
      'Partner tiles preinstalled by region; users report deleted ones coming back.',
    lesson: 'A removed ad that returns destroys trust in the whole surface.',
    url: 'https://forums.opera.com/post/148438',
  },
  {
    product: 'YouTube · Masthead',
    pattern: 'One reserved hero slot, sold by impressions or by the hour.',
    lesson:
      'A single premium slot can carry the business without spreading ads everywhere.',
    url: 'https://www.searchenginejournal.com/google-makes-youtube-masthead-ads-available-to-all-advertisers/317957/',
  },
  {
    product: 'Apple TV · Featured row',
    pattern:
      'An editorial row placed above the user’s Up Next drew complaints.',
    lesson: 'Promote ourselves beside the reader’s things, never above them.',
    url: 'https://www.macrumors.com/2022/11/03/tv-app-redesign-featured',
  },
  {
    product: 'Netflix · Billboard',
    pattern: 'Rows, their order and even the artwork are chosen per member.',
    lesson:
      'The default layout can be personal before anyone customizes anything.',
    url: 'https://archive.qconsf.com/node/110208',
  },
  {
    product: 'Polymarket · Hero',
    pattern:
      'Large featured market cards in a carousel, odds and volume up front, news snippets inside.',
    lesson: 'A hero card can carry live data, not just a headline.',
    url: 'https://polymarket.com/',
  },
  {
    product: 'Edge · New tab',
    pattern: 'Focused, Inspirational and Informational presets, plus Custom.',
    lesson: 'Most people pick a preset and never tune single widgets.',
    url: 'https://www.howtogeek.com/659869/how-to-customize-microsoft-edges-new-tab-page/',
  },
  {
    product: 'GitHub · Dashboard',
    pattern:
      'New sections for agent sessions, issues and PRs, 12 items each, with a way back to the old one.',
    lesson:
      'Ship the new layout with an escape hatch; a silent merge in 2023 caused a backlash.',
    url: 'https://github.blog/changelog/2026-10-01-new-dashboard-experience-now-the-default',
  },
  {
    product: 'Notion · Home',
    pattern:
      'Each section’s menu moves it, hides it, or sets how many items it shows.',
    lesson:
      'Editing can live on the widget itself, not only in a big edit mode.',
    url: 'https://www.notion.com/help/home-and-my-tasks',
  },
  {
    product: 'Momentum',
    pattern: 'Core widgets free, more widgets with Plus.',
    lesson: 'Extra widgets or slots can be a Plus perk instead of an ad.',
    url: 'https://www.momentumdash.com/blog/say-hello-to-momentum-plus',
  },
];

export const principles: string[] = [
  'A fixed row budget. Widgets snap to four sizes on the feed’s columns, and the hero never grows taller.',
  'Overflow goes into depth: stacks first, pages second. Never a third row.',
  'Rotation is opt-in per stack, scored by relevance, and capped per session.',
  'Nothing moves while you read it. Rotate on load or after idle, never mid-glance.',
  'One sponsored slot, labeled, fixed in place, dismissible, and off with Plus.',
  'Prefer sponsored versions of widgets the reader chose over a generic display ad.',
  'We promote our own features as suggestions with Keep and Remove, not as squatters.',
  'The page opens on the reader’s own widgets. Sponsored never outweighs them.',
  'One obvious way into edit mode, plus quick actions on each widget.',
  'Interaction scales with size: one tap target when small, several when large.',
  'Start from presets. Most people pick a mode and never tune a single widget.',
  'Nothing disappears on day one: today’s carousel, Happening Now and ad become the default layout.',
];
