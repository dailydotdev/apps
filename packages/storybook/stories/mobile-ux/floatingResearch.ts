export interface FloatingReference {
  name: string;
  shape: string;
  material: string;
  scrolling: string;
  returns: string;
  source: string;
}

export interface Ingredient {
  ingredient: string;
  apple: string;
  web: string;
  verdict: string;
}

// Desk research, 2026-09-28. "Unverified" marks claims found only in
// secondary coverage or search snippets.
export const floatingResearch: {
  references: FloatingReference[];
  callouts: { title: string; body: string }[];
  ingredients: Ingredient[];
  sources: { label: string; url: string }[];
} = {
  references: [
    {
      name: 'Instagram · iOS (Dec 2025 to mid 2026)',
      shape: 'Detached pill with side margins, floating above the bottom edge; 5 tabs Home · Reels · DMs · Search · Profile, Create moved to the top-left',
      material: 'Semi-transparent, blurred Liquid Glass look; icons unchanged',
      scrolling: 'Shrinks ("resizes") as soon as you scroll, all five tabs stay; not a collapse to one icon (unverified whether UIKit minimize or custom)',
      returns: 'Scroll the other way',
      source: 'https://piunikaweb.com/2026/02/13/instagram-liquid-glass-navbar-update-whatsapp-delay/',
    },
    {
      name: 'Instagram · Android (same period)',
      shape: 'Same five tabs and order, docked full width',
      material: 'Opaque; no credible report of a floating or translucent bar on Android (a third-party mod sells "iOS Instagram on Android")',
      scrolling: 'No shrink reported',
      returns: 'n/a',
      source: 'https://minter.io/blog/instagram-launches-new-app-navigation-system-update/',
    },
    {
      name: 'iOS 26 · UITabBar with tabBarMinimizeBehavior',
      shape: 'Floating glass tab bar; optional detached Search circle at the trailing edge',
      material: 'Liquid Glass "regular": blur, adaptive light/dark flip, lensing at the edges, specular rim',
      scrolling: 'onScrollDown: collapses to a small capsule with only the selected tab icon, no label (iPhone only)',
      returns: 'Scroll the opposite direction, tap a tab, or reach the top',
      source: 'https://developer.apple.com/videos/play/wwdc2025/284/',
    },
    {
      name: 'iOS 26 · Safari Compact layout',
      shape: 'Single row: detached URL pill between back and more',
      material: 'Translucent, tints to the page',
      scrolling: 'Elements shrink to a minimized pill on scroll-down',
      returns: 'Bounce back on scroll-up; tap to expand',
      source: 'https://9to5mac.com/2025/09/15/iphone-ios-26-safari-new-compact-design/',
    },
    {
      name: 'Material 3 Expressive · navigation bar (May 2025)',
      shape: 'Docked, full width, 64dp (was 80dp), 3 to 5 destinations',
      material: 'Opaque surface-container; no floating or translucent nav bar exists',
      scrolling: 'None; hide-on-scroll is a per-app choice',
      returns: 'n/a',
      source: 'https://9to5google.com/2025/05/14/material-3-expressive-navigation/',
    },
    {
      name: 'Material 3 Expressive · floating toolbar',
      shape: 'Floating pill above content, for contextual actions; Google says not to pair it with a navigation bar',
      material: 'Opaque standard or vibrant colour',
      scrolling: 'Per app',
      returns: 'n/a',
      source: 'https://9to5google.com/2025/05/18/material-3-expressive-toolbars/',
    },
    {
      name: 'Threads · iOS (May 2026)',
      shape: 'Liquid Glass tab bar rolling out on iOS',
      material: 'Glass',
      scrolling: 'Not described',
      returns: 'Nothing reported for Android',
      source: 'https://www.anotherapple.com/2026/05/threads-liquid-glass-update-is-now-rolling-out/',
    },
    {
      name: 'Reddit · iOS (May 2026)',
      shape: 'Translucent curved bar cut to three tabs',
      material: 'Glass; battery-drain and glitch complaints',
      scrolling: 'Not described',
      returns: 'No Android equivalent reported',
      source: 'https://piunikaweb.com/2026/05/20/reddit-liquid-glass-ios-update/',
    },
    {
      name: 'Arc Search · iOS and Android',
      shape: 'Bottom bar pops in and out of view as you scroll',
      material: 'Opaque',
      scrolling: 'Hide, not shrink',
      returns: 'Scroll-up',
      source: 'https://www.howtogeek.com/arc-search-android-release/',
    },
  ],
  callouts: [
    {
      title: 'Instagram shrinks, Apple collapses',
      body: 'Instagram’s iOS bar keeps all five tabs and gets shorter; UIKit’s own minimize keeps only the selected icon. Users on Reddit and GBNews complained about the shrink ("you’ll instantly hate it"); NN/g criticises the iOS 26 collapse for making people relearn navigation. The shrink is the safer of the two, and it is what Tsahi described liking.',
    },
    {
      title: 'The floating glass bar is an iOS-first pattern everywhere',
      body: 'Instagram, Threads and Reddit shipped it on iOS only. On Android the same apps keep a docked bar or, like Arc, hide it. Google’s own apps use floating pills only for toolbars, never for primary navigation. A floating glass bar on Android is off-platform, and blur over a scrolling feed is the slowest thing a WebView can draw there.',
    },
    {
      title: 'Instagram’s swipe complaint is ours too',
      body: 'The October 2025 layout added swipe-between-tabs; the top complaint was "try to swipe to see photos on a post and end up on a completely different page". Same failure as our Headlines channels (chapter 7): a horizontal gesture with no axis lock.',
    },
    {
      title: 'Apple already ships an opaque mode',
      body: 'iOS 26.1 added a Clear / Tinted toggle after beta feedback, and iOS 27 turns it into a slider from ultra clear to fully tinted. A solid pill is not a downgrade; it is one of Apple’s own two looks.',
    },
  ],
  ingredients: [
    {
      ingredient: 'Blur and luminosity',
      apple: '"Regular" glass blurs and adjusts the luminosity of what is behind it to keep text legible',
      web: 'backdrop-filter: blur(12-20px) saturate(1.6-1.8) plus a color-mix surface fill; Chrome 76+, Safari 18 unprefixed (keep -webkit-)',
      verdict: 'Yes. One layer, bar only.',
    },
    {
      ingredient: 'Specular rim',
      apple: 'Light travels around the silhouette; highlights respond to geometry and interaction',
      web: 'inset 1px highlight on the top edge and a 1px low-alpha ring',
      verdict: 'Yes, static.',
    },
    {
      ingredient: 'Lensing / refraction',
      apple: 'Bends and concentrates light at the edges, stronger as an element grows',
      web: 'SVG feDisplacementMap as a backdrop-filter: Chromium only, rebuilds the map on every geometry change, GPU heavy; Safari and Firefox restrict backdrop-filter to CSS filter functions',
      verdict: 'No. Not in WKWebView, too slow on Android.',
    },
    {
      ingredient: 'Adaptive light / dark flip',
      apple: 'Small elements flip from light to dark based on the background, per pixel',
      web: 'Sample feed luminance with IntersectionObserver and toggle a class; or skip it',
      verdict: 'Approximate at best; skip for v1.',
    },
    {
      ingredient: 'Scroll edge effect',
      apple: 'Content dissolves into the background as it scrolls under glass',
      web: 'A short gradient fade above the bar (what today’s footer already does)',
      verdict: 'Yes, the cheap version.',
    },
    {
      ingredient: 'Accessibility fallbacks',
      apple: 'Reduce Transparency frosts it, Increase Contrast makes it black or white with a border, Reduce Motion drops the elastic bits; 26.1 adds Clear / Tinted',
      web: 'prefers-reduced-transparency: Chrome 118+, not Safari through 27.x; prefers-reduced-motion everywhere. iOS needs a bridge flag (UIAccessibility.isReduceTransparencyEnabled) to see the setting',
      verdict: 'Motion yes; transparency needs the bridge on iOS.',
    },
    {
      ingredient: 'Cost',
      apple: 'Free, it is the system',
      web: 'Blur over moving content re-renders every frame; WebKit cannot cache a blur behind a fixed layer; Chromium and Firefox Android have scroll-jank bugs on record. Rule of thumb: one glass layer, blur under 16px, test on a mid-range Android while scrolling',
      verdict: 'Budget it, and keep a solid twin.',
    },
  ],
  sources: [
    { label: 'Mosseri on Threads, 10 Oct 2025: new tab order, swipe between tabs', url: 'https://www.threads.com/@mosseri/post/DPpGG_IiLgm/' },
    { label: 'Engadget: Instagram tests layout that spotlights Reels and DMs', url: 'https://www.engadget.com/social-media/instagram-tests-new-layout-that-puts-the-spotlight-on-reels-and-dms-215407062.html' },
    { label: 'Minter.io: the navigation update as shipped (Home, Reels, DMs, Search, Profile; Create top-left)', url: 'https://minter.io/blog/instagram-launches-new-app-navigation-system-update/' },
    { label: 'PiunikaWeb: Instagram Liquid Glass navbar on iOS, TestFlight 416', url: 'https://piunikaweb.com/2026/02/13/instagram-liquid-glass-navbar-update-whatsapp-delay/' },
    { label: 'GBNews: users unhappy with the shrinking bar (paywalled, snippet only)', url: 'https://www.gbnews.com/tech/instagram-ios-liquid-glass-update' },
    { label: 'UNILAD Tech: reception of the October 2025 layout', url: 'https://www.uniladtech.com/news/instagram-users-warn-to-not-update-after-latest-change-479742-20251020' },
    { label: 'WWDC25 284: Build a UIKit app with the new design (tab bar minimize, accessory, search tab)', url: 'https://developer.apple.com/videos/play/wwdc2025/284/' },
    { label: 'WWDC25 219: Meet Liquid Glass (lensing, adaptive tint, regular vs clear, no glass on glass)', url: 'https://developer.apple.com/videos/play/wwdc2025/219/' },
    { label: 'Apple HIG: Tab bars', url: 'https://developer.apple.com/design/human-interface-guidelines/tab-bars' },
    { label: 'Apple HIG: Materials', url: 'https://developer.apple.com/design/human-interface-guidelines/materials' },
    { label: 'Apple docs: tabBarMinimizeBehavior', url: 'https://developer.apple.com/tutorials/data/documentation/swiftui/tabbarminimizebehavior.json' },
    { label: 'MacRumors: iOS 26.1 Clear / Tinted toggle', url: 'https://www.macrumors.com/how-to/ios-26-1-reduce-liquid-glass-effects/' },
    { label: 'BGR: iOS 27 translucency slider', url: 'https://www.bgr.com/2191219/ios-27-liquid-glass-fix-customization/' },
    { label: '9to5Mac: Safari 26 Compact, Bottom, Top layouts', url: 'https://9to5mac.com/2025/09/15/iphone-ios-26-safari-new-compact-design/' },
    { label: 'NN/g: Liquid Glass critique', url: 'https://www.nngroup.com/articles/liquid-glass/' },
    { label: '9to5Google: Material 3 Expressive navigation', url: 'https://9to5google.com/2025/05/14/material-3-expressive-navigation/' },
    { label: '9to5Google: Material 3 Expressive toolbars', url: 'https://9to5google.com/2025/05/18/material-3-expressive-toolbars/' },
    { label: 'Android 16 behaviour changes: edge-to-edge enforced', url: 'https://developer.android.com/about/versions/16/behavior-changes-16' },
    { label: 'web.dev: backdrop-filter and its performance caution', url: 'https://web.dev/articles/backdrop-filter' },
    { label: 'caniuse: backdrop-filter', url: 'https://caniuse.com/css-backdrop-filter' },
    { label: 'caniuse: prefers-reduced-transparency', url: 'https://caniuse.com/mdn-css_at-rules_media_prefers-reduced-transparency' },
    { label: 'kube.io: Liquid Glass in CSS and SVG (refraction, Chromium only)', url: 'https://kube.io/blog/liquid-glass-css-svg/' },
    { label: 'CSS-Tricks: Getting clarity on Apple’s Liquid Glass', url: 'https://css-tricks.com/getting-clarity-on-apples-liquid-glass/' },
    { label: 'Threads Liquid Glass rollout (iOS)', url: 'https://www.anotherapple.com/2026/05/threads-liquid-glass-update-is-now-rolling-out/' },
    { label: 'Reddit Liquid Glass update (iOS)', url: 'https://piunikaweb.com/2026/05/20/reddit-liquid-glass-ios-update/' },
  ],
};
