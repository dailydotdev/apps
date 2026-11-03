// The "open links in" switch, after the reading screen shipped (the mobile
// UX review's chapter 6c).
// Every date and number below was checked on 3 Nov 2026 against the ios,
// apps and android repositories and the event data (Smith); a row that is
// inferred says so.

export const feedback = {
  member: 'aicoder (Jeff Holmes)',
  memberUrl: 'https://app.daily.dev/hUQBRKbT9qbl32p3zVTqs',
  when: '2 Nov 2026, 20:42 IST',
  category: 'Bug report',
  sentiment: 'worried',
  urgency: '3',
  tags: 'settings, mobile',
  quote:
    'Suddenly the app opens links using internal browser and difficult to find setting to change.',
  pageUrl: 'https://daily.dev/settings/feedback',
  thread:
    'https://daily.dev/team/feedback/8611b6ce-0141-443c-8db2-188f485599ac',
  slack: 'https://dailydotdev.slack.com/archives/C01473UNK9C/p1793644969349339',
};

export const memberFacts: [string, string][] = [
  [
    'Platform',
    'The iOS app, only: 4,460 app events in the 14 days to 3 Nov, none from Android or the extension. The 2,938 rows that look like web are the app loading its own pages (iPhone OS, no app version).',
  ],
  [
    'Reading',
    '71 Go to link events from the app between 21 Oct and 2 Nov, 7 on the day of the feedback, 101 article page views. A daily reader who kept opening links after 1.26.',
  ],
  [
    'Where they filed it',
    'Settings, Help center, Your Feedback: the last row of the settings list. They walked the list and found nothing that said links.',
  ],
];

export const timeline: [string, string, string][] = [
  [
    '27 Jan 2025',
    'First commit of the iOS app: a link that leaves the web view opens Apple’s Safari view (SFSafariViewController) over the app, with Done, the read-only URL, share and the Safari compass (Open in Safari) on its own bars. Links have opened in-app since day one.',
    'dailydotdev/ios 9895863, 9011d96',
  ],
  [
    '27 Aug 2026',
    'New-window links (target=_blank) go to the same Safari view instead of loading inside the app’s own web view. Still in-app, same bars.',
    'dailydotdev/ios #24 (32085e7)',
  ],
  [
    '29 Oct 2026',
    'The reading screen (chapter 6b): Read opens a plain WKWebView behind the post, and the post becomes the drawer. The Safari view is off the Read path. The only way out to Safari is Open in browser, a row in the page-name menu.',
    'dailydotdev/ios #27 (e596405), version 1.26',
  ],
  [
    '30 Oct 2026, 13:48 UTC',
    '1.26 goes live on the App Store. What’s New leads with the reading screen.',
    'dailydotdev/ios docs/aso/checkin-2026-11-02',
  ],
  [
    '2 Nov 2026, 09:59 UTC',
    'The web side merges: the drawer, the bridge, and a switch named Open links in the app under Appearance, Preferences, shown only inside an app that has the reading bridge. The flag is client-only: local storage on that phone, never sent to the API.',
    'dailydotdev/apps #6895 (16abf8396)',
  ],
  [
    '2 Nov 2026, 18:42 UTC',
    'The feedback. Filed from the settings area, three days after the app changed and nine hours after the switch reached the web.',
    'Slack C01473UNK9C, feedback 8611b6ce',
  ],
  [
    '2 Nov 2026, evening',
    'Follow-ups in flight that do not touch the switch: the app follows the API’s redirect page itself (ios#52); the drawer’s moving pieces and the live chat pill (apps#7181).',
    'dailydotdev/ios #52, dailydotdev/apps #7181',
  ],
];

