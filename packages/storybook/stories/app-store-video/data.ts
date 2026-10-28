// What the review found, as tables the chapters draw. Figures carry their
// source; vendor numbers are marked as such, so nobody reads a sales claim
// as a measurement.

export const specRows = [
  [
    'Where it plays',
    'Top of the product page, above the icon and name',
    'In search results, instead of the screenshots',
    'Product page gallery, before the screenshots; also in search results',
  ],
  [
    'Who sees it',
    'iOS 27 and iPadOS 27 only',
    'iOS 27 and iPadOS 27 only',
    'Everyone',
  ],
  ['Aspect ratio', '21:9', '3:2', 'Portrait 9:16 (or landscape)'],
  [
    'Pixels',
    '3840 × 1646 (or a 16:9 universal PNG at 5244 × 2950 that serves both)',
    '1920 × 1280 up to 3840 × 2560',
    '886 × 1920 for every Face ID and Dynamic Island phone; 1080 × 1920 for the 5.5" class',
  ],
  ['Length', '5 to 30 seconds', '5 to 30 seconds', '15 to 30 seconds'],
  ['Frame rate', '30 or 60 fps', '30 or 60 fps', '30 fps maximum'],
  [
    'Files',
    '.mov, .m4v or .mp4',
    '.mov, .m4v or .mp4',
    'H.264 .mov/.m4v/.mp4 at 10 to 12 Mbps, or ProRes 422 HQ .mov; 500 MB max',
  ],
  [
    'Sound',
    'Muted by default; people can unmute on the page',
    'Muted; cannot be unmuted',
    'Muted by default; needs a stereo AAC track even if silent',
  ],
  [
    'Loops',
    'Yes, continuously',
    'Yes, continuously',
    'No; plays once, poster frame first',
  ],
  [
    'Content allowed',
    'Brand, value, excitement: not limited to the app in use',
    'Same; Apple asks that the purpose is obvious at a glance',
    'Screen captures of the app only; overlays and narration allowed',
  ],
  [
    'How it ships',
    'Asset Library, standalone review; swap approved assets without a new version',
    'Same',
    'With a version, or in a Product Page Optimization test',
  ],
  [
    'Poster frame',
    'Chosen per asset, applies everywhere it is used',
    'Same',
    'Default at 5 seconds; locked once approved',
  ],
];

export const specHead = [
  '',
  'Header video',
  'Search results video',
  'App preview',
];

export const funnelRows = [
  ['Impressions', '71.8K', '−23%', 'Fewer people see the listing'],
  [
    'Impressions → page views',
    '14.7%',
    '',
    'The bottleneck: 1 in 7 taps through',
  ],
  ['Page views → install', '68%', '', 'The page itself converts well'],
  [
    'Conversion rate',
    '12 to 15%',
    '−7%',
    'Above the 75th percentile for News apps (peers 9.5%)',
  ],
  ['First-time downloads', '4.98K', '−30%', 'About 55 a day'],
  [
    'Day 7 retention',
    '6.5%',
    '',
    'Below the 25th percentile; a product problem, not a listing one',
  ],
  [
    'Ratings',
    '41 in the US at 4.3',
    '',
    'Volume throttles rank and the product page score',
  ],
];

export const evidenceRows = [
  [
    'StoreMaven (A/B vendor)',
    '+20% to +35% install conversion with a preview video',
    'Vendor aggregate over its own tests; games dominate',
  ],
  [
    'SplitMetrics (A/B vendor)',
    '+16% engagement and conversion',
    'Vendor aggregate; a later guide notes finance and productivity tests losing 3% to 7%',
  ],
  [
    'Apple, Product Page Optimization case study',
    'Simply Piano: the page without a preview video beat the one with it',
    "Apple's own showcase; 12-day test, one treatment",
  ],
  [
    'Indie developer, productivity app',
    'View-to-install 5.8% → 7.1% after a 27-second preview',
    'Before/after, no control; the author calls it directional',
  ],
  [
    'Kabam (game), poster-frame test',
    '+66% install conversion from the poster frame alone',
    'A game; shows the first frame matters more than the cut',
  ],
  [
    'Zach Witzel on X, Oct 19 2026',
    '"app store banners can autoplay videos now, new in iOS 27, and almost nobody\'s using it yet"',
    '152K views; the window where a header video is a differentiator',
  ],
];

