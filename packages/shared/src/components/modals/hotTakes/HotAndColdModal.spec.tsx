import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { HotTake } from '../../../graphql/user/userHotTake';
import { useDiscoverHotTakes } from '../../../hooks/useDiscoverHotTakes';
import { useVoteHotTake } from '../../../hooks/vote/useVoteHotTake';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent, Origin } from '../../../lib/log';
import HotAndColdModal from './HotAndColdModal';

jest.mock('../../../hooks/useDiscoverHotTakes', () => ({
  useDiscoverHotTakes: jest.fn(),
}));

jest.mock('../../../hooks/vote/useVoteHotTake', () => ({
  useVoteHotTake: jest.fn(),
}));

jest.mock('../../../contexts/LogContext', () => ({
  ...jest.requireActual('../../../contexts/LogContext'),
  useLogContext: jest.fn(),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../../contexts/AuthContext'),
  useAuthContext: jest.fn(),
}));

const mockedUseDiscoverHotTakes = useDiscoverHotTakes as jest.Mock;
const mockedUseVoteHotTake = useVoteHotTake as jest.Mock;
const mockedUseLogContext = useLogContext as jest.Mock;
const mockedUseAuthContext = useAuthContext as jest.Mock;

const createHotTake = (id = 'take-1'): HotTake => ({
  id,
  emoji: '🔥',
  title: 'Type safety everywhere',
  subtitle: 'No runtime surprises',
  position: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  upvotes: 24,
  upvoted: false,
});

const renderComponent = (onRequestClose = jest.fn()) => {
  render(
    <HotAndColdModal
      isOpen
      onRequestClose={onRequestClose}
      ariaHideApp={false}
    />,
  );

  return { onRequestClose };
};

describe('HotAndColdModal', () => {
  const toggleUpvote = jest.fn();
  const toggleDownvote = jest.fn();
  const dismissCurrent = jest.fn();
  const logEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseVoteHotTake.mockReturnValue({
      toggleUpvote,
      toggleDownvote,
    });
    mockedUseLogContext.mockReturnValue({
      logEvent,
    });
    mockedUseAuthContext.mockReturnValue({
      user: { username: 'tester' },
    });
    mockedUseDiscoverHotTakes.mockReturnValue({
      hotTakes: [createHotTake()],
      currentTake: createHotTake(),
      nextTake: null,
      isEmpty: false,
      isLoading: false,
      dismissCurrent,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should trigger upvote flow for hot action', () => {
    jest.useFakeTimers();
    const currentTake = createHotTake('hot-take');

    mockedUseDiscoverHotTakes.mockReturnValue({
      hotTakes: [currentTake],
      currentTake,
      nextTake: null,
      isEmpty: false,
      isLoading: false,
      dismissCurrent,
    });

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Hot take - upvote' }));

    expect(toggleUpvote).toHaveBeenCalledWith({
      payload: currentTake,
      origin: Origin.HotAndCold,
    });
    expect(toggleDownvote).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.VoteHotAndCold,
        target_id: currentTake.id,
      }),
    );

    const loggedSwipePayload = logEvent.mock.calls[0][0];
    expect(JSON.parse(loggedSwipePayload.extra)).toEqual({
      vote: 'hot',
      direction: 'right',
      hotTakeId: currentTake.id,
    });

    expect(dismissCurrent).not.toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    expect(dismissCurrent).toHaveBeenCalledTimes(1);
  });

  it('should trigger downvote flow for cold action', () => {
    jest.useFakeTimers();
    const currentTake = createHotTake('cold-take');

    mockedUseDiscoverHotTakes.mockReturnValue({
      hotTakes: [currentTake],
      currentTake,
      nextTake: null,
      isEmpty: false,
      isLoading: false,
      dismissCurrent,
    });

    renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: 'Cold take - downvote' }),
    );

    expect(toggleDownvote).toHaveBeenCalledWith({
      payload: currentTake,
      origin: Origin.HotAndCold,
    });
    expect(toggleUpvote).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.VoteHotAndCold,
        target_id: currentTake.id,
      }),
    );

    const loggedSwipePayload = logEvent.mock.calls[0][0];
    expect(JSON.parse(loggedSwipePayload.extra)).toEqual({
      vote: 'cold',
      direction: 'left',
      hotTakeId: currentTake.id,
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(dismissCurrent).toHaveBeenCalledTimes(1);
  });

  it('should render empty state share button and close modal on click', () => {
    mockedUseDiscoverHotTakes.mockReturnValue({
      hotTakes: [],
      currentTake: null,
      nextTake: null,
      isEmpty: true,
      isLoading: false,
      dismissCurrent,
    });

    const { onRequestClose } = renderComponent();

    expect(screen.getByText("You've seen all the hot takes!")).toBeVisible();

    const shareLink = screen.getByRole('link', {
      name: 'Share your hot takes',
    });
    expect(shareLink).toHaveAttribute('href', '/tester#hot-takes');

    fireEvent.click(shareLink);

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('should render add-your-own-hot-take button and close modal on click', () => {
    const { onRequestClose } = renderComponent();

    const addButton = screen.getByRole('link', {
      name: 'Add your own hot take',
    });
    expect(addButton).toHaveAttribute('href', '/tester#hot-takes');

    fireEvent.click(addButton);

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('should keep subtitle visible even when title is very long', () => {
    const currentTake = {
      ...createHotTake('long-text'),
      title:
        'This is a very long hot take title that should still be fully visible while forcing the subtitle to hide in order to keep the card layout stable in the modal, especially when additional context is included.',
      subtitle:
        'This subtitle is intentionally long so we can validate that the modal clamps text after a few lines and keeps the card content contained.',
    };

    mockedUseDiscoverHotTakes.mockReturnValue({
      hotTakes: [currentTake],
      currentTake,
      nextTake: null,
      isEmpty: false,
      isLoading: false,
      dismissCurrent,
    });

    renderComponent();

    expect(screen.getByText(currentTake.title)).toHaveClass(
      'w-full',
      'break-words',
    );
    expect(screen.getByText(currentTake.subtitle)).toHaveClass(
      'w-full',
      'break-words',
      'text-center',
    );
    expect(screen.getByText(currentTake.subtitle)).not.toHaveClass(
      'line-clamp-3',
    );
  });
});