export const hunt: [string, string, string][] = [
  [
    '1 · Avatar, then Settings on the You page',
    'Lands on Profile details with the settings menu as a sheet: Profile, Account & Security, Notifications, Appearance, Posting, Invite friends; then Feed settings, Career, Gamification, Developers, Billing and Monetization, Help center.',
    'No row says links, browser or reading. Appearance is the nearest word, fourth in the list, and it is not where Reddit or X keep this switch (Advanced, Privacy and safety).',
  ],
  [
    '2 · Appearance',
    'Theme, then Preferences: Show feed sorting menu, Open links in new tab, Show companion widget on external sites, Show hero cards, Show widgets above the feed, Show feedback button. Since 2 Nov, and only inside the 1.26 app: Open links in the app, right under Open links in new tab.',
    'The first Open links row is a browser-tab concept that does nothing inside the iOS app (the wrapper takes _blank and _self alike), and it sits above the live one. Two neighboring switches with the same first words, one dead. Before the 2 Nov deploy there was nothing at all.',
  ],
  [
    '3 · The reader itself',
    'Close, the page name with a menu glyph, reload. Tap the name: Back, Forward, Copy link, Open in browser.',
    'The page name reads as a label, not a menu. Open in browser is per page and remembers nothing; nothing says always. The Safari view it replaced kept the compass on its bottom bar at all times.',
  ],
  [
    '4 · Help center, Your Feedback',
    'The form the member used.',
    'Last row of the list. They got there after everything above failed.',
  ],
  [
    '5 · iOS Settings, daily.dev',
    'Siri & Search, Notifications, Background App Refresh, Cellular Data.',
    'The app ships no Settings bundle, so nothing about links. Most people would not look here anyway: Reddit, X and Bluesky put the switch in-app.',
  ],
];

export interface LinkOption {
  id: string;
  name: string;
  what: string;
  ios: string;
  android: string;
  mobileWeb: string;
  desktop: string;
  truth: string;
  cost: string;
  pros: string[];
  cons: string[];
}

export const options: LinkOption[] = [
  {
    id: 'A',
    name: 'A setting: Open links in',
    what: 'One control in a Reading group at the top of Appearance: Open links in, with two rows. Inside an app with the reading bridge the rows are In daily.dev and In Safari (In Chrome on Android); in a browser the same control reads A new tab and This tab, replacing the Open links in new tab switch. The Open links in the app switch goes away.',
    ios: 'Now: the drawer or Safari, by the row.',
    android:
      'Hidden until the wrapper has the reading bridge; the Custom Tab stays as it is.',
    mobileWeb: 'The same row as A new tab / This tab (openNewTab).',
    desktop: 'The same row as A new tab / This tab (openNewTab).',
    truth:
      'User settings: openLinksInAppOptOut moves from the client-only list to the API; openNewTab as today.',
    cost: 'Web: a day (appearance.tsx, settings.ts, tests). API: half a day for the field. No app release.',
    pros: [
      'One place, one word members already know from Reddit and X: Open links.',
      'Replaces the dead row instead of sitting under it; the apps and the browsers get the same control.',
      'Follows the member across devices and a reinstall once the API holds it.',
    ],
    cons: [
      'Still a setting: it answers the hunt, not the moment of the first in-app page.',
      'Needs the API change, or the choice stays on one phone.',
    ],
  },
  {
    id: 'B',
    name: 'In the reader: Open in Safari, and Always',
    what: 'The page-name menu names the browser (Open in Safari, Open in Chrome) and gains a last row, Always open links in Safari, a switch. Turning it on closes the reader, opens Safari and shows a toast that names the setting. For the first three reads the Open in Safari square also rides beside reload, then folds into the menu.',
    ios: 'Now.',
    android: 'When the wrapper has the drawer.',
    mobileWeb: 'No reader, nothing to show.',
    desktop: 'No reader, nothing to show.',
    truth: 'The same flag as option A; the row writes it.',
    cost: 'Web: half a day (ReadingDrawer.tsx, its spec). The app already handles the external action.',
    pros: [
      'The switch is where the surprise happens, one tap from the page.',
      'Always does what the Safari view never could: remember.',
      'Nothing to release in the app.',
    ],
    cons: [
      'A fourth square crowds the controls band; hence the three-reads limit.',
      'Only reachable once you are in the reader; the settings hunt still needs option A.',
    ],
  },
  {
    id: 'C',
    name: 'The iOS Settings bundle',
    what: 'A Settings.bundle in the app: Settings, daily.dev, Reading, Open links (In daily.dev / In Safari). The wrapper reads UserDefaults and opens Safari from its open action, or reports the value to the web on boot so the drawer never opens.',
    ios: 'Next app release (1.27), iOS only.',
    android:
      'Nothing: Android has no system place for an app’s preferences; it would need its own screen anyway.',
    mobileWeb: 'Nothing.',
    desktop: 'Nothing.',
    truth:
      'The app’s UserDefaults: a second truth beside the web setting unless the wrapper reports it on every boot.',
    cost: 'App: a day plus the release train. Web: half a day to honor the reported value. Two sources to keep agreeing.',
    pros: [
      'The system’s own place for an app’s preferences; survives a web outage.',
      'Apple’s pattern for Open links (Apple News has it there).',
    ],
    cons: [
      'Invisible from inside the app; people do not open Settings for a third-party app.',
      'Waits for an App Store release; the feedback is about today.',
      'Nothing on Android, nothing on the web; two truths to sync.',
    ],
  },
  {
    id: 'D',
    name: 'A one-time tip on the first reader open',
    what: 'The first time the reader opens on a device, a card above the controls says what changed and offers Keep it and Use Safari. Use Safari writes the flag, opens Safari and shows the toast that names the setting. Seen once, kept as a flag.',
    ios: 'Now; it also catches every member who updates to 1.26.',
    android: 'When the wrapper has the drawer.',
    mobileWeb: 'Nothing to tell.',
    desktop: 'Nothing to tell.',
    truth:
      'A seen flag (settings flag or alerts field) plus the same preference as A.',
    cost: 'Web: half a day (a card in ReadingDrawer.tsx, the seen flag).',
    pros: [
      'Answers the word suddenly: it says what changed, once, where it changed.',
      'Bluesky’s first-tap dialog is the precedent; members know the pattern.',
      'Points at the setting, so the hunt ends before it starts.',
    ],
    cons: [
      'One more card over the first page; it must be small and dismiss on any scroll.',
      'Only new readers see it; a member who already read on 1.26 without the tip needs A or B.',
    ],
  },
];

