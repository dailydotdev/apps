// The six intro quests exactly as daily-api seeds them
// (migrations AddIntroQuests + AddApiIntroQuests), in slot order.
// Names, descriptions and rewards are the production values; only `pitch`,
// `cta`, `doneLabel`, `minutes` and `group` are new copy proposed here.

export type QuestId =
  | 'extension'
  | 'notifications'
  | 'brief'
  | 'profile'
  | 'apiKey'
  | 'apiCall'
  | 'read3'
  | 'reminder'
  | 'story';

export type QuestGroup = 'setup' | 'yours' | 'builders';

export interface IntroQuest {
  id: QuestId;
  eventType: string;
  name: string;
  description: string;
  pitch: string;
  cta: string;
  doneLabel: string;
  minutes: string;
  xp: number;
  cores: number;
  group: QuestGroup;
  optional?: boolean;
  requires?: QuestId;
}

export const introQuests: IntroQuest[] = [
  {
    id: 'extension',
    eventType: 'extension_install',
    name: 'Install the browser extension',
    description: 'Make daily.dev your homepage and never miss any updates.',
    pitch: 'Every new tab becomes your feed. One click, free.',
    cta: 'Add to Chrome',
    doneLabel: 'Extension installed',
    minutes: '10 sec',
    xp: 10,
    cores: 5,
    group: 'setup',
  },
  {
    id: 'notifications',
    eventType: 'notifications_enable',
    name: 'Turn on notifications',
    description: 'Get notified about the things that matter.',
    pitch: 'Replies, mentions and your streak. Nothing else.',
    cta: 'Turn on',
    doneLabel: 'Notifications on',
    minutes: '5 sec',
    xp: 10,
    cores: 5,
    group: 'setup',
  },
  {
    id: 'brief',
    eventType: 'brief_generate',
    name: 'Generate your first brief',
    description: 'Try out the presidential brief feature.',
    pitch: 'Your AI agent reads the day for you. The first one is free.',
    cta: 'Generate for free',
    doneLabel: 'Brief ready',
    minutes: '1 min',
    xp: 15,
    cores: 5,
    group: 'yours',
  },
  {
    id: 'profile',
    eventType: 'profile_complete',
    name: 'Complete your profile',
    description: 'Complete your profile and increase your visibility.',
    pitch: 'Five details so other developers know who they are talking to.',
    cta: 'Finish profile',
    doneLabel: 'Profile complete',
    minutes: '2 min',
    xp: 25,
    cores: 5,
    group: 'yours',
  },
  {
    id: 'apiKey',
    eventType: 'api_token_create',
    name: 'Grab your API key',
    description: 'Create a Personal Access Token to use the daily.dev API.',
    pitch: 'Plug your feed into scripts, agents and your terminal.',
    cta: 'Create key',
    doneLabel: 'Key created',
    minutes: '10 sec',
    xp: 15,
    cores: 5,
    group: 'builders',
    optional: true,
  },
  {
    id: 'apiCall',
    eventType: 'api_profile_fetch',
    name: 'Hello, API',
    description: 'Fetch your profile through the daily.dev API.',
    pitch: 'Paste one command in your terminal. We will spot the call.',
    cta: 'Copy command',
    doneLabel: 'First call received',
    minutes: '30 sec',
    xp: 15,
    cores: 5,
    group: 'builders',
    optional: true,
    requires: 'apiKey',
  },
];

// Three journey-only steps from Dave's retention analysis (Onboarding Return
// Drivers + Feature Adoption Paths, 15 Oct 2026). They are not intro quests
// today, so they only appear in the journey trail.
export const journeyOnlyQuests: IntroQuest[] = [
  {
    id: 'read3',
    eventType: 'read_post',
    name: 'Read 3 posts',
    description: 'Open three posts from your feed.',
    pitch:
      'Today’s picks are ready. Three good reads and your feed starts to know you.',
    cta: 'Open today’s picks',
    doneLabel: 'Read your first 3 posts',
    minutes: '5 min',
    xp: 15,
    cores: 5,
    group: 'yours',
  },
  {
    id: 'reminder',
    eventType: 'reading_reminder_set',
    name: 'Set a daily reading reminder',
    description: 'Pick a time for a daily nudge.',
    pitch: 'Pick a time. One nudge a day, nothing else.',
    cta: 'Set reminder',
    doneLabel: 'Daily reminder set',
    minutes: '5 sec',
    xp: 10,
    cores: 5,
    group: 'setup',
  },
  {
    id: 'story',
    eventType: 'collection_subscribe',
    name: 'Follow a developing story',
    description: 'Subscribe to a collection.',
    pitch: 'We group every post on a story. Follow one and hear when it moves.',
    cta: 'Follow story',
    doneLabel: 'Following a story',
    minutes: '10 sec',
    xp: 10,
    cores: 5,
    group: 'yours',
  },
];

export const allQuests: IntroQuest[] = [...introQuests, ...journeyOnlyQuests];

export const questById = (id: QuestId): IntroQuest =>
  allQuests.find((quest) => quest.id === id) as IntroQuest;

export const journeyQuests: IntroQuest[] = [
  questById('extension'),
  questById('read3'),
  questById('notifications'),
  questById('reminder'),
  questById('story'),
  { ...questById('brief'), optional: true },
];

export const sumRewards = (
  quests: IntroQuest[],
): { xp: number; cores: number } =>
  quests.reduce(
    (acc, quest) => ({ xp: acc.xp + quest.xp, cores: acc.cores + quest.cores }),
    { xp: 0, cores: 0 },
  );

export const reminderTimes = ['8:00', '9:00', '13:00', '18:00'];

export const mockStories = [
  { id: 'bun', title: 'Bun 1.3 and the JavaScript runtime race', posts: 14 },
  { id: 'ts6', title: 'TypeScript 6 beta', posts: 9 },
  { id: 'agents', title: 'AI coding agents in production', posts: 22 },
];

export const groupMeta: Record<QuestGroup, { title: string; note: string }> = {
  setup: {
    title: 'Never miss a thing',
    note: 'daily.dev where you already are.',
  },
  yours: {
    title: 'Make it yours',
    note: 'A feed and a profile that fit you.',
  },
  builders: {
    title: 'For builders',
    note: 'Optional. For when you want your feed in code.',
  },
};

export const totalRewards = introQuests.reduce(
  (acc, quest) => ({ xp: acc.xp + quest.xp, cores: acc.cores + quest.cores }),
  { xp: 0, cores: 0 },
);

export const profileFields = [
  { id: 'photo', label: 'Photo' },
  { id: 'headline', label: 'Headline' },
  { id: 'experience', label: 'Experience level' },
  { id: 'work', label: 'Work' },
  { id: 'education', label: 'Education' },
] as const;

export type ProfileFieldId = (typeof profileFields)[number]['id'];

export const mockToken = 'dd_pat_7Qx2Lm9vKc4Rt8Wn3f9a';
export const maskedToken = 'dd_pat_••••••••••3f9a';

export const curlCommand = (token: string): string =>
  `curl -H "Authorization: Bearer ${token}" https://api.daily.dev/public/v1/profile`;

export const mockUser = {
  name: 'Maya',
  image:
    'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
};
