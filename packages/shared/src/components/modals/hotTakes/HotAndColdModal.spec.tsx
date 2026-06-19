import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { HotTake } from '../../../graphql/user/userHotTake';
import { useDiscoverHotTakes } from '../../../hooks/useDiscoverHotTakes';
import { useVoteHotTake } from '../../../hooks/vote/useVoteHotTake';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useMedia } from '../../../hooks/useMedia';
import { useViewSize } from '../../../hooks/useViewSize';
import { LogEvent, Origin } from '../../../lib/log';
import HotAndColdModal, {
  getElasticDelta,
  quantizeIntensity,
  smoothstep01,
} from './HotAndColdModal';

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

jest.mock('../../../hooks/useMedia', () => ({
  useMedia: jest.fn(),
}));

jest.mock('../../../hooks/useViewSize', () => ({
  ViewSize: {
    MobileL: 'mobileL',
  },
  useViewSize: jest.fn(),
}));

jest.mock('../../../hooks/useRequestProtocol', () => ({
  useRequestProtocol: () => ({ isCompanion: false }),
}));

const mockedUseDiscoverHotTakes = useDiscoverHotTakes as jest.Mock;
const mockedUseVoteHotTake = useVoteHotTake as jest.Mock;
const mockedUseLogContext = useLogContext as jest.Mock;
const mockedUseAuthContext = useAuthContext as jest.Mock;
const mockedUseMedia = useMedia as jest.Mock;
const mockedUseViewSize = useViewSize as jest.Mock;

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
  const view = render(
    <HotAndColdModal
      isOpen
      onRequestClose={onRequestClose}
      ariaHideApp={false}
    />,
  );

  return { onRequestClose, ...view };
};

const swipeCard = ({
  deltaX = 0,
  deltaY = 0,
}: {
  deltaX?: number;
  deltaY?: number;
}) => {
  const swipeArea = screen.getAllByTestId('hot-takes-swipe-area')[0];
  const startX = 200;
  const startY = 400;

  fireEvent.mouseDown(swipeArea, {
    clientX: startX,
    clientY: startY,
    buttons: 1,
  });
  fireEvent.mouseMove(document, {
    clientX: startX + deltaX,
    clientY: startY + deltaY,
    buttons: 1,
  });
  fireEvent.mouseUp(document, {
    clientX: startX + deltaX,
    clientY: startY + deltaY,
  });
};

