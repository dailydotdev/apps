export const briefCopy = {
  eyebrowToday: 'Your brief',
  greeting: {
    morning: (name: string) => `Good morning, ${name}.`,
    afternoon: (name: string) => `Good afternoon, ${name}.`,
    evening: (name: string) => `Good evening, ${name}.`,
  },
  heroFrame: (stories: number, minutes: number) =>
    `${stories} things from your circles. ${minutes} minutes.`,
  readPill: (minutes: number) => `${minutes} min`,
  streakSuffix: '-day streak',
  storiesLabel: 'Stories',
  minutesLabel: 'To read',
  savedLabel: 'You save',
  progressLabel: 'Progress',
  collapsed: (stories: number, minutes: number, saved: number) =>
    `Today's brief · ${stories} stories · ${minutes} min · ~${saved} min saved`,

  controlCollapse: 'Collapse brief',
  controlExpand: 'Expand brief',
  controlHide: "Hide today's brief",
  controlSkip: 'Skip to feed',
  controlReshow: "Show today's brief",

  leadEyebrow: '1 big thing',
  attentionEyebrow: 'Worth your attention',
  topicsEyebrow: 'On your topics',
  quickEyebrow: 'Also worth a glance',

  openStory: 'Open story',
  storyMeta: (upvotes: number, comments: number) =>
    `${upvotes} upvotes · ${comments} comments`,

  topicWeekly: 'Weekly read',
  topicExpand: 'Open digest',

  closingTitleDone: "You're caught up.",
  closingTitleProgress: "That's the brief.",
  closingSubDone: (stories: number, minutes: number, saved: number) =>
    `${stories} stories. ${minutes} minutes. ~${saved} min back in your evening.`,
  closingSubProgress: (remaining: number) =>
    `${remaining} ${
      remaining === 1 ? 'story' : 'stories'
    } left when you're ready.`,
  closingPivot: 'Now go build something.',
  closingShare: 'Share',

  scrollCue: 'Keep scrolling for the full feed',

  panelOpenInFeed: 'Open in feed',
  panelNext: 'Next',
  panelPrev: 'Previous',
  panelClose: 'Close',
  conversationLabel: 'From the conversation',
  threadLabel: (n: number) => `${n} posts in this thread`,
  tldrTag: 'TL;DR',

  shareHead: "Share today's brief",
  shareCopy: 'Copy link',
  shareCopied: 'Link copied',
  shareEmail: 'Send via email',
  shareSystem: 'More options',
  shareFooter: 'A friend will love this too.',
} as const;
