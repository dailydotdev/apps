import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { PublicProfile } from '../../../../lib/user';
import type { HotTake } from '../../../../graphql/user/userHotTake';
import {
  HOT_TAKE_LIMIT_HINT,
  HOT_TAKE_LIMIT_REACHED_MESSAGE,
  MAX_HOT_TAKES,
  useHotTakes,
} from '../../hooks/useHotTakes';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';
import { useVoteHotTake } from '../../../../hooks/vote/useVoteHotTake';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';
import { useEngagementBarV2 } from '../../../../hooks/useEngagementBarV2';
import { ProfileUserHotTakes } from './ProfileUserHotTakes';

jest.mock('../../hooks/useHotTakes', () => ({
  HOT_TAKE_LIMIT_HINT: 'You can add up to 5 hot takes',
  HOT_TAKE_LIMIT_REACHED_MESSAGE:
    'You already have all 5 hot takes. Remove one to add a new one.',
  MAX_HOT_TAKES: 5,
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

jest.mock('../../../../hooks/useEngagementBarV2', () => ({
  useEngagementBarV2: jest.fn(),
}));

jest.mock('./HotTakeModal', () => ({
  HotTakeModal: () => <div data-testid="hot-take-modal" />,
}));

const mockedUseRouter = useRouter as jest.Mock;
const mockedUseHotTakes = useHotTakes as jest.Mock;
const mockedUseToastNotification = useToastNotification as jest.Mock;
const mockedUsePrompt = usePrompt as jest.Mock;
const mockedUseVoteHotTake = useVoteHotTake as jest.Mock;
const mockedUseLogContext = useLogContext as jest.Mock;
const mockedUseEngagementBarV2 = useEngagementBarV2 as jest.Mock;

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

const renderProfileUserHotTakes = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ProfileUserHotTakes user={user} />
    </QueryClientProvider>,
  );

const mockHotTakes = ({
  hotTakes = [],
  isOwner = true,
  canAddMore = true,
  isLoading = false,
}: {
  hotTakes?: HotTake[];
  isOwner?: boolean;
  canAddMore?: boolean;
  isLoading?: boolean;
} = {}) => {
  mockedUseHotTakes.mockReturnValue({
    hotTakes,
    isOwner,
    canAddMore,
    isLoading,
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  });
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
    mockedUseEngagementBarV2.mockReturnValue(false);
    mockHotTakes();
  });

  it('should open the add hot take modal from the profile query param', async () => {
    window.history.pushState({}, '', '/tester?addHotTake=1#hot-takes');
    const { replace } = mockRouter({
      userId: 'tester',
      addHotTake: '1',
    });

    renderProfileUserHotTakes();

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
    mockHotTakes({
      hotTakes: Array.from({ length: 5 }, (_, index) =>
        createHotTake(index + 1),
      ),
      isOwner: true,
      canAddMore: false,
      isLoading: false,
    });

    renderProfileUserHotTakes();

    await waitFor(() => {
      expect(displayToast).toHaveBeenCalledWith(HOT_TAKE_LIMIT_REACHED_MESSAGE);
    });
    expect(screen.queryByTestId('hot-take-modal')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    expect(replace).toHaveBeenCalledWith('/tester#hot-takes', undefined, {
      shallow: true,
    });
  });

  it('shows a disabled add control and cap copy for owners at the limit', () => {
    mockHotTakes({
      hotTakes: Array.from({ length: MAX_HOT_TAKES }, (_, index) =>
        createHotTake(index + 1),
      ),
      canAddMore: false,
    });

    renderProfileUserHotTakes();

    expect(screen.getByText(HOT_TAKE_LIMIT_HINT)).toBeVisible();
    expect(
      screen.queryByText(`${MAX_HOT_TAKES}/${MAX_HOT_TAKES}`),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    expect(screen.getByLabelText(HOT_TAKE_LIMIT_REACHED_MESSAGE)).toBeVisible();
  });

  it('does not open the modal or log a start event from the disabled add control', async () => {
    mockHotTakes({
      hotTakes: Array.from({ length: MAX_HOT_TAKES }, (_, index) =>
        createHotTake(index + 1),
      ),
      canAddMore: false,
    });

    renderProfileUserHotTakes();

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.queryByTestId('hot-take-modal')).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalledWith({
      event_name: LogEvent.StartAddHotTake,
    });
  });

  it('opens the modal and logs a start event from the enabled add control', async () => {
    mockHotTakes({
      hotTakes: [createHotTake(1), createHotTake(2), createHotTake(3)],
      canAddMore: true,
    });

    renderProfileUserHotTakes();

    expect(screen.getByText(HOT_TAKE_LIMIT_HINT)).toBeVisible();
    expect(screen.queryByText(`3/${MAX_HOT_TAKES}`)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByTestId('hot-take-modal')).toBeVisible();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.StartAddHotTake,
    });
  });

  it('does not show owner-only controls or the cap indicator for visitors', () => {
    mockHotTakes({
      hotTakes: [createHotTake(1)],
      isOwner: false,
    });

    renderProfileUserHotTakes();

    expect(
      screen.queryByRole('button', { name: 'Add' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(`1/${MAX_HOT_TAKES}`)).not.toBeInTheDocument();
    expect(screen.queryByText(HOT_TAKE_LIMIT_HINT)).not.toBeInTheDocument();
    expect(screen.getByText('Hot take 1')).toBeVisible();
  });

  it('renders the hot takes anchor while loading for visitors', () => {
    mockHotTakes({
      isOwner: false,
      isLoading: true,
    });

    renderProfileUserHotTakes();

    expect(document.getElementById('hot-takes')).toBeInTheDocument();
  });

  it.each([
    ['v1', false],
    ['v2', true],
  ])('keeps owner item controls visible without hover in %s', (_, useV2) => {
    mockedUseEngagementBarV2.mockReturnValue(useV2);
    mockHotTakes({
      hotTakes: [createHotTake(1)],
    });

    renderProfileUserHotTakes();

    const editButton = screen.getByRole('button', { name: 'Edit hot take' });
    const deleteButton = screen.getByRole('button', {
      name: 'Delete hot take',
    });
    const controls = editButton.parentElement;

    expect(editButton).toBeVisible();
    expect(deleteButton).toBeVisible();
    expect(controls).not.toHaveClass('opacity-0');
    expect(controls).not.toHaveClass('group-hover:opacity-100');
  });
});