export const previewRules = [
  'Only screen captures of the app (guideline 2.3.4). No device frames, no bezels, no hands, no over-the-shoulder shots. Reviewers reject "framing around the video screen capture" and "device images and/or device frames"; one developer was flagged for a glimpse of the home screen.',
  'Overlays, captions and narration are allowed to explain what the footage does not. Touch hotspots are fine.',
  'Transitions must not imply features the app lacks. Dissolves and fades, not fast cuts.',
  'Disclose login, subscription or in-app purchase in the footage or on the end frame. The app needs an account, so the end card says so.',
  'No prices or currencies, no dates or seasonal lines, no other platforms or marketplaces (2.3.10), nothing above a 4+ rating, no content you do not have the rights to.',
  'Show fictional account data, not a real person (2.3.9). The storyboard uses public posts and a stock streak count.',
  'Capture at native resolution on a device (QuickTime over a cable), not zoomed. Export with a stereo AAC track even if silent, or App Store Connect rejects the file.',
  'The poster frame defaults to 5 seconds and cannot change after approval. Pick it before upload.',
  'Processing takes up to 24 hours; a Product Page Optimization treatment with new previews needs review and can trip a version review if the reviewer sees the other treatment.',
];

export const creativeRules = [
  'Guideline 2.3.14 (added Oct 16 2026): no inappropriate content, no references to other apps meant to mislead, no unverifiable claims, no specific or discounted prices. The asset also inherits every metadata rule.',
  "Apple's asset best practices add: no URLs, no copyright symbols, no awards the app has not received, no Apple recognitions, no other platforms' logos, a 4+ rating, localized text.",
  'One clear idea, designed for a first-time visitor. Keep the key art inside the safe rectangle of the template, centered, since the header is cropped differently per device and orientation.',
  'It must work silently: the search placement cannot be unmuted. If you add sound, a short music loop as texture, never the message.',
  'It loops: people see the join. Avoid quick cuts, start strong, and end where you began.',
  'Approval is standalone through Asset Library and reviewed against the current version. Approved assets swap on the live page without a new submission, which is how seasonal or campaign changes should ship.',
  'Only Account Holder, Admin, App Manager and Marketing roles can manage assets. The preview tool in App Store Connect shows every device, orientation, language and Dark Mode before anything goes live.',
];

export const featuringFactors = [
  ['User experience', 'Cohesive, efficient, valuable functionality'],
  ['UI design', 'Usability, appeal, quality'],
  ['Innovation', 'New technologies that solve a unique problem'],
  ['Uniqueness', 'A fresh approach to a familiar category'],
  ['Accessibility', 'A great experience for a broad range of users'],
  ['Localization', 'High-quality support for multiple languages'],
  [
    'Product page',
    'Compelling screenshots, app previews and descriptions, positive ratings and reviews',
  ],
];

export const featuringLevers = [
  {
    label: 'Nominate every notable release',
    text: 'Featuring Nominations in App Store Connect: App Launch, App Enhancements or New Content. Two weeks minimum, up to three months ahead. Nothing on record says we have ever submitted one.',
    tone: 'warn' as const,
  },
  {
    label: 'Adopt the new OS features visibly',
    text: 'Editors showcase early adopters of what Apple just shipped. The iOS 27 header and search video are themselves such a feature; so is a Liquid Glass icon. Mention both in the nomination.',
    tone: 'good' as const,
  },
  {
    label: 'Localize the listing',
    text: 'Featuring is curated per storefront and localization is a scoring factor. We are English only while the web app ships 50+ locales.',
    tone: 'bad' as const,
  },
  {
    label: 'Ratings volume',
    text: '41 US ratings at 4.3. Product page quality is a factor and ratings are part of it. The compliant in-app prompt from the July plan is still the cheapest fix.',
    tone: 'bad' as const,
  },
  {
    label: 'In-App Events',
    text: 'Events surface on Today, in search and on the product page, and are the one placement editors pick from constantly. A weekly "AI release roundup" event fits our content.',
    tone: 'good' as const,
  },
  {
    label: 'Custom Product Pages for Apple Ads',
    text: 'Approved creative assets reuse in Apple Ads and custom pages without review. A page per keyword cluster (AI agents, web dev, DevOps) with its own search video is the paid follow-up.',
    tone: 'good' as const,
  },
];