export const comparison: string[][] = options.map((option) => [
  `${option.id} · ${option.name}`,
  option.ios,
  option.android,
  option.mobileWeb,
  option.desktop,
  option.truth,
  option.cost,
]);

export const copy = {
  settingsGroup: 'Reading',
  settingsLabel: 'Open links in',
  appChoices: [
    [
      'In daily.dev',
      'The page opens over the post. Upvote, comment and save stay one pull away.',
    ],
    [
      'In Safari',
      'Every link leaves the app for Safari. The daily.dev link at the top left brings you back.',
    ],
  ] as [string, string][],
  androidChoices: [
    [
      'In daily.dev',
      'The page opens over the post. Upvote, comment and save stay one pull away.',
    ],
    [
      'In Chrome',
      'Every link leaves the app for Chrome. Back brings you back.',
    ],
  ] as [string, string][],
  browserChoices: [
    ['A new tab', 'The post stays open in this tab.'],
    ['This tab', 'Back returns you to the post.'],
  ] as [string, string][],
  menuRow: 'Open in Safari',
  alwaysRow: 'Always open links in Safari',
  toast: 'Links open in Safari from now on. Change it in Settings, Appearance.',
  tipTitle: 'Articles open inside daily.dev now',
  tipBody:
    'The post stays at the bottom so you can react while you read. Prefer Safari? You can switch any time.',
  tipKeep: 'Keep it',
  tipSafari: 'Use Safari',
};

export const copyRows: [string, string, string][] = [
  [
    'Settings, Appearance, group title',
    copy.settingsGroup,
    'The last group on the page, after Accessibility (Tsahi, 3 Nov). Reading is the word Apple News, Reddit and X use for this neighborhood.',
  ],
  [
    'Control label',
    copy.settingsLabel,
    'The same label on every surface; only the rows change.',
  ],
  [
    'Rows in the iOS app',
    `${copy.appChoices[0][0]} / ${copy.appChoices[1][0]}`,
    `${copy.appChoices[0][1]} / ${copy.appChoices[1][1]}`,
  ],
  [
    'Rows in the Android app',
    `${copy.androidChoices[0][0]} / ${copy.androidChoices[1][0]}`,
    'Chrome by name when the wrapper reports it; In your browser otherwise. Hidden until the Android wrapper has the reading bridge.',
  ],
  [
    'Rows in a browser (mobile web, desktop)',
    `${copy.browserChoices[0][0]} / ${copy.browserChoices[1][0]}`,
    'Replaces the Open links in new tab switch; same openNewTab value underneath.',
  ],
  [
    'Reader menu, fourth row',
    copy.menuRow,
    'Open in Chrome on Android; Open in browser only when the platform is unknown. Same icon as today.',
  ],
  [
    'Reader menu, last row',
    copy.alwaysRow,
    'A switch after a rule, in the same sheet; the sheet keeps its grabber and loses its close square, like the app\u2019s other sheets. On: the reader closes and Safari opens with the page; from then on every link leaves the app.',
  ],
  ['Toast', copy.toast, 'Shown once per change, over the page you land on.'],
  [
    'Reader controls band, third square',
    'Share (aria-label: Share the page), drawn with the system share glyph: the tray with the arrow pointing up (the Upload icon), as X and iOS draw it, on every surface.',
    'Between the page name and reload. Opens the system share sheet with the page URL and title through navigator.share, as the capsule\u2019s share already does in the app; copy link stays on the capsule.',
  ],
  [
    'iOS Settings, Apps, daily.dev',
    'Reading: Open links (In daily.dev / In Safari)',
    'A Settings.bundle group under Allow daily.dev to Access, with a footer that names the in-app setting. The same value as the app, both ways.',
  ],
];

