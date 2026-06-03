import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { PublicProfile } from '../../../../lib/user';
import type { HotTake } from '../../../../graphql/user/userHotTake';
import { useHotTakes } from '../../hooks/useHotTakes';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';
import { useVoteHotTake } from '../../../../hooks/vote/useVoteHotTake';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';
import { ProfileUserHotTakes } from './ProfileUserHotTakes';

jest.mock('../../hooks/useHotTakes', () => ({
  HOT_TAKE_LIMIT_REACHED_MESSAGE:
    'You already have all 5 hot takes. Remove one to add a new one.',
  useHotTakes: jest.fn(),
}));

jest.mock('../../../../hooks/useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

jest.mock('../../../../hooks/usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../../../../hooks/vote/useVoteHotTake', () => ({
  useVoteHotTake: jest.fn(),
}));

jest.mock('../../../../contexts/LogContext', () => ({
  ...jest.requireActual('../../../../contexts/LogContext'),
  useLogContext: jest.fn(),
}));

jest.mock('./HotTakeModal', () => ({
  HotTakeModal: () => <div data-testid="hot-take-modal" />,
}));

jest.mock('./HotTakeItem', () => ({
  HotTakeItem: ({ item }: { item: { title: string } }) => (
    <div>{item.title}</div>
  ),
}));

const mockedUseRouter = useRouter as jest.Mock;
const mockedUseHotTakes = useHotTakes as jest.Mock;
const mockedUseToastNotification = useToastNotification as jest.Mock;
const mockedUsePrompt = usePrompt as jest.Mock;
const mockedUseVoteHotTake = useVoteHotTake as jest.Mock;
const mockedUseLogContext = useLogContext as jest.Mock;

const user: PublicProfile = {
  id: 'user-1',
  name: 'Tester',
  username: 'tester',
  createdAt: '2026-01-01T00:00:00.000Z',
  premium: false,
  image: '',
  reputation: 0,
  permalink: '/tester',
};

const createHotTake = (position: number): HotTake => ({
  id: `take-${position}`,
  emoji: '🔥',
  title: `Hot take ${position}`,
  subtitle: null,
  position,
  createdAt: '2026-01-01T00:00:00.000Z',
  upvotes: 0,
  upvoted: false,
});

const mockRouter = (query: NextRouter['query'] = {}) => {
  const replace = jest.fn();

  mockedUseRouter.mockReturnValue({
    query,
    pathname: '/[userId]',
    replace,
  } as unknown as NextRouter);

  return { replace };
};

describe('ProfileUserHotTakes', () => {
  const displayToast = jest.fn();
  const logEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/tester');
    mockRouter();
    mockedUseToastNotification.mockReturnValue({
      displayToast,
      dismissToast: jest.fn(),
    });
    mockedUsePrompt.mockReturnValue({
      showPrompt: jest.fn(),
    });
    mockedUseVoteHotTake.mockReturnValue({
      toggleUpvote: jest.fn(),
    });
    mockedUseLogContext.mockReturnValue({
      logEvent,
    });
    mockedUseHotTakes.mockReturnValue({
      hotTakes: [],
      isOwner: true,
      canAddMore: true,
      isLoading: false,
      add: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    });
  });

  it('should open the add hot take modal from the profile query param', async () => {
    window.history.pushState({}, '', '/tester?addHotTake=1#hot-takes');
    const { replace } = mockRouter({
      userId: 'tester',
      addHotTake: '1',
    });

    render(<ProfileUserHotTakes user={user} />);

    expect(await screen.findByTestId('hot-take-modal')).toBeVisible();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.StartAddHotTake,
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/tester#hot-takes', undefined, {
        shallow: true,
      });
    });
  });

  it('should show the limit toast from the profile query param when the user cannot add more', async () => {
    window.history.pushState({}, '', '/tester?addHotTake=1#hot-takes');
    const { replace } = mockRouter({
      userId: 'tester',
      addHotTake: '1',
    });
    mockedUseHotTakes.mockReturnValue({
      hotTakes: Array.from({ length: 5 }, (_, index) =>
        createHotTake(index + 1),
      ),
      isOwner: true,
      canAddMore: false,
      isLoading: false,
      add: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    });

    render(<ProfileUserHotTakes user={user} />);

    await waitFor(() => {
      expect(displayToast).toHaveBeenCalledWith(
        'You already have all 5 hot takes. Remove one to add a new one.',
      );
    });
    expect(screen.queryByTestId('hot-take-modal')).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/tester#hot-takes', undefined, {
      shallow: true,
    });
  });
});
