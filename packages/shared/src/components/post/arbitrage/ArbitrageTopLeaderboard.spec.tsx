import React from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { ArbitrageTopLeaderboard } from './ArbitrageTopLeaderboard';
import { useTimedRelease } from './useTimedRelease';
import { useFeature } from '../../GrowthBookProvider';
import { TOP_LEADERBOARD_STICKY_MS } from './slots';

jest.mock('../../GrowthBookProvider', () => ({
  ...(jest.requireActual('../../GrowthBookProvider') as Record<
    string,
    unknown
  >),
  useFeature: jest.fn(),
}));

const mockUseFeature = jest.mocked(useFeature);

const scroll = (): void => {
  act(() => {
    globalThis.dispatchEvent(new Event('scroll'));
  });
};

const advancePastStickyWindow = (): void => {
  act(() => {
    jest.advanceTimersByTime(TOP_LEADERBOARD_STICKY_MS);
  });
};

// Pinning is the laptop variant now: below it the unit pins as part of the
// header block its parent wraps around, not on its own.
const isPinned = (container: HTMLElement): boolean =>
  !!container.firstElementChild?.classList.contains('laptop:sticky');

beforeEach(() => {
  jest.useFakeTimers();
  mockUseFeature.mockReturnValue({});
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ArbitrageTopLeaderboard', () => {
  it('pins from laptop up until it is released', () => {
    const { container } = render(<ArbitrageTopLeaderboard released={false} />);

    expect(isPinned(container)).toBe(true);
  });

  it('scrolls away with the page once released', () => {
    const { container } = render(<ArbitrageTopLeaderboard released />);

    expect(isPinned(container)).toBe(false);
  });
});

describe('useTimedRelease', () => {
  it('holds the sticky window open while the visitor has not scrolled yet', () => {
    const { result } = renderHook(() =>
      useTimedRelease(TOP_LEADERBOARD_STICKY_MS),
    );
    advancePastStickyWindow();

    expect(result.current).toBe(false);
  });

  it('releases once the window elapses after the first scroll', () => {
    const { result } = renderHook(() =>
      useTimedRelease(TOP_LEADERBOARD_STICKY_MS),
    );
    scroll();
    expect(result.current).toBe(false);

    advancePastStickyWindow();

    expect(result.current).toBe(true);
  });
});
