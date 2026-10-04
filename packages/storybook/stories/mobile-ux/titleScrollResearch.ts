// How platforms and apps keep a page title readable while content scrolls
// under floating controls (2026-09-30 research, WWDC25 sessions, Apple docs,
// Material 3 docs, Slack's iOS 26 write-up). "Unverified" = reproductions or
// memory only.

export const titleScrollBenchmarks: [string, string, string, string][] = [
  ['iOS 26 navigation bar', 'Glass bar buttons; the inline title as plain text (no capsule)', 'The large title scrolls away with the content and the inline title takes over', 'No bar background: "the bar background is now transparent by default". Legibility comes from the scroll edge effect, .soft by default: "a subtle blur and fade effect applied to content under system toolbars".'],
  ['iOS 26 with a pinned accessory (segmented control, column headers)', 'Bar buttons plus the pinned row', 'Inline title', 'The edge effect switches to .hard: "applied uniformly across the height of the toolbar and the pinned accessory view", a frosted band with a hairline, "similar to the standard bar backgrounds in iOS 18".'],
  ['iOS 27 beta (June 2026)', 'Same', 'Same', 'The automatic style now resolves to .hard; .soft must be set explicitly. Beta, may change.'],
  ['iOS 13 to 18', 'The bar with buttons and the inline title', 'Large title collapses to inline', 'Two states: transparent while the content edge touches the bar, the system blur bar once content scrolls under.'],
  ['Slack iOS (iOS 26 redesign)', 'Glass header and floating glass controls', 'The channel title stays in the header, no capsule (a capsule version "felt like a primary button")', 'Content extends to the top edge and passes under the header. Slack tried a gradient "that looks a lot like some of the Apple apps" and dropped it because content varies too much.'],
  ['Instagram profile', 'App bar with the username; profile tabs pin under it', 'The username is the screen title from the start', 'Solid app bar, no blur (from a reproduction; unverified against a primary source).'],
  ['X profile', 'Back and actions; name and post count fade in on scroll', 'Name slides up into the header when the hero name passes it', 'The banner itself, progressively blurred, is the header background.'],
  ['Material 3 top app bar', 'The whole bar', 'Title stays; medium and large bars collapse to small', 'Same colour as the page at rest; fills with surfaceContainer once content scrolls under, no blur.'],
];

export const edgeEffectFacts: [string, string][] = [
  ['What it is', 'An effect the scroll view draws where pinned content overlaps scrolling content: "blurring and reducing the opacity of background content" (HIG Materials). "As content begins to scroll underneath a glass element, the effect gently dissolves the content into the background … allowing floating elements like titles to always remain clear" (WWDC25 219).'],
  ['When it shows', 'Only when scrolled content is under the pinned element: "scroll views automatically show an edge effect when pinned controls overlap them" (WWDC25 356). At the top of the page there is nothing to blur, so the top is plain content.'],
  ['Soft', 'The iOS 26 default on iPhone: "a subtle, blurred boundary between pinned controls and scrolling content", a gradual fade. Apple recommends it "in most cases, especially on iOS and iPadOS".'],
  ['Hard', '"A linear, nearly opaque boundary", applied uniformly across the bar and any pinned accessory, with a hairline; for "pinned table headers" and controls without backgrounds. This is what Apple uses when a segmented control is pinned under the bar.'],
  ['API', 'UIKit: UIScrollView.topEdgeEffect.style (.automatic, .soft, .hard) and UIScrollEdgeElementContainerInteraction for custom pinned bars. SwiftUI: scrollEdgeEffectStyle(_:for:) and safeAreaBar. iOS 26.'],
  ['Titles', '"Large titles are now placed at the top of the content scroll view, and scroll with the content underneath the bar" (WWDC25 284); the inline title remains, as text. Bar button items get glass; the title does not.'],
  ['Web equivalent', 'A fixed element over the scroll with backdrop-filter blur masked by a vertical gradient, under a gradient of the page background; a scroll-driven animation or an IntersectionObserver turns it on once content passes under. No bar element, no border.'],
];

export const titleScrollSources: string[] = [
  'https://developer.apple.com/videos/play/wwdc2025/284/',
  'https://developer.apple.com/videos/play/wwdc2025/323/',
  'https://developer.apple.com/videos/play/wwdc2025/356/',
  'https://developer.apple.com/videos/play/wwdc2025/219/',
  'https://developer.apple.com/documentation/uikit/uiscrolledgeeffect',
  'https://developer.apple.com/documentation/swiftui/scrolledgeeffectstyle',
  'https://developer.apple.com/design/human-interface-guidelines/toolbars',
  'https://developer.apple.com/design/human-interface-guidelines/materials',
  'https://slack.com/blog/news/redesigning-slack-ios26',
  'https://developer.apple.com/videos/play/meet-with-apple/255',
  'https://m3.material.io/components/app-bars/guidelines',
  'https://designfornative.com/what-designers-need-to-know-about-ios-27/',
  'https://www.learnui.design/blog/ios-design-guidelines-templates.html',
];
