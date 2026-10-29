import type { UserQuest } from '../../graphql/quests';
import { QuestStatus, QuestType } from '../../graphql/quests';
import {
  IntroQuestEventType,
  getIntroQuestPhase,
  sortIntroQuests,
} from './introQuestSteps';

const buildQuest = (
  eventType: string,
  overrides: Partial<UserQuest> = {},
): UserQuest => ({
  userQuestId: `uq-${eventType}`,
  rotationId: `rot-${eventType}`,
  progress: 0,
  status: QuestStatus.InProgress,
  locked: false,
  claimable: false,
  quest: {
    id: `q-${eventType}`,
    name: eventType,
    description: eventType,
    type: QuestType.Intro,
    eventType,
    targetCount: 1,
  },
  rewards: [],
  ...overrides,
});

describe('sortIntroQuests', () => {
  it('orders the quests by the setup order whatever order the API returns', () => {
    const sorted = sortIntroQuests([
      buildQuest(IntroQuestEventType.ApiProfileFetch),
      buildQuest('some_new_quest'),
      buildQuest(IntroQuestEventType.NotificationsEnable),
      buildQuest(IntroQuestEventType.PostRead),
      buildQuest(IntroQuestEventType.ExtensionInstall),
    ]);

    expect(sorted.map(({ quest }) => quest.eventType)).toEqual([
      IntroQuestEventType.ExtensionInstall,
      IntroQuestEventType.PostRead,
      IntroQuestEventType.NotificationsEnable,
      IntroQuestEventType.ApiProfileFetch,
      'some_new_quest',
    ]);
  });
});

describe('getIntroQuestPhase', () => {
  it('treats a claimedAt stamp as claimed even while the status lags', () => {
    const quest = buildQuest(IntroQuestEventType.BriefGenerate, {
      status: QuestStatus.Completed,
      claimedAt: new Date(),
    });

    expect(getIntroQuestPhase(quest, false)).toBe('claimed');
  });

  it('shows a finished quest as ready over a local waiting state', () => {
    const quest = buildQuest(IntroQuestEventType.ExtensionInstall, {
      status: QuestStatus.Completed,
      claimable: true,
    });

    expect(getIntroQuestPhase(quest, true)).toBe('ready');
  });
});
