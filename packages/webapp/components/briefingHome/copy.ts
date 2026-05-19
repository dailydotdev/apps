export const briefCopy = {
  greeting: {
    morning: (name: string) => `Good morning, ${name}.`,
    afternoon: (name: string) => `Good afternoon, ${name}.`,
    evening: (name: string) => `Good evening, ${name}.`,
  },
  heroFrame: (stories: number, minutes: number) =>
    `${stories} things from your circles. ${minutes} minutes.`,
  readPill: (minutes: number) => `${minutes} min of reading`,
  streakSuffix: '-day streak',

  leadEyebrow: "Today's lead",
  readsEyebrow: 'For you to read',
  topicsEyebrow: 'On your topics',
  quickEyebrow: 'Also worth a glance',

  storyMeta: (devs: number, comments: number) =>
    `${devs} developers · ${comments} comments`,
  storyOpen: 'Open',
  storyClose: 'Hide',
  tldrTag: 'TL;DR',
  conversationLabel: 'From the conversation',
  threadLabel: (n: number) => `${n} posts in this thread`,

  topicWeekly: 'Weekly read',
  topicExpand: 'Read the full breakdown',
  topicCollapse: 'Show less',

  closingTitleDone: "You're current.",
  closingTitleProgress: "That's the brief.",
  closingSubDone: (stories: number, minutes: number, saved: number) =>
    `${stories} stories. ${minutes} minutes. ~${saved} min back in your evening.`,
  closingSubProgress: (remaining: number) =>
    `${remaining} ${
      remaining === 1 ? 'story' : 'stories'
    } left when you're ready.`,
  closingPivot: 'Now go build something.',
  closingShare: 'Share this brief',

  bridgeEyebrow: "When the brief isn't enough",
  bridgeTitle: 'Keep reading.',
  bridgeSub: 'The full firehose from your topics, sources, and squads.',
  bridgeCta: 'Open the full feed',

  shareHead: "Share today's brief",
  shareCopy: 'Copy link',
  shareCopied: 'Link copied',
  shareEmail: 'Send via email',
  shareSystem: 'More options',
  shareFooter: 'A friend will love this too.',

  readLabel: 'Read',
  markRead: 'Mark as read',
} as const;