export const finalList: [string, string, string][] = [
  [
    '1 · The setting',
    'One control, Open links in, in a Reading group at the end of Appearance (after Accessibility). In the iOS app: In daily.dev / In Safari. In the Android app, once it has the reading bridge: In daily.dev / In Chrome. In a browser: A new tab / This tab. It replaces both the Open links in new tab switch and the Open links in the app switch.',
    'Web only. openLinksInAppOptOut leaves the client-only list once daily-api accepts it; openNewTab stays.',
  ],
  [
    '2 · The reader menu',
    'The page-name sheet names the browser (Open in Safari, Open in Chrome) and ends with Always open links in Safari, a switch. The sheet is the shared Drawer with its grabber and title and no close square, like the app\u2019s other sheets; swipe down or tap outside closes it. Today\u2019s reader menu is the one sheet with an X (it passes a title), and the execution removes it.',
    'Web only, ReadingDrawer.tsx. The controls band gains a Share square between the page name and reload: the system share sheet with the page, as the capsule\u2019s share does for a post, which also lists Copy and the browsers on the phone. The capsule below keeps copy link. No Safari square.',
  ],
  [
    '3 · iOS Settings',
    'A Settings.bundle: Settings, Apps, daily.dev, Reading, Open links (In daily.dev / In Safari), under the access permissions. Two-way with the app setting: the wrapper mirrors the web value into UserDefaults and reports a change made in Settings back to the web on the next foreground.',
    'dailydotdev/ios: Settings.bundle, Reading.swift; one bridge message each way. Ships with the next app release.',
  ],
  [
    'Out',
    'The one-time tip on the first reader open (option D). Tsahi, 3 Nov: not wanted.',
    'Nothing to build.',
  ],
];

export const files: [string, string][] = [
  [
    'packages/webapp/pages/settings/appearance.tsx',
    'A Reading group after Accessibility with the Open links in control: the notifications page\u2019s Radio list (reverse, the circle on the right, a bold label with its footnote, the PersonalizedDigest classNames). It replaces the Open links in new tab switch (browser surfaces) and the Open links in the app switch (apps with the bridge).',
  ],
  [
    'packages/shared/src/graphql/settings.ts',
    'Remove openLinksInAppOptOut from clientOnlySettingsFlags once the API accepts it, so the provider ships it and migrates each phone\u2019s local value up on the next load. openNewTab stays as it is.',
  ],
  [
    'packages/shared/src/components/shell/ReadingDrawer.tsx',
    'Open in browser becomes Open in Safari or Open in Chrome (getDailyClientPlatform); a rule and a last row, Always open links in Safari, with the Switch; on: write the flag, post the external action, show the toast. The sheet drops its close square (a Drawer prop, or the title rendered without it), so it matches the other sheets. The controls grid gets a fourth column: a Share square (ShellSquare with UploadIcon, the tray-and-arrow share glyph; not the curved ShareIcon) between the page name and reload, wired to useShareOrCopyLink with the article\u2019s url and title; the wrapper reports both already.',
  ],
  [
    'packages/shared/src/hooks/useInAppLinks.ts',
    'Listens for the wrapper\u2019s preference message and writes the flag; posts the flag to the wrapper when it changes. The link routing is unchanged.',
  ],
  [
    'packages/shared/src/components/shell/readingStore.ts, lib/ios.ts',
    'One action (preference, with inApp) and one event (reading-preference) for the Settings bundle round trip.',
  ],
  [
    'daily-api, SettingsFlagsPublicInput',
    'Accept openLinksInAppOptOut. Without it the choice lives on one phone and dies with a reinstall.',
  ],
  [
    'dailydotdev/ios: Settings.bundle/Root.plist',
    'A PSGroupSpecifier Reading with a PSMultiValueSpecifier Open links (In daily.dev / In Safari, key openLinksIn, default app) and the footer text.',
  ],
  [
    'dailydotdev/ios: Reading.swift',
    'Handle the preference action by writing UserDefaults; on foreground, if UserDefaults changed since the last report, post reading-preference to the web. The external action already opens Safari.',
  ],
  [
    'dailydotdev/android',
    'Nothing until the wrapper has the reading bridge (the chapter 8 gate). Today it is a Trusted Web Activity: a link to another site shows Chrome\u2019s Custom Tab with Chrome\u2019s own Open in Chrome in its menu. Not verified on a device this round.',
  ],
  [
    'Tests',
    'appearance page: the control per surface and the two rows it replaces; ReadingDrawer.spec: the Always row posts external and writes the flag; useInAppLinks spec: the preference message writes the flag.',
  ],
];