export const forumFindings = [
  'Vendor data points the same way: video helps most where screenshots cannot show the experience (games, creative tools, fitness) and least for content and utility apps. A feed app sits in the second group, so the test, not the lift, is the deliverable.',
  'Apple developer forums carry three preview rejection patterns, all under 2.3.4: device frames or bezels, footage that "does not sufficiently show the app in use", and self-promotional content. None of them is about quality; all are about honesty of footage.',
  "Developers running Product Page Optimization with new previews report one workflow pitfall: a version submitted while a test runs can be rejected because the reviewer sees the other treatment's videos. Submit the test, then the version.",
  'A forum thread from October 2026 reports iPhone previews not being served for some devices on iOS 27 while iPad previews play. Check the live page on a phone after approval.',
  'On the new header, the community consensus is only days old: ASO blogs agree on "one idea, silent first, seamless loop", and nobody has published results. First movers get the differentiation; no one can promise a lift.',
  'Smith can edit, caption and export every format (H.264, 30 fps, 886 × 1920, 3840 × 1646, 3:2) and animate stills with Runway, but cannot record the app. Preview footage has to come from a device; the header and search videos can be motion design.',
];

export const sources = [
  {
    label: 'Apple · App preview specifications',
    href: 'https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications',
  },
  {
    label: 'Apple · Show more with app previews',
    href: 'https://developer.apple.com/app-store/app-previews/',
  },
  {
    label: 'Apple · Creative assets specifications',
    href: 'https://developer.apple.com/help/app-store-connect/reference/app-information/creative-assets-specifications/',
  },
  {
    label: 'Apple · Asset best practices',
    href: 'https://developer.apple.com/app-store/asset-best-practices/',
  },
  {
    label: 'Apple · Manage your App Store assets',
    href: 'https://developer.apple.com/help/app-store-connect/manage-app-information/manage-your-app-store-assets',
  },
  {
    label: 'Apple · WWDC26 Enhance your presence on the App Store',
    href: 'https://developer.apple.com/videos/play/wwdc2026/205/',
  },
  {
    label: 'Apple · App Review Guidelines 2.3',
    href: 'https://developer.apple.com/app-store/review/guidelines/',
  },
  {
    label: 'Apple · Product page optimization',
    href: 'https://developer.apple.com/app-store/product-page-optimization/',
  },
  {
    label: 'Apple · Getting featured',
    href: 'https://developer.apple.com/app-store/getting-featured/',
  },
  {
    label: 'Developer Forums · preview rejected for device frames',
    href: 'https://developer.apple.com/forums/thread/799983',
  },
  {
    label: 'Developer Forums · preview rejected for framing',
    href: 'https://developer.apple.com/forums/thread/815379',
  },
  {
    label: 'Developer Forums · PPO treatment reviewed against a version',
    href: 'https://developer.apple.com/forums/thread/805851',
  },
  {
    label: 'Developer Forums · previews not served on iPhone',
    href: 'https://developer.apple.com/forums/thread/850189',
  },
  {
    label:
      'Blake Crosley · The 2026 App Store product page, every surface measured',
    href: 'https://blakecrosley.com/blog/app-store-product-page-marketing-2026',
  },
  {
    label: 'Entrant · Product page headers and Asset Library explained',
    href: 'https://entranttechnologies.com/tech-news/app-store-product-page-headers-search-assets-asset-library',
  },
  {
    label: 'PPC Land · Rule 2.3.14 and creative assets',
    href: 'https://ppc.land/apples-rule-2-3-14-bans-discount-prices-in-app-store-creative-assets/',
  },
  {
    label: 'SplitMetrics · ASO guide to app preview videos',
    href: 'https://splitmetrics.com/blog/create-app-preview-video-app-store-ios/',
  },
  {
    label: 'AppFollow · ASO video strategies 2026',
    href: 'https://appfollow.io/blog/aso-video-strategies',
  },
  {
    label: 'Apptamin · Poster frame examples',
    href: 'https://www.apptamin.com/?p=17203',
  },
  {
    label: 'AppTweak · How to get featured in 2026',
    href: 'https://www.apptweak.com/en/aso-blog/how-to-get-your-app-featured-on-the-app-store',
  },
  {
    label: 'Zach Witzel on X · header videos, Oct 19 2026',
    href: 'https://x.com/zzwitz/status/2112205129231560758',
  },
  {
    label: 'daily.dev on the App Store',
    href: 'https://apps.apple.com/app/daily-dev/id6740634400',
  },
];
