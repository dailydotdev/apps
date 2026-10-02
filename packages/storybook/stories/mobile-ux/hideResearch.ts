// Hide-on-scroll and stickiness benchmarks (2026-09-30 research: Chromium
// source, Material and Apple docs, NN/g, app reports). "Unverified" = no
// written source found; from use only.

export const hideBenchmarks: [string, string, string, string, string][] = [
  ['X, home', 'Bottom tab bar hides (user reports 2023 to 2025); the header with logo and tabs is widely observed to hide too but no written source', 'Compose button (unverified)', 'Any scroll up', 'Not documented'],
  ['X, profile', 'Nothing: the header collapses into a compact name bar', 'Name bar and Posts · Replies tabs stay pinned', 'n/a', 'Collapse scrubs 1:1 with the scroll'],
  ['Instagram, home', 'Top bar (logo, likes, DMs)', 'Bottom tab bar', 'Any upward scroll, "regardless of how far down the list you are"', 'Slide; duration not documented'],
  ['Instagram, profile', 'Only the profile header scrolls away', 'App top bar and Posts · Reels · Tagged tabs stick', 'n/a', '1:1'],
  ['Threads, home', 'Bottom tab bar hides on Home (since May 2024); top bar unverified', 'Unverified', 'Scroll up', 'Not documented'],
  ['YouTube, home', 'Category chips and the bottom navigation bar auto-hide', 'Nothing; a community patch exists to keep the bar', 'Chips return on scroll up', 'Not documented'],
  ['Chrome, URL bar', 'Top controls (bottom controls too when docked)', 'n/a', 'Any upward scroll; immediate in the top half-bar region of the page', '1:1 while dragging; on release snaps to shown or hidden, 75 to 200ms'],
  ['Safari iOS 26', 'The bottom bar minimises to a strip', 'n/a', 'Scroll up, or tap the strip', 'Shrinks and bounces back'],
  ['iOS 26 tab bar', 'Shrinks to a pill with tabBarMinimizeBehavior .onScrollDown (not the default)', 'The bar never leaves', '"Re-expands when scrolling in the opposite direction"; HIG: tap a tab or scroll to the top', 'System animation'],
  ['Material top app bar', '"Can scroll off-screen with the content and return when the user reverse scrolls" (enterAlways, the quick return)', 'With tabs: "the tab bar stays anchored while the toolbar scrolls off", or both scroll off and "the tab bar returns on reverse scroll, the toolbar on complete reverse scroll"', 'Any downward drag', 'snap: 50% rule'],
];

export const hideNumbers: [string, string][] = [
  ['Chromium browser controls', 'Bar tracks the finger 1:1; on release, shown 50% or more animates in, otherwise out; animation 75 to 200ms; controls always shown within half a bar height of the page top; a hide needs enough page below to absorb the counter-scroll and runs once per gesture.'],
  ['Android HideBottomViewOnScrollBehavior', 'No threshold: any consumed downward delta slides the view out in 175ms, upward slides it in over 225ms; disabled under touch exploration.'],
  ['Android AppBarLayout snap', 'Bottom 25% visible or less scrolls off completely; 75% or more scrolls fully in (a 50% rule).'],
  ['NN/g', 'Slide 300 to 400ms "to preserve a natural feel"; keep the header small, contrast it with content, consider a partially persistent header, consider whether it is needed at all.'],
  ['headroom.js', 'Defaults tolerance 0 and offset 0; documented example tolerance up 5px, down 0px; offset up 100px, down 50px.'],
  ['Ours (hideSpec)', 'Hide tolerance 24px, reveal tolerance 8px, scrub distance 64px, dead zone 96px (or the hero on a thing); snap at 50% with a 150ms ease; no hide when the page is shorter than the viewport plus a block.'],
];

export const hideGuidance: [string, string, string][] = [
  ['Apple HIG, Tab bars', '"Make sure the tab bar is visible when people navigate to different sections of your app. If you hide the tab bar, people can forget which area of the app they’re in."', 'https://developer.apple.com/design/human-interface-guidelines/tab-bars'],
  ['Apple HIG, Toolbars', '"Consider temporarily hiding toolbars for a distraction-free experience … do so contextually when it makes the most sense, and offer ways to reliably restore hidden interface elements."', 'https://developer.apple.com/design/human-interface-guidelines/toolbars'],
  ['Apple, TabBarMinimizeBehavior', '"Minimizes the tab bar as soon as someone scrolls down through a feed, and restores it when they scroll back up." Minimising is iPhone only and not the default.', 'https://developer.apple.com/documentation/swiftui/tabbarminimizebehavior'],
  ['Material, scrolling techniques', '"The app bar can scroll off-screen with the content and return when the user reverse scrolls." With tabs, either the tab bar stays anchored or "both scroll off; the tab bar returns on reverse-scroll, the toolbar returns on complete reverse scroll."', 'https://m1.material.io/patterns/scrolling-techniques.html'],
  ['Material 3, navigation bar', '"Upon scroll, the navigation bar can appear or disappear." "Don’t hide the navigation bar on scroll when a screen reader is active."', 'https://m3.material.io/components/navigation-bar/guidelines'],
  ['NN/g, Sticky headers', '"Scrolling down triggers the header to animate out of view and scrolling up triggers the header to animate back into view." "Maximize the content-to-chrome ratio by keeping it small."', 'https://www.nngroup.com/articles/sticky-headers/'],
];