export const slackDraft = `Looked into this one. Not a bug, and not a regression in code: it is the 1.26 reading screen (live 30 Oct, chapter 6b). Links have always opened in-app, but until 1.26 that was Apple's Safari view with Open in Safari on its own bar. Since 1.26 the article opens behind the post and the only way out is Open in browser inside the page-name menu. The switch (Settings, Appearance, Open links in the app) only reached the web on 2 Nov, and it sits right under the old Open links in new tab row, which does nothing in the app. The member is on iOS, reads about 7 links a day, and filed this from the bottom of the settings list.

Decided in Storybook, Mobile UX, chapter 6c: one "Open links in" control (In daily.dev / In Safari) in a Reading group at the end of Appearance, replacing both switches; "Open in Safari" plus an "Always open links in Safari" switch in the reader menu; and the same choice under iOS Settings, Apps, daily.dev. The first two are web only; the API needs to accept the flag so it syncs across devices; the Settings entry rides the next app release.

Reply for the member: "Thanks for flagging this. Since version 1.26, articles open inside daily.dev with the post underneath so you can react while you read. To open them in Safari instead: Settings, Appearance, turn off Open links in the app. We are making this easier to find: an Always open in Safari switch right in the reader, and the same choice under iOS Settings."`;

// The review's decision log, the rounds that concern this page.
export const decisions: [string, string][] = [
  [
    '74',
    'Tsahi, 3 Nov, from member feedback (aicoder, 2 Nov: “Suddenly the app opens links using internal browser and difficult to find setting to change”): not a regression in code but a switch that shipped late and hidden. Links have opened in-app since the first commit (Apple’s Safari view, with Open in Safari on its own bar); 1.26 (live 30 Oct, ios#27) replaced it with the reading screen, where the only way out is Open in browser inside the page-name menu; the Open links in the app switch reached the web on 2 Nov (apps#6895) under Appearance, Preferences, right under the dead Open links in new tab row, as a client-only flag on one phone. The member is on iOS (Smith: all events from the app). Chapter 6c proposes four options as clickable phones and recommends three together, web only, no app release: one Open links in control (In daily.dev / In Safari; A new tab / This tab in a browser) in a Reading group that replaces both switches; Open in Safari plus an Always open links in Safari row in the reader menu, with the square beside reload for the first three reads; a one-time tip on the first reader open. The iOS Settings bundle is reference only. Needs daily-api to accept openLinksInAppOptOut so the choice follows the member. Proposal, not yet decided.',
  ],
  [
    '75',
    'Tsahi, 3 Nov, on chapter 6c: the setting (A) ships on every surface, with the Reading group moved to the end of Appearance, after Accessibility; the reader menu (B) ships, Open in Safari plus an Always open links in Safari switch as the last row of the page-name sheet, drawn as the shared Drawer without a close square (grabber and swipe down, like the app’s other sheets; today’s reader menu is the one sheet with an X because it passes a title, and the execution removes it), so the mock’s close on the left is gone; the iOS Settings bundle (C) ships too, two-way with the app setting; the one-time tip (D) is out. The finals are drawn with production’s own pieces (Switch, Radio, Typography, the theme buttons, the Drawer’s sheet markup) over the simulator captures of the reader and of iOS Settings, so the full picture can be reviewed before anything is built. The first-three-reads Safari square beside reload is not in the final.',
  ],
  [
    '76',
    'Tsahi, 3 Nov, on the fourth square of the reader\u2019s controls band: a Share square, not a Safari one, between the page name and reload. It opens the system share sheet with the page (navigator.share, as the capsule\u2019s share already does in the app), so a member can send the article to a friend or hand it to any browser on the phone from one place; the capsule below keeps copy link, which is why the band gets share rather than another copy. Drawn on the real capture with the band\u2019s own pieces, with the sheet it opens. The glyph is the system share glyph, the tray with the arrow pointing up (the existing Upload icon), as X and iOS draw it, on every surface; not the curved share arrow. Web only.',
  ],
];
