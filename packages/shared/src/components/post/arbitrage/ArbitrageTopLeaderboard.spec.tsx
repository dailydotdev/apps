import React from 'react';
import { act, render } from '@testing-library/react';
import { ArbitrageTopLeaderboard } from './ArbitrageTopLeaderboard';
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

// Pinning is tablet-and-up only, so the class to look for is the variant.
const isPinned = (container: HTMLElement): boolean =>
  !!container.firstElementChild?.classList.contains('tablet:sticky');

beforeEach(() => {
  jest.useFakeTimers();
  mockUseFeature.mockReturnValue({});
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ArbitrageTopLeaderboard', () => {
  it('stays pinned while the visitor has not scrolled yet', () => {
    const { container } = render(<ArbitrageTopLeaderboard />);
    advancePastStickyWindow();

    expect(isPinned(container)).toBe(true);
  });

  it('releases once the sticky window elapses after the first scroll', () => {
    const { container } = render(<ArbitrageTopLeaderboard />);
    scroll();
    expect(isPinned(container)).toBe(true);

    advancePastStickyWindow();

    expect(isPinned(container)).toBe(false);
  });
});