export const pinnedInstead: [string, string][] = [
  ['Profile tabs on X and Instagram', 'The tabs are the page’s own navigation and the compact bar keeps identity and back; hiding them would strand a reader inside one tab. We hide them anyway for one rule everywhere, with a nudge up as the way back; pinning the row on things is the fallback if this tests badly.'],
  ['The bottom tab bar', 'Instagram keeps it and Apple’s HIG asks for it; X, Threads and YouTube hide it and draw complaints about lost tap-to-top and mis-taps. Ours shrinks and never leaves.'],
  ['Material: tabs return before the toolbar', 'The section switcher is worth more than branding, so it comes back first. Ours returns the whole block at once; the row is 44px and the brand row 48, so the difference is small.'],
  ['Chrome near the top', 'Controls are always shown in the top half-bar region and never hide when there is not enough page left to absorb the counter-scroll. Ours has the dead zone and the short-page rule for the same reasons.'],
  ['Screen readers', 'Material disables hide-on-scroll under touch exploration. Ours keeps the block shown when reduced motion or assistive technology is detected.'],
];

export const hidePitfalls: [string, string][] = [
  ['Overscroll', 'Safari fires scroll events during rubber-banding with negative scrollTop and past the end, so a naive direction test flips the block at both edges; clamp to the scroll range and ignore deltas at the edges.'],
  ['Momentum', 'iOS keeps sending scroll events after the finger lifts and the last tick before a bounce can reverse sign; the tolerances and one hide per gesture (Chromium’s rule) handle it.'],
  ['scrollend', 'Reliable in Safari only from 26.2 (December 2025); older WebViews need a 120ms debounced fallback for the snap.'],
  ['Keyboard', 'The visual viewport shrinks, the layout viewport does not, and focus reveals fire scroll events; freeze hide and show while an input has focus.'],
  ['Short pages', 'A page shorter than the viewport plus a block must never hide, or the block cannot be scrolled back.'],
  ['Reduced motion and AT', 'Keep the state change, drop the slide (a 150ms fade), and do not hide at all when a screen reader is active; set scroll-padding-top so focused elements are never under the block.'],
  ['The wrapper', 'A WKWebView shell could use hidesBarsOnSwipe or tabBarMinimizeBehavior natively; ours is web chrome, so the hook handles it and the wrapper only exposes the status bar.'],
];

export const hideSources: string[] = [
  'https://www.nngroup.com/articles/sticky-headers/',
  'https://source.chromium.org/chromium/chromium/src/+/main:cc/input/browser_controls_offset_manager.cc',
  'https://developer.android.com/reference/com/google/android/material/appbar/AppBarLayout.LayoutParams',
  'https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/behavior/HideBottomViewOnScrollBehavior.java',
  'https://m1.material.io/patterns/scrolling-techniques.html',
  'https://m3.material.io/components/navigation-bar/guidelines',
  'https://developer.apple.com/design/human-interface-guidelines/tab-bars',
  'https://developer.apple.com/design/human-interface-guidelines/toolbars',
  'https://developer.apple.com/documentation/swiftui/tabbarminimizebehavior',
  'https://developer.apple.com/documentation/uikit/uinavigationcontroller/hidesbarsonswipe',
  'https://wicky.nillia.ms/headroom.js/',
  'https://caniuse.com/mdn-api_element_scrollend_event',
  'https://9to5mac.com/2025/09/15/iphone-ios-26-safari-new-compact-design/',
  'https://discussions.apple.com/thread/252211948',
  'https://github.com/Bruno-ADH/instagram-profile-sticky-demo',
  'https://github.com/MorpheApp/morphe-patches/issues/3255',
  'https://www.threads.com/@mergesort/post/C7TBUqtuSga',
  'https://github.com/crimera/piko-newx/issues/88',
  'https://lists.w3.org/Archives/Public/public-css-archive/2019Jun/0152.html',
  'https://www.htmhell.dev/adventcalendar/2024/4/',
];
