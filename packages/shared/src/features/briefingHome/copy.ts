export const briefCopy = {
  editionLabel: (n: number) => `Edition #${n}`,
  greeting: {
    morning: (name: string) => `Good morning, ${name}`,
    afternoon: (name: string) => `Good afternoon, ${name}`,
    evening: (name: string) => `Good evening, ${name}`,
  },
  heroDeck: (stories: number, minutes: number) =>
    `${stories} stories worth your time. About ${minutes} minutes, end to end.`,

  tabBriefing: 'Your brief',
  tabFeed: 'For you',
  tabBriefingHint: "Today's read",
  tabFeedHint: 'Latest posts',
  briefMetaLine: (minutes: number, sources: number) =>
    `${minutes} min read · ${sources} sources tracked`,

  storiesLabel: 'Stories',
  minutesLabel: 'Read time',
  savedLabel: 'Time saved',
  progressLabel: 'Progress',
  contributorsLabel: 'Contributors',
  collapsed: (stories: number, minutes: number, saved: number) =>
    `Today's brief · ${stories} stories · ${minutes} min · ~${saved} min saved`,

  controlCollapse: 'Collapse',
  controlExpand: 'Expand',
  controlHide: 'Dismiss',
  controlSkip: 'Jump to feed',
  controlReshow: "Show today's brief",
  moreActions: 'More options',

  leadEyebrow: 'The big thing',
  attentionEyebrow: 'Worth your attention',
  attentionHint: 'Threads heating up across your sources',
  topicsEyebrow: 'On your radar',
  topicsHint: 'Weekly digests from the topics you follow',
  openStory: 'Read the breakdown',
  storyReadTime: (minutes: number) => `${minutes} min`,
  storyContributors: (n: number) =>
    `${n} ${n === 1 ? 'contributor' : 'contributors'}`,
  storySourcesLabel: 'Covered by',
  storyPostCount: (n: number) => `${n} ${n === 1 ? 'post' : 'posts'}`,

  topicWeekly: 'Weekly digest',
  topicExpand: 'Read the digest',
  topicPagerLabel: 'Switch topic',

  closingTitleDone: "You're caught up.",
  closingTitleProgress: "That's the brief.",
  closingSubDone: (stories: number, minutes: number, saved: number) =>
    `${stories} stories. ${minutes} minutes. ~${saved} min back in your evening.`,
  closingSubProgress: (remaining: number) =>
    `${remaining} ${
      remaining === 1 ? 'story' : 'stories'
    } left when you're ready.`,
  closingPivot: 'Now go build something.',
  closingShare: 'Share brief',

  scrollCue: 'See the rest of the feed',

  panelMeta: (sources: number, contributors: number) =>
    `${sources} sources · ${contributors} contributors`,
  panelOpenInFeed: 'Open in feed',
  panelNext: 'Next story',
  panelPrev: 'Previous story',
  panelClose: 'Close',
  conversationLabel: "What the community's saying",
  threadLabel: (n: number) =>
    `${n} ${n === 1 ? 'post in this thread' : 'posts in this thread'}`,
  tldrTag: 'TL;DR',

  shareHead: "Share today's brief",
  shareCopy: 'Copy link',
  shareCopied: 'Link copied',
  shareEmail: 'Send via email',
  shareSystem: 'More options',
  shareFooter: 'A friend will love this too.',
} as const;
