import type { UserQuest } from '../../graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  isQuestClaimed,
} from '../../graphql/quests';

export enum IntroQuestEventType {
  ExtensionInstall = 'extension_install',
  PostRead = 'post_read',
  NotificationsEnable = 'notifications_enable',
  BriefGenerate = 'brief_generate',
  ProfileComplete = 'profile_complete',
  ApiTokenCreate = 'api_token_create',
  ApiProfileFetch = 'api_profile_fetch',
}

export type IntroQuestPhase = 'todo' | 'working' | 'ready' | 'claimed';

export interface IntroQuestStep {
  pitch: string;
  cta: string;
  doneLabel: string;
  workingLabel: string;
  minutes: string;
  optional?: boolean;
  free?: boolean;
  requires?: IntroQuestEventType;
}

export const introQuestSteps: Record<IntroQuestEventType, IntroQuestStep> = {
  [IntroQuestEventType.ExtensionInstall]: {
    pitch: 'Every new tab becomes your feed. One click, free.',
    cta: 'Add to Chrome',
    doneLabel: 'Extension installed',
    workingLabel: 'Waiting for the install',
    minutes: '10 sec',
  },
  [IntroQuestEventType.PostRead]: {
    pitch:
      'Today’s picks are ready. Three good reads and your feed starts to learn what you like.',
    cta: 'Open today’s picks',
    doneLabel: 'Read 3 articles',
    workingLabel: 'Reading today’s picks',
    minutes: '5 min',
  },
  [IntroQuestEventType.NotificationsEnable]: {
    pitch: 'Replies, mentions and your streak. Nothing else.',
    cta: 'Turn on notifications',
    doneLabel: 'Notifications on',
    workingLabel: 'Waiting for your browser',
    minutes: '5 sec',
  },
  [IntroQuestEventType.BriefGenerate]: {
    pitch: 'Your AI agent reads the day for you. The first one is free.',
    cta: 'Generate my brief',
    doneLabel: 'Brief ready',
    workingLabel: 'Writing your brief',
    minutes: '1 min',
    free: true,
  },
  [IntroQuestEventType.ProfileComplete]: {
    pitch: 'Five details so other developers know who they are talking to.',
    cta: 'Edit profile',
    doneLabel: 'Profile complete',
    workingLabel: 'Waiting for your profile',
    minutes: '2 min',
  },
  [IntroQuestEventType.ApiTokenCreate]: {
    pitch: 'Plug your feed into scripts, agents and your terminal.',
    cta: 'Create API key',
    doneLabel: 'API key created',
    workingLabel: 'Creating your key',
    minutes: '10 sec',
    optional: true,
  },
  [IntroQuestEventType.ApiProfileFetch]: {
    pitch: 'Paste one command in your terminal. We will spot the call.',
    cta: 'Copy command',
    doneLabel: 'First API call received',
    workingLabel: 'Listening for your call',
    minutes: '30 sec',
    optional: true,
    requires: IntroQuestEventType.ApiTokenCreate,
  },
};

const stepOrder = Object.keys(introQuestSteps);

export const getIntroQuestStep = (
  quest: UserQuest,
): IntroQuestStep | undefined =>
  introQuestSteps[quest.quest.eventType as IntroQuestEventType];

const orderOf = (quest: UserQuest): number => {
  const index = stepOrder.indexOf(quest.quest.eventType);

  return index === -1 ? stepOrder.length : index;
};

export const sortIntroQuests = (quests: UserQuest[]): UserQuest[] =>
  [...quests].sort((a, b) => orderOf(a) - orderOf(b));

export const getQuestReward = (
  quest: UserQuest,
  type: QuestRewardType,
): number =>
  quest.rewards
    .filter((reward) => reward.type === type)
    .reduce((total, reward) => total + reward.amount, 0);

export const getQuestXp = (quest: UserQuest): number =>
  getQuestReward(quest, QuestRewardType.Xp);

export const getQuestCores = (quest: UserQuest): number =>
  getQuestReward(quest, QuestRewardType.Cores);

export const isIntroQuestDone = (quest: UserQuest): boolean =>
  isQuestClaimed(quest) ||
  quest.claimable ||
  quest.status === QuestStatus.Completed;

export const getIntroQuestPhase = (
  quest: UserQuest,
  isWorking: boolean,
): IntroQuestPhase => {
  if (isQuestClaimed(quest)) {
    return 'claimed';
  }

  if (isIntroQuestDone(quest)) {
    return 'ready';
  }

  return isWorking ? 'working' : 'todo';
};
