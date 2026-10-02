export interface SpecRow {
  value: string;
  apple: string;
  ours: string;
  source: string;
}

export interface ComboRow {
  app: string;
  screen: string;
  bars: string;
  whileScrolling: string;
  takeaway: string;
  source: string;
}

// Filled from the 2026-09-28 research passes: Apple's iOS 26 tab bar
// measurements and how apps combine two bottom bars.
export const chromeResearch: {
  spec: SpecRow[];
  combos: ComboRow[];
  shrink: { title: string; body: string }[];
  sources: { label: string; url: string }[];
} = {
  spec: [
    { value: 'Capsule height, expanded', apple: '62pt (bar frame inside an 83pt container)', ours: '56px at rest, icons only (Instagram\u2019s proportion); 62px in the labelled variant', source: 'https://developer.apple.com/forums/thread/796986' },
    { value: 'Side margin', apple: '21pt on a 402pt screen', ours: '20px on 375 (same ratio); four tabs keep 66px slots', source: 'https://www.learnui.design/blog/ios-design-guidelines-templates.html' },
    { value: 'Bottom margin', apple: '21pt from the physical bottom, about 8pt above the home indicator', ours: 'max(8px, env(safe-area-inset-bottom) - 26px) + 8px, which lands at the same place on Face ID phones', source: 'https://github.com/ryanashcraft/FabBar' },
    { value: 'Corner radius', apple: 'height / 2, a true capsule', ours: 'rounded-max (9999px); never rounded-full, which is elliptical here', source: 'https://developer.apple.com/design/human-interface-guidelines/tab-bars' },
    { value: 'Inner padding, wall to selection lens', apple: '4pt', ours: '4px', source: 'https://github.com/ryanashcraft/FabBar' },
    { value: 'Icon', apple: 'Filled SF Symbol, about 22 to 24pt box, medium weight; the glyph never switches outline to filled, only tint changes', ours: '24px DS icon; we do switch to the filled variant on selection because our outline icons read thin on glass', source: 'https://developer.apple.com/design/human-interface-guidelines/tab-bars' },
    { value: 'Label', apple: '10pt SF Pro semibold (measured cap height 7pt; one guide says 11)', ours: 'Off by default (Instagram, X, Facebook); 10px medium when the labelled variant is on', source: 'https://www.learnui.design/blog/ios-design-guidelines-templates.html' },
    { value: 'Icon to label gap', apple: 'about 6pt; 13pt above the glyph and 13pt below the baseline', ours: '4px, because our icon box carries 2px of its own padding', source: '' },
    { value: 'Item width', apple: 'Equal slots that fill the capsule at three or more tabs; two tabs get fixed 96pt slots, capsule leading-aligned', ours: 'Equal slots, four tabs', source: 'https://apps.apple.com/us/app/photos/id1584215428' },
    { value: 'Selection lens', apple: 'Capsule inset 4pt, one slot wide, about 6% darker than the bar in light mode, 10% white in dark; slides between items', ours: 'color-mix(text-primary 8%) capsule, inset 4px, 200ms spring between slots', source: 'https://developer.apple.com/forums/thread/817936' },
    { value: 'Selected item colour', apple: 'Icon and label tinted with the app accent; only the selected item takes colour', ours: 'Filled glyph in text-primary (black on light, white on dark); no brand purple', source: 'https://developer.apple.com/forums/thread/793700' },
    { value: 'Unselected item colour', apple: 'Primary label colour, not secondary (unselectedItemTintColor is ignored in 26.0)', ours: 'text-primary at 72%; the fill carries the state (Instagram)', source: 'https://developer.apple.com/forums/thread/793700' },
    { value: 'Detached circle (Search role)', apple: 'Diameter equals the bar height (62pt), 8pt gap to the capsule, about 20pt semibold glyph', ours: 'Create button 62px, 8px gap, 24px plus glyph', source: 'https://developer.apple.com/videos/play/wwdc2025/284/' },
    { value: 'Minimized height', apple: 'About 46 to 49pt: an icon-only circle of the selected tab at the leading side, search button stays trailing at the same reduced size, accessory inline between them', ours: '46px compact row; all four tabs stay (Instagram shrink), the accessory folds inline beside one Home button', source: 'https://www.hackingwithswift.com/quick-start/swiftui/how-to-make-a-tabview-minimize-on-scroll' },
    { value: 'Material', apple: 'Regular Liquid Glass: over white about 4 to 5% darker than white plus a 0.5 to 1px light rim; dark glass in dark mode', ours: 'Flat blur, production\u2019s recipe: blur-baseline surface (88%) over a 40px backdrop blur, hairline ring, soft shadow; no rim or highlight', source: 'https://developer.apple.com/design/human-interface-guidelines/materials' },
    { value: 'Shadow', apple: 'Soft, low alpha, roughly 0 8px 24px at 8 to 12%', ours: '0 1px 2px at 18% plus 0 12px 32px -12px at 50% in dark mode', source: '' },
    { value: 'Changes since 26.0', apple: '26.1 Clear / Tinted toggle (Tinted = more opaque, same geometry); 26.4 App Store folded Search back into the capsule and stopped minimizing; iOS 27 adds a transparency slider and merges search back in Music, Podcasts, News, TV. No geometry changes', ours: 'Our Create button is an action, not search, so the 26.4 retreat from the detached search does not apply; the tinted look is our Android default', source: 'https://9to5mac.com/2026/02/23/ios-26-4-makes-two-app-updates-that-bring-back-ios-18-designs/' },
  ],
  combos: [
    {
      app: 'Apple · iOS 26 tab accessory',
      screen: 'Music mini player, any app with tabViewBottomAccessory',
      bars: 'Accessory capsule stacked above the tab bar on its own glass, "matching its appearance"',
      whileScrolling: 'Tab bar minimizes to the selected tab as a small circle; the accessory "animates down to display inline with the tab bar" and drops controls to fit',
      takeaway: 'The system answer to two bars: stack at rest, one row when minimized. Our post page copies it.',
      source: 'https://developer.apple.com/videos/play/wwdc2025/284/?time=1164',
    },
    {
      app: 'Apple · iOS 26 Search tab',
      screen: 'Photos, Music, App Store, Health, Books',
      bars: 'Search is a detached circle at the trailing edge; tapped, "the search button expands into a search field, and the other buttons collapse"',
      whileScrolling: 'The circle stays visible even when the tab bar is minimized',
      takeaway: 'A field, a tab bar and a keyboard never coexist: when the field is focused the tabs fold away. Our Explore follows that once typing starts.',
      source: 'https://nilcoalescing.com/blog/SwiftUISearchEnhancementsIniOSAndiPadOS26/',
    },
    {
      app: 'Apple · Safari 26 Compact',
      screen: 'Every page',
      bars: 'Back button, URL capsule, menu circle in one row; no second bar',
      whileScrolling: 'Elements shrink to a minimized size and bounce back on scroll-up, tracking the gesture',
      takeaway: 'The button, bar, button row and the continuous shrink we borrow.',
      source: 'https://9to5mac.com/2025/09/15/iphone-ios-26-safari-new-compact-design/',
    },
    {
      app: 'X',
      screen: 'Post detail',
      bars: '"Post your reply" input row stacked directly above the tab bar; both visible until the field is focused (observation, unverified)',
      whileScrolling: 'Static',
      takeaway: 'Two bars stacked, no minimize. The starting point we improve on.',
      source: 'https://socialbee.com/blog/twitter-updates/',
    },
    {
      app: 'Reddit (May 2026)',
      screen: 'Post detail',
      bars: 'Docked "Add a comment" composer owns the bottom; tab bar hidden on the leaf (composer verified via changelog, hidden bar unverified). Main bar cut to three glass tabs',
      whileScrolling: 'Static',
      takeaway: 'The Material-style split: nav bar on roots, toolbar on leaves. What Tsahi did not want for us.',
      source: 'https://piunikaweb.com/2026/05/20/reddit-liquid-glass-ios-update/',
    },
    {
      app: 'YouTube (May 2025)',
      screen: 'Watch page and comments',
      bars: 'Dropped the mini player docked above the tab bar for a floating picture-in-picture window; comments open as a sheet over the player',
      whileScrolling: 'n/a',
      takeaway: 'Even YouTube found the docked accessory "too obtrusive"; a stacked second bar wants to shrink or float.',
      source: 'https://9to5google.com/2025/05/21/youtube-miniplayer-update/',
    },
    {
      app: 'Instagram (2026)',
      screen: 'Post and reel comments',
      bars: 'Comments are a bottom sheet with the field inside it, above the keyboard; the floating tab bar is covered, not stacked (unverified)',
      whileScrolling: 'The floating bar shrinks on scroll in feeds',
      takeaway: 'Sheets, not stacks, for typing. Our comment field expands into a sheet.',
      source: 'https://piunikaweb.com/2026/02/13/instagram-liquid-glass-navbar-update-whatsapp-delay/',
    },
    {
      app: 'Material 3 Expressive',
      screen: 'Guideline',
      bars: '"Show the navigation bar on primary pages, and toolbars on subsequent pages with actions"; docked toolbar and navigation bar "should not be shown at the same time"',
      whileScrolling: 'n/a',
      takeaway: 'Google forbids the stack outright. Our inline fold satisfies the spirit: one row while reading.',
      source: 'https://m3.material.io/components/toolbars/guidelines',
    },
    {
      app: 'Telegram, Apple Notes, Apollo',
      screen: 'Chat, editor, comments',
      bars: 'The leaf screen swaps the tab bar for a toolbar or input bar (Telegram ships a glass tab bar on roots)',
      whileScrolling: 'n/a',
      takeaway: 'The HIG-consistent version of "the tab bar morphs into the action bar". Ours keeps one tab circle so the way back is visible.',
      source: 'https://github.com/TelegramMessenger/Telegram-iOS/issues/1889',
    },
  ],
  shrink: [
    {
      title: 'Instagram feels continuous, probably is not',
      body: 'Coverage only says the bar "shrinks as you scroll". Instagram draws its own bar (it does not match the system one), and the likeliest mechanism is a two-state collapse that tracks the finger for the first few tens of points, then commits. That tracking is what makes it feel smooth. Users still complained it invites mis-taps.',
    },
    {
      title: 'Apple\u2019s minimize is discrete, Chrome Android\u2019s is the proportional reference',
      body: 'tabBarMinimizeBehavior exposes only triggers and end states, no progress value. Chrome for Android keeps a "shown ratio" from 0 to 1 that follows the scroll delta 1:1 during the gesture, then snaps to 0 or 1 when a gesture ends half way. That is the model we adopt: proportional while the finger is down, never left half-size.',
    },
    {
      title: 'Direction and hysteresis are the difference between smooth and twitchy',
      body: 'Headroom-style thresholds: nothing collapses inside the first ~100px from the top, collapse needs ~12px of downward travel, reveal needs ~4px of upward travel so coming back is faster than going away. Clamp scrollY to the document range so Safari\u2019s rubber band at the top never reads as a scroll-up.',
    },
    {
      title: 'The web can drive it with no JavaScript on the scroll path',
      body: 'CSS scroll-driven animations (animation-timeline: scroll(root), animation-range: 0 96px) are in Safari 26 and Chrome 115+, and Safari 26.4 runs them on the compositor. They give size as a function of offset; direction and the snap on scrollend stay in a small JS state machine. Scroll-state container queries are Chromium-only for now.',
    },
  ],
  sources: [
    { label: 'WWDC25 284: tab bar minimize and the bottom accessory', url: 'https://developer.apple.com/videos/play/wwdc2025/284/?time=1164' },
    { label: 'Apple DTS: UITabBar frame on iOS 26 (62pt in an 83pt container)', url: 'https://developer.apple.com/forums/thread/796986' },
    { label: 'Apple DTS: selection background and tints on iOS 26', url: 'https://developer.apple.com/forums/thread/817936' },
    { label: 'FabBar: an iOS 26 tab bar recreation with hard-coded constants', url: 'https://github.com/ryanashcraft/FabBar' },
    { label: 'learnui.design: iOS 26 design guidelines', url: 'https://www.learnui.design/blog/ios-design-guidelines-templates.html' },
    { label: '9to5Mac: iOS 26.4 folds Search back into the capsule', url: 'https://9to5mac.com/2026/02/23/ios-26-4-makes-two-app-updates-that-bring-back-ios-18-designs/' },
    { label: 'WWDC25 323: accessory placement (.expanded / .inline)', url: 'https://developer.apple.com/videos/play/wwdc2025/323/' },
    { label: 'MacStories iOS 26 review: minimized tab bar and inline accessory', url: 'https://www.macstories.net/stories/ios-and-ipados-26-the-macstories-review/3/' },
    { label: 'Nil Coalescing: the Search tab morph', url: 'https://nilcoalescing.com/blog/SwiftUISearchEnhancementsIniOSAndiPadOS26/' },
    { label: 'Chromium docs: browser controls shown ratio and snap', url: 'https://chromium.googlesource.com/chromium/src/+/main/docs/ui/android/browser_controls.md' },
    { label: 'Headroom.js: offset and tolerance hysteresis', url: 'https://wicky.nillia.ms/headroom.js/' },
    { label: 'WebKit: scroll-driven animations in Safari 26', url: 'https://webkit.org/blog/17333/webkit-features-in-safari-26-0/' },
    { label: 'WebKit: Safari 26.4 moves scroll-driven animations to the compositor', url: 'https://webkit.org/blog/17862/webkit-features-for-safari-26-4/' },
    { label: 'caniuse: animation-timeline: scroll()', url: 'https://caniuse.com/mdn-css_properties_animation-timeline_scroll' },
    { label: 'Chrome: scroll-state container queries', url: 'https://developer.chrome.com/blog/css-scroll-state-queries' },
    { label: 'Material 3: toolbars guideline (never with a navigation bar)', url: 'https://m3.material.io/components/toolbars/guidelines' },
    { label: '9to5Google: YouTube drops the docked mini player', url: 'https://9to5google.com/2025/05/21/youtube-miniplayer-update/' },
    { label: 'PiunikaWeb: Reddit Liquid Glass update', url: 'https://piunikaweb.com/2026/05/20/reddit-liquid-glass-ios-update/' },
  ],
};
