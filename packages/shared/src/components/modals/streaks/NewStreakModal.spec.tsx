import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactModal from 'react-modal';
import NewStreakModal, {
  STREAK_FREE_FREEZES_GRANT_COPY,
} from './NewStreakModal';
import { ActionType } from '../../../graphql/actions';
import { LogEvent, TargetType } from '../../../lib/log';

ReactModal.setAppElement('body');

const mockCompleteAction = jest.fn();
const mockLogEvent = jest.fn();
let mockCompletedActions: ActionType[] = [];
let mockFreeFreezes: number | null = 2;
let mockIsFlagOn = true;

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useActions: () => ({
    completeAction: mockCompleteAction,
    checkHasCompleted: (type: ActionType) =>
      mockCompletedActions.includes(type),
    isActionsFetched: true,
  }),
}));

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: ({
    feature,
    shouldEvaluate,
  }: {
    feature: { id: string };
    shouldEvaluate?: boolean;
  }) => ({
    value:
      feature.id === 'streak_free_freezes' &&
      shouldEvaluate !== false &&
      mockIsFlagOn,
    isLoading: false,
  }),
}));

jest.mock('../../../hooks/streaks/useReadingStreak', () => ({
  useReadingStreak: () => ({
    streak: {
      current: 3,
      max: 3,
      freezesAvailable: 2,
      freeFreezes: mockFreeFreezes,
    },
    isStreaksEnabled: true,
  }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1' } }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../streak/StreakReminderSwitch', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../streak/StreakFreezeUpsell', () => ({
  StreakFreezeUpsell: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="streak-freeze-upsell">{children}</span>
  ),
}));

const renderModal = (currentStreak = 3) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <NewStreakModal
        isOpen
        currentStreak={currentStreak}
        maxStreak={3}
        onRequestClose={jest.fn()}
      />
    </QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockCompletedActions = [];
  mockFreeFreezes = 2;
  mockIsFlagOn = true;
});

it('shows the free freezes grant on the three-day milestone and marks it seen', async () => {
  renderModal();

  expect(
    await screen.findByText(STREAK_FREE_FREEZES_GRANT_COPY),
  ).toBeInTheDocument();
  expect(STREAK_FREE_FREEZES_GRANT_COPY).toEqual(
    "You've earned 2 streak freezes, on us. Miss a weekday and we'll use one automatically.",
  );
  expect(screen.queryByTestId('streak-freeze-upsell')).not.toBeInTheDocument();
  expect(mockCompleteAction).toHaveBeenCalledWith(
    ActionType.StreakFreeFreezesGrant,
  );
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Impression,
    target_type: TargetType.StreakFreeFreezesGrant,
    target_id: '2',
  });
});

it('does not show the grant again once it was seen', async () => {
  mockCompletedActions = [ActionType.StreakFreeFreezesGrant];

  renderModal();

  expect(await screen.findByTestId('streak-freeze-upsell')).toBeInTheDocument();
  expect(
    screen.queryByText(STREAK_FREE_FREEZES_GRANT_COPY),
  ).not.toBeInTheDocument();
  expect(mockCompleteAction).not.toHaveBeenCalled();
});

it.each([
  [
    'the flag is off',
    () => {
      mockIsFlagOn = false;
    },
    3,
  ],
  [
    'a free freeze was already used',
    () => {
      mockFreeFreezes = 1;
    },
    3,
  ],
  [
    'the reader never got free freezes',
    () => {
      mockFreeFreezes = null;
    },
    3,
  ],
  ['the milestone is not the three-day one', () => undefined, 7],
])('does not show the grant when %s', async (_, arrange, current) => {
  arrange();

  renderModal(current);

  await waitFor(() =>
    expect(screen.getByTestId('streak-freeze-upsell')).toBeInTheDocument(),
  );
  expect(
    screen.queryByText(STREAK_FREE_FREEZES_GRANT_COPY),
  ).not.toBeInTheDocument();
  expect(mockCompleteAction).not.toHaveBeenCalledWith(
    ActionType.StreakFreeFreezesGrant,
  );
});