describe('HotAndColdModal', () => {
  const toggleUpvote = jest.fn();
  const toggleDownvote = jest.fn();
  const cancelHotTakeVote = jest.fn();
  const dismissCurrent = jest.fn();
  const logEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseVoteHotTake.mockReturnValue({
      toggleUpvote,
      toggleDownvote,
      cancelHotTakeVote,
    });
    mockedUseLogContext.mockReturnValue({
      logEvent,
    });
    mockedUseAuthContext.mockReturnValue({
      user: { username: 'tester' },
    });
    mockedUseMedia.mockReturnValue(false);
    mockedUseViewSize.mockReturnValue(false);
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

  it('should keep swipe helper math bounded and quantized', () => {
    expect(smoothstep01(-1)).toBe(0);
    expect(smoothstep01(0.5)).toBe(0.5);
    expect(smoothstep01(2)).toBe(1);
    expect(getElasticDelta(40)).toBe(40);
    expect(getElasticDelta(120)).toBe(92);
    expect(getElasticDelta(-120)).toBe(-92);
    expect(quantizeIntensity(0.53)).toBe(0.55);
    expect(quantizeIntensity(1.2)).toBe(1);
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

  it('should trigger upvote flow when swiped right past threshold', () => {
    jest.useFakeTimers();
    const currentTake = createHotTake('swipe-hot-take');

    mockedUseDiscoverHotTakes.mockReturnValue({
      hotTakes: [currentTake],
      currentTake,
      nextTake: null,
      isEmpty: false,
      isLoading: false,
      dismissCurrent,
    });

    renderComponent();

    swipeCard({ deltaX: 130 });

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
    expect(dismissCurrent).not.toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    expect(dismissCurrent).toHaveBeenCalledTimes(1);
  });

  it('should snap back when swiped under threshold', () => {
    renderComponent();

    swipeCard({ deltaX: 50 });

    expect(toggleUpvote).not.toHaveBeenCalled();
    expect(toggleDownvote).not.toHaveBeenCalled();
    expect(cancelHotTakeVote).not.toHaveBeenCalled();
    expect(dismissCurrent).not.toHaveBeenCalled();
  });

  it('should trigger skip flow when swiped up past threshold', () => {
    jest.useFakeTimers();
    const currentTake = createHotTake('swipe-skip-take');

    mockedUseDiscoverHotTakes.mockReturnValue({
      hotTakes: [currentTake],
      currentTake,
      nextTake: null,
      isEmpty: false,
      isLoading: false,
      dismissCurrent,
    });

    renderComponent();

    swipeCard({ deltaY: -130 });

    expect(cancelHotTakeVote).toHaveBeenCalledWith({ id: currentTake.id });
    expect(toggleUpvote).not.toHaveBeenCalled();
    expect(toggleDownvote).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.SkipHotTake,
        target_id: currentTake.id,
      }),
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(dismissCurrent).toHaveBeenCalledTimes(1);
  });

  it('should write the active drag transform outside React state', () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame =
      jest.fn() as typeof window.cancelAnimationFrame;

    try {
      renderComponent();

      const swipeArea = screen.getByTestId('hot-takes-swipe-area');
      fireEvent.mouseDown(swipeArea, {
        clientX: 200,
        clientY: 400,
        buttons: 1,
      });
      fireEvent.mouseMove(document, {
        clientX: 296,
        clientY: 400,
        buttons: 1,
      });

      const activeCard = document.querySelector(
        '[data-testid="hot-take-card"][data-active-card="true"]',
      ) as HTMLElement;

      expect(activeCard.style.transform).toContain('translateX(96px)');
      expect(activeCard).toHaveStyle({ willChange: 'transform' });
    } finally {
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;
    }
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

  it('should trigger neutral vote flow for skip action', () => {
    jest.useFakeTimers();
    const currentTake = createHotTake('skip-take');

    mockedUseDiscoverHotTakes.mockReturnValue({
      hotTakes: [currentTake],
      currentTake,
      nextTake: null,
      isEmpty: false,
      isLoading: false,
      dismissCurrent,
    });

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Skip hot take' }));

    expect(cancelHotTakeVote).toHaveBeenCalledWith({ id: currentTake.id });
    expect(toggleUpvote).not.toHaveBeenCalled();
    expect(toggleDownvote).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.SkipHotTake,
        target_id: currentTake.id,
      }),
    );

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
    expect(shareLink).toHaveAttribute('href', '/tester?addHotTake=1#hot-takes');

    fireEvent.click(shareLink);

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('should render add-your-own-hot-take button and close modal on click', () => {
    const { onRequestClose } = renderComponent();

    const addButton = screen.getByRole('link', {
      name: 'Add your own hot take',
    });
    expect(addButton).toHaveAttribute('href', '/tester?addHotTake=1#hot-takes');

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

  it('should keep long author names and handles shrinkable in the attribution row', () => {
    const longName = 'Confident Coding With A Very Long Display Name';
    const longUsername = 'confidentcodingwithaverylonghandle';
    const currentTake = {
      ...createHotTake('long-author'),
      user: {
        id: 'user-1',
        name: longName,
        username: longUsername,
        image: 'https://daily.dev/avatar.png',
        createdAt: '2026-01-01T00:00:00.000Z',
        reputation: 42,
        permalink: '/confidentcodingwithaverylonghandle',
        companies: [],
        isPlus: false,
      },
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

    const authorName = screen.getByText(longName);
    const authorHandle = screen.getByText(`@${longUsername}`);

    expect(authorName.parentElement).toHaveClass(
      'flex',
      'min-w-0',
      'items-center',
      'gap-1',
    );
    expect(authorName).toHaveClass('min-w-0', 'truncate');
    expect(authorHandle).toHaveClass('min-w-0', 'truncate');
  });

  it('should keep onboarding mode clipped and scrollable inside the modal shell', () => {
    render(
      <HotAndColdModal
        isOpen
        onRequestClose={jest.fn()}
        ariaHideApp={false}
        onboardingCards={[
          {
            id: 'onboarding-card-1',
            title: 'Figma launches MCP tool for AI agents to design on canvas',
            summary:
              'A generated TLDR keeps the onboarding card readable while the modal stays within its shell.',
            tags: ['ai-agents', 'figma', 'mcp'],
            source: { name: 'daily.dev' },
          },
        ]}
        topSlot={<div>Progress header</div>}
        bottomSlot={<div>Starter feed ready</div>}
      />,
    );

    const modalBody = document.querySelector('section');
    expect(modalBody).toHaveClass('overflow-y-auto', 'overflow-x-hidden');
    expect(modalBody).not.toHaveClass(
      'tablet:!overflow-x-visible',
      'tablet:!overflow-y-visible',
    );

    // The onboarding panel duplicates its swipe actions (one block for
    // mobile, one for tablet) so the row stays visible at every breakpoint;
    // JSDOM renders both, so just assert presence of at least one of each.
    expect(
      screen.getAllByRole('button', { name: 'Not interesting' })[0],
    ).toBeVisible();
    expect(
      screen.getAllByRole('button', { name: 'Interesting' })[0],
    ).toBeVisible();
    expect(
      screen.getAllByRole('img', { name: 'daily.dev source icon' })[0],
    ).toBeVisible();
    expect(screen.getAllByText('Starter feed ready')[0]).toBeVisible();
  });

  it('should preserve onboarding swipe action metadata', () => {
    jest.useFakeTimers();
    const onSwipeAction = jest.fn();

    render(
      <HotAndColdModal
        isOpen
        onRequestClose={jest.fn()}
        ariaHideApp={false}
        onboardingCards={[
          {
            id: 'onboarding-card-1',
            title: 'Figma launches MCP tool for AI agents to design on canvas',
            source: { name: 'daily.dev' },
          },
        ]}
        onSwipeAction={onSwipeAction}
      />,
    );

    swipeCard({ deltaX: 130 });

    expect(onSwipeAction).toHaveBeenCalledWith('right', {
      onboardingCardId: 'onboarding-card-1',
    });

    act(() => {
      jest.runAllTimers();
    });
  });

  it('should render lightweight directional effects on mobile', () => {
    mockedUseViewSize.mockReturnValue(true);
    renderComponent();

    const swipeArea = screen.getAllByTestId('hot-takes-swipe-area')[0];
    fireEvent.mouseDown(swipeArea, {
      clientX: 200,
      clientY: 400,
      buttons: 1,
    });
    fireEvent.mouseMove(document, {
      clientX: 320,
      clientY: 400,
      buttons: 1,
    });

    expect(
      document.querySelectorAll('[data-hot-take-particle="flame"]'),
    ).toHaveLength(4);
    expect(screen.getByText('HOT 🔥')).toBeInTheDocument();
  });

  it('should remove decorative particles for reduced motion', () => {
    mockedUseMedia.mockReturnValue(true);
    renderComponent();

    const swipeArea = screen.getAllByTestId('hot-takes-swipe-area')[0];
    fireEvent.mouseDown(swipeArea, {
      clientX: 200,
      clientY: 400,
      buttons: 1,
    });
    fireEvent.mouseMove(document, {
      clientX: 320,
      clientY: 400,
      buttons: 1,
    });

    expect(document.querySelectorAll('[data-hot-take-particle]')).toHaveLength(
      0,
    );
    expect(screen.getByText('HOT 🔥')).toBeInTheDocument();
  });
});
