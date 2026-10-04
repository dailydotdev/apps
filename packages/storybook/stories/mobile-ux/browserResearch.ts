// In-app browser benchmarks and platform constraints (2026-09-30 research:
// press coverage of X's October 2025 change, Apple and Google developer
// docs, App Review Guidelines, NN/g, app source where public). U = not
// verified by a written source.

export const browserBenchmarks: [string, string, string, string, string][] = [
  ['X, iOS (Oct 2025 on)', 'The page opens over the post and "the post collapses to the bottom of the page so people can react while reading" (Nikita Bier). Sheet versus full cover: U', 'Custom WKWebView, replacing the Safari view it had used since 2015 (Firtman; X developer forum, v11.42)', 'Like, Reply, Repost and Save on the collapsed post; the bar hides on scroll down and returns on scroll up', 'Settings: "Use in-app browser" toggle; Reader mode test in Nov 2025 (U)'],
  ['X, iOS (2015 to 2025)', 'Modal Safari view (page sheet with swipe-down on iOS 13+ unless forced full screen)', 'SFSafariViewController', 'Done, read-only URL with lock, Reader, reload; back, forward, share, Open in Safari', 'No app actions possible over the page'],
  ['X, Android', 'Chrome Custom Tab since 2015; the 2026 user agent says TwitterAndroid, which a Custom Tab cannot produce, so now a WebView (inferred)', 'Custom Tab, then WebView', 'Same engagement bar per 2026 reports', 'Same toggle'],
  ['Instagram, Threads', 'Full-screen in-app browser', 'Custom WKWebView (injects its own script, Krause 2022)', 'Domain with lock, Done, a menu; navigation arrows; no engagement actions', 'Per link only: menu, Open in browser. No global toggle; Threads has one for message links only'],
  ['Facebook', 'Full-screen in-app browser', 'Custom WKWebView', 'Close, title, domain, menu', 'Settings, Media: links open externally; since 2024 message links only'],
  ['Reddit', 'Modal Safari view', 'SFSafariViewController (Krause 2022)', 'Stock Safari view', 'Settings, Advanced: Open links in app or default browser'],
  ['Bluesky', 'Full-screen modal', 'expo-web-browser: Safari view on iOS, Custom Tab on Android (source)', 'Stock', 'First-tap dialog "How should we open this link?" and a setting'],
  ['LinkedIn', 'Overlay browser; Android Back closes the whole browser (NN/g)', 'U', 'U', 'Account preferences: Open web links in app (reported gone on iOS later)'],
  ['Apple News', 'Articles render natively; publisher links redirect into News', 'Native', 'n/a', 'Settings, News: Open web links in News'],
];

export const browserConstraints: [string, string, string, string, string][] = [
  ['Custom UI over the page', 'Forbidden: "may not be hidden or obscured by other views or layers" (App Review 5.1.1 vii); must be presented modally, never embedded', 'Anything', 'Toolbar colour, one action button, up to seven menu items, close icon, and a bottom toolbar of RemoteViews that can update dynamically', 'Anything'],
  ['Sheet or partial height', 'Page sheet allowed but "don’t use these for general website content"', 'Anything', 'Partial Custom Tabs (Chrome 107+): a bottom sheet with a drag handle, minimum 50% height, resizable; side sheets (Chrome 120+)', 'Anything'],
  ['Cookies and sign-in', 'Per-app store since iOS 11; no Safari AutoFill or history', 'Own store', 'Shares the browser’s cookies, passwords and autofill', 'Own store'],
  ['Built in', 'Reader, AutoFill, fraud warning, content blockers, share, Open in Safari, collapsing bar', 'Nothing; build it all', 'Browser features, share, find in page, Reader in Chrome', 'Nothing'],
  ['Respects the default browser', 'No, always Safari', 'No', 'Yes', 'No'],
  ['EU alternative engines', 'Entitlement lets an app ship its own engine, but the UI must take most of the display, show the domain and offer the default browser', '', '', ''],
];

export const browserGuidance: [string, string, string][] = [
  ['Apple HIG, Web views', '"Using a web view to let people briefly access a website without leaving the context of your app is fine, but Safari is the primary way people browse the web. Attempting to replicate the functionality of Safari in your app is unnecessary and discouraged." "Support forward and back navigation when appropriate."', 'https://developer.apple.com/design/human-interface-guidelines/web-views'],
  ['App Review 5.1.1 (vii)', '"SafariViewController must be used to visibly present information to users; the controller may not be hidden or obscured by other views or layers."', 'https://developer.apple.com/app-store/review/guidelines/'],
  ['Apple developer news', 'Use SFSafariViewController "if your app wants to present a webpage without any customization", WKWebView "if your app implements customize behavior (UI or behind the scenes)".', 'https://developer.apple.com/news/?id=trjs0tcd'],
  ['Google, in-app browsing', 'Custom Tabs for "a website you don’t own" and shared sign-in; WebView when you "need to modify the contents of the web page itself or overlay native UI elements on top of it".', 'https://developer.android.com/develop/ui/views/layout/webapps/in-app-browsing-embedded-web'],
  ['Chrome Custom Tabs', '"The bottom toolbar is a very flexible way to add more functionality to a Custom Tab" (RemoteViews); partial tabs open as a bottom sheet the user can drag to full screen.', 'https://developer.chrome.com/docs/android/custom-tabs/guide-interactivity'],
  ['NN/g, Accidental dismissal of overlays', 'In-app browsers as overlays get dismissed by accident; support Back as undo, avoid overlays on overlays, keep a visible close button rather than relying on swipe-down.', 'https://www.nngroup.com/articles/accidental-overlay-dismissal/'],
  ['Krause, InAppBrowser.com', 'Use an in-app browser only for your own pages; with the Safari view "there is no way for apps to inject any code onto websites".', 'https://krausefx.com/blog/announcing-inappbrowsercom-see-what-javascript-commands-get-executed-in-an-in-app-browser'],
];

export const browserSources: string[] = [
  'https://www.engadget.com/x-is-testing-a-new-way-of-opening-links-in-posts-to-improve-engagement-211210520.html',
  'https://www.fastcompany.com/91425207/xs-ux-update-wants-to-save-your-links-from-social-medias-black-hole',
  'https://gigazine.net/gsc_news/en/20251020-x-change-how-handles-links/',
  'https://x.com/nikitabier/status/1979994223224209709',
  'https://x.com/firt/status/1980004211522691390',
  'https://devcommunity.x.com/t/issue-regarding-deep-links-failing-due-to-in-app-browser-changes-in-x-for-ios/252070',
  'https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller',
  'https://developer.apple.com/design/human-interface-guidelines/web-views',
  'https://developer.apple.com/app-store/review/guidelines/',
  'https://developer.android.com/develop/ui/views/layout/webapps/in-app-browsing-embedded-web',
  'https://developer.chrome.com/docs/android/custom-tabs/guide-partial-custom-tabs',
  'https://developer.chrome.com/docs/android/custom-tabs/guide-interactivity',
  'https://www.nngroup.com/articles/accidental-overlay-dismissal/',
  'https://krausefx.com/blog/ios-privacy-instagram-and-facebook-can-track-anything-you-do-on-any-website-in-their-in-app-browser',
  'https://github.com/bluesky-social/social-app/blob/main/src/components/dialogs/InAppBrowserConsent.tsx',
  'https://www.adweek.com/media/reddit-how-to-change-how-links-are-opened/',
  'https://open-web-advocacy.org/blog/in-app-browsers-the-worst-erosion-of-user-choice-you-havent-heard-of/',
];
