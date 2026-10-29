import React from 'react';
import type { ReactElement } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import type { AdRefreshConfig } from '../../../graphql/posts';
import {
  AdRefreshOutcome,
  AdRefreshPause,
  AdRefreshPlatform,
  AdRefreshStopReason,
} from './adRefresh';
import type { AdRefreshAttempt, AdRefreshStop } from './useAdRefresh';
import { AD_REFRESH_TICK_MS, useAdRefresh } from './useAdRefresh';
import { useAdRefreshContext } from './AdRefreshContext';

jest.mock('./AdRefreshContext', () => ({
  useAdRefreshContext: jest.fn(),
}));

let config: AdRefreshConfig;
let sessionCount: number;

type OnRefresh = jest.Mock<Promise<AdRefreshOutcome>, [AdRefreshAttempt]>;
type OnStop = jest.Mock<void, [AdRefreshStop]>;

const Slot = ({
  refresh,
  onRefresh,
  onStop,
}: {
  refresh: AdRefreshConfig | null;
  onRefresh: OnRefresh;
  onStop: OnStop;
}): ReactElement => {
  const { ref } = useAdRefresh({ refresh, onRefresh, onStop });

  return <div ref={ref} data-testid="slot" />;
};

const advance = async (ms: number) => {
  await Array.from({ length: ms / AD_REFRESH_TICK_MS }).reduce<Promise<void>>(
    async (previous) => {
      await previous;
      await act(async () => {
        jest.advanceTimersByTime(AD_REFRESH_TICK_MS);
      });
    },
    Promise.resolve(),
  );
};

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  });
};

const mountSlot = (refresh: AdRefreshConfig | null = config) => {
  const onRefresh: OnRefresh = jest
    .fn()
    .mockResolvedValue(AdRefreshOutcome.Refreshed);
  const onStop: OnStop = jest.fn();
  const view = render(
    <Slot refresh={refresh} onRefresh={onRefresh} onStop={onStop} />,
  );
  act(() => mockAllIsIntersecting(true));
  fireEvent.pointerMove(window);

  return {
    onRefresh,
    onStop,
    rerender: (nextRefresh: AdRefreshConfig | null) =>
      view.rerender(
        <Slot refresh={nextRefresh} onRefresh={onRefresh} onStop={onStop} />,
      ),
  };
};

beforeEach(() => {
  jest.useFakeTimers();
  setVisibility('visible');
  sessionCount = 0;
  config = {
    id: 'test@v1',
    intervalSec: 3,
    maxPerSlot: 5,
    maxPerSession: 10,
  };
  jest.mocked(useAdRefreshContext).mockReturnValue({
    platform: AdRefreshPlatform.WebDesktop,
    getSessionCount: () => sessionCount,
    countSessionRefresh: () => {
      sessionCount += 1;
    },
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useAdRefresh', () => {
  it('refreshes once the slot has been in view for the interval', async () => {
    const { onRefresh } = mountSlot();

    await advance(2 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();

    await advance(AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 1,
        sessionCount: 1,
        policy: expect.objectContaining({ configId: 'test@v1' }),
        stats: expect.objectContaining({ visibleMs: 3 * AD_REFRESH_TICK_MS }),
      }),
    );
  });

  it('keeps visible time across scrolling away instead of restarting', async () => {
    const { onRefresh } = mountSlot();

    await advance(2 * AD_REFRESH_TICK_MS);
    act(() => mockAllIsIntersecting(false));
    await advance(10 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();

    act(() => mockAllIsIntersecting(true));
    await advance(AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('holds while hovered and stops for good after a click', async () => {
    const { onRefresh, onStop } = mountSlot();
    const slot = screen.getByTestId('slot');

    fireEvent.mouseEnter(slot);
    await advance(5 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();

    fireEvent.mouseLeave(slot);
    fireEvent.click(slot);
    await advance(10 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(onStop).toHaveBeenCalledWith(
      expect.objectContaining({ reason: AdRefreshStopReason.Clicked }),
    );
  });

  it('pauses while the tab is hidden and reports the pause', async () => {
    const { onRefresh } = mountSlot();

    setVisibility('hidden');
    await advance(10 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();

    setVisibility('visible');
    fireEvent.pointerMove(window);
    await advance(3 * AD_REFRESH_TICK_MS);
    expect(
      onRefresh.mock.calls[0][0].stats.pauses[AdRefreshPause.Hidden],
    ).toEqual({ count: 1, ms: 10 * AD_REFRESH_TICK_MS });
  });

  it('pauses while the user is idle', async () => {
    config = { ...config, idleAfterSec: 2 };
    const { onRefresh } = mountSlot();

    await advance(10 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();

    await [1, 2, 3].reduce(async (previous) => {
      await previous;
      fireEvent.pointerMove(window);
      await advance(AD_REFRESH_TICK_MS);
    }, Promise.resolve());
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('stops at the per-slot cap', async () => {
    config = { ...config, maxPerSlot: 2 };
    const { onRefresh, onStop } = mountSlot();

    await advance(30 * AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(2);
    expect(sessionCount).toEqual(2);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: AdRefreshStopReason.SlotCap,
        count: 2,
      }),
    );
  });

  it('stops at the per-session cap', async () => {
    sessionCount = 10;
    const { onRefresh, onStop } = mountSlot();

    await advance(5 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(onStop).toHaveBeenCalledWith(
      expect.objectContaining({ reason: AdRefreshStopReason.SessionCap }),
    );
  });

  it('does not count a refresh that found no ad', async () => {
    config = { ...config, maxPerSlot: 1 };
    const { onRefresh } = mountSlot();
    onRefresh.mockResolvedValueOnce(AdRefreshOutcome.NoFill);

    await advance(6 * AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(2);
    expect(sessionCount).toEqual(1);
  });

  it('stops when the new ad comes back without a config', async () => {
    const { onRefresh, onStop, rerender } = mountSlot();

    await advance(3 * AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(1);

    rerender(null);
    await advance(10 * AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: AdRefreshStopReason.NoConfig,
        count: 1,
      }),
    );
  });

  it('never refreshes without a config', async () => {
    const { onRefresh, onStop } = mountSlot(null);

    await advance(10 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
  });
});
