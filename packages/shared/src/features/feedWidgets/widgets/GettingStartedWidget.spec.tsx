import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { UserQuest } from '../../../graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '../../../graphql/quests';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { availableFeedWidgets } from '../components';
import { GettingStartedWidget } from './GettingStartedWidget';

const mockLogEvent = jest.fn();
const mockClaim = jest.fn();
const mockDisplayToast = jest.fn();
let mockUser: { id: string } | null = { id: 'u1' };
let mockIntro: UserQuest[] | undefined;

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: mockUser }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: () => ({
    data: mockIntro ? { intro: mockIntro } : undefined,
    isPending: !mockIntro,
    isError: false,
  }),
}));

jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('../../../hooks/useClaimQuestReward', () => ({
  useClaimQuestReward: () => ({
    mutate: mockClaim,
    isPending: false,
    variables: undefined,
  }),
}));

const introQuest = (
  eventType: string,
  name: string,
  status: QuestStatus,
  { xp = 10, claimable = false } = {},
): UserQuest => ({
  userQuestId: `uq-${eventType}`,
  rotationId: `rotation-${eventType}`,
  progress: status === QuestStatus.InProgress ? 0 : 1,
  status,
  claimedAt: null,
  locked: false,
  claimable,
  quest: {
    id: `quest-${eventType}`,
    name,
    description: `${name} description`,
    type: QuestType.Intro,
    eventType,
    targetCount: 1,
  },
  rewards: [
    { type: QuestRewardType.Xp, amount: xp },
    { type: QuestRewardType.Cores, amount: 5 },
  ],
});

const quests = (statuses: QuestStatus[], claimableIndex = -1): UserQuest[] =>
  [
    ['notifications_enable', 'Turn on notifications'],
    ['brief_generate', 'Generate your first brief'],
    ['profile_complete', 'Complete your profile'],
  ].map(([eventType, name], index) =>
    introQuest(eventType, name, statuses[index], {
      xp: (index + 1) * 10,
      claimable: index === claimableIndex,
    }),
  );

const renderWidget = (size: FeedWidgetSize) =>
  render(
    <GettingStartedWidget
      widget={{ id: 'w1', kind: FeedWidgetKind.GettingStarted, size }}
      size={size}
      isEditing={false}
      onConfigChange={() => false}
      canConfigure={false}
      isConfiguring={false}
      onConfigureEnd={() => undefined}
    />,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: 'u1' };
  mockIntro = quests([
    QuestStatus.Claimed,
    QuestStatus.InProgress,
    QuestStatus.InProgress,
  ]);
});

it('counts what is left and opens the next step with its destination', () => {
  renderWidget(FeedWidgetSize.Tall);

  expect(screen.getByText('Earn 50 XP and 10 Cores')).toBeInTheDocument();
  expect(screen.getByText('2 things to set up daily.dev')).toBeInTheDocument();
  expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '1');
  expect(screen.getByText('Notifications on')).toBeInTheDocument();

  const cta = screen.getByRole('link', { name: 'Generate for free' });
  expect(cta).toHaveAttribute('href', `${webappUrl}briefing/generate`);
  fireEvent.click(cta);
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.FeedWidget,
    target_id: FeedWidgetKind.GettingStarted,
    extra: JSON.stringify({
      origin: Origin.FeedWidgets,
      size: FeedWidgetSize.Tall,
      quest: 'brief_generate',
    }),
  });
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Impression,
    target_type: TargetType.FeedWidget,
    target_id: FeedWidgetKind.GettingStarted,
    extra: JSON.stringify({
      origin: Origin.FeedWidgets,
      size: FeedWidgetSize.Tall,
    }),
  });
});

it('opens another step from the list', () => {
  renderWidget(FeedWidgetSize.Tall);

  fireEvent.click(
    screen.getByRole('button', { name: /Complete your profile/ }),
  );

  expect(
    screen.getByRole('link', { name: 'Finish profile' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'Generate for free' }),
  ).not.toBeInTheDocument();
});

it('leads with a claimable step and claims it', () => {
  mockIntro = quests(
    [QuestStatus.Claimed, QuestStatus.InProgress, QuestStatus.Completed],
    2,
  );
  renderWidget(FeedWidgetSize.Large);

  // Large keeps the step on the left, so its list rows never expand.
  expect(
    screen.getByRole('button', { name: /Generate your first brief/ }),
  ).not.toHaveAttribute('aria-expanded');
  fireEvent.click(screen.getByRole('button', { name: 'Claim +30 XP' }));
  fireEvent.click(
    screen.getByRole('button', { name: 'Claim Complete your profile' }),
  );

  expect(mockClaim).toHaveBeenCalledTimes(2);
  expect(mockClaim).toHaveBeenCalledWith(
    {
      userQuestId: 'uq-profile_complete',
      questId: 'quest-profile_complete',
      questType: QuestType.Intro,
    },
    expect.anything(),
  );
});

it('tells the reader when a claim fails', () => {
  mockIntro = quests(
    [QuestStatus.Claimed, QuestStatus.Completed, QuestStatus.InProgress],
    1,
  );
  mockClaim.mockImplementationOnce((_, { onError }) =>
    onError(new Error('500')),
  );
  renderWidget(FeedWidgetSize.Tall);

  fireEvent.click(screen.getByRole('button', { name: 'Claim +20 XP' }));

  expect(mockDisplayToast).toHaveBeenCalledWith(
    'Couldn’t claim your reward. Try again.',
  );
});

it('folds progress into the header on Small and says when one is left', () => {
  mockIntro = quests([
    QuestStatus.Claimed,
    QuestStatus.Claimed,
    QuestStatus.InProgress,
  ]);
  renderWidget(FeedWidgetSize.Small);

  expect(screen.getByText('2/3')).toBeInTheDocument();
  expect(screen.getByText('Complete your profile')).toBeInTheDocument();
  expect(screen.queryByText('Notifications on')).not.toBeInTheDocument();

  renderWidget(FeedWidgetSize.Tall);
  expect(screen.getByText('One last thing to set up')).toBeInTheDocument();
});

it('thanks the reader once every quest is claimed', () => {
  mockIntro = quests([
    QuestStatus.Claimed,
    QuestStatus.Claimed,
    QuestStatus.Claimed,
  ]);
  renderWidget(FeedWidgetSize.Tall);

  expect(screen.getByText('You’re all set')).toBeInTheDocument();
  expect(screen.getByText('+60 XP and 15 Cores earned')).toBeInTheDocument();
  expect(screen.queryByRole('meter')).not.toBeInTheDocument();
});

it('asks a logged-out reader to log in', () => {
  mockUser = null;
  mockIntro = [];
  renderWidget(FeedWidgetSize.Small);

  expect(screen.getByText('Log in to set up daily.dev.')).toBeInTheDocument();
});

it('is offered in the gallery only to readers with an account', () => {
  const kinds = (isLoggedIn: boolean) =>
    availableFeedWidgets({
      isLoggedIn,
      hasMessages: false,
      hasSquads: false,
      isReadingStreakOn: true,
    }).map(({ kind }) => kind);

  expect(kinds(true)).toContain(FeedWidgetKind.GettingStarted);
  expect(kinds(false)).not.toContain(FeedWidgetKind.GettingStarted);
});
