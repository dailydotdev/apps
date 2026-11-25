import React from 'react';
import type { ReactElement } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import type { AdRefreshConfig } from '../../../graphql/posts';
import {
  AdRefreshOutcome,
  AdRefreshPause,
  AdRefreshStopReason,
} from './adRefresh';
import type { AdRefreshAttempt, AdRefreshStop } from './useAdRefresh';
import {
  AD_REFRESH_TICK_MS,
  carryAdRefreshSlot,
  resetAdRefreshSession,
  useAdRefresh,
} from './useAdRefresh';

let config: AdRefreshConfig;

type OnRefresh = jest.Mock<Promise<AdRefreshOutcome>, [AdRefreshAttempt]>;
type OnStop = jest.Mock<void, [AdRefreshStop]>;

const Slot = ({
  id,
  refresh,
  onRefresh,
  onStop,
}: {
  id?: string;
  refresh: AdRefreshConfig | null;
  onRefresh: OnRefresh;
  onStop: OnStop;
}): ReactElement => {
  const { ref, onAdClick } = useAdRefresh({ id, refresh, onRefresh, onStop });

  return (
    <div ref={ref} data-testid="slot">
      <button type="button" onClick={onAdClick}>
        ad
      </button>
      <button type="button">menu</button>
    </div>
  );
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

const hover = (element: HTMLElement, pointerType: string) => {
  const event = new Event('pointerenter');
  Object.assign(event, { pointerType });
  fireEvent(element, event);
};

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  });
};

const mountSlot = (refresh: AdRefreshConfig | null = config, id?: string) => {
  const onRefresh: OnRefresh = jest
    .fn()
    .mockResolvedValue(AdRefreshOutcome.Refreshed);
  const onStop: OnStop = jest.fn();
  const view = render(
    <Slot id={id} refresh={refresh} onRefresh={onRefresh} onStop={onStop} />,
  );
  act(() => mockAllIsIntersecting(true));
  fireEvent.pointerMove(window);

  return {
    onRefresh,
    onStop,
    unmount: view.unmount,
    rerender: (nextRefresh: AdRefreshConfig | null, nextId = id) =>
      view.rerender(
        <Slot
          id={nextId}
          refresh={nextRefresh}
          onRefresh={onRefresh}
          onStop={onStop}
        />,
      ),
  };
};

beforeEach(() => {
  jest.useFakeTimers();
  setVisibility('visible');
  resetAdRefreshSession();
  config = {
    id: 'test@v1',
    intervalSec: 3,
    maxPerSlot: 5,
    maxPerSession: 10,
  };
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

    hover(slot, 'mouse');
    await advance(5 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('menu'));
    expect(onStop).not.toHaveBeenCalled();

    fireEvent.pointerLeave(slot);
    fireEvent.click(screen.getByText('ad'));
    await advance(10 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(onStop).toHaveBeenCalledWith(
      expect.objectContaining({ reason: AdRefreshStopReason.Clicked }),
    );
  });

  it('ignores the hover a touch tap leaves behind', async () => {
    const { onRefresh } = mountSlot();

    hover(screen.getByTestId('slot'), 'touch');
    await advance(3 * AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(1);
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
    expect(onRefresh).toHaveBeenLastCalledWith(
      expect.objectContaining({ sessionCount: 2 }),
    );
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: AdRefreshStopReason.SlotCap,
        count: 2,
      }),
    );
  });

  it('stops at the per-session cap', async () => {
    config = { ...config, maxPerSession: 2 };
    const { onRefresh, onStop } = mountSlot();

    await advance(30 * AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(2);
    expect(onStop).toHaveBeenCalledWith(
      expect.objectContaining({ reason: AdRefreshStopReason.SessionCap }),
    );
  });

  it.each([
    [AdRefreshOutcome.NoFill, AdRefreshStopReason.NoFill],
    [AdRefreshOutcome.Failed, AdRefreshStopReason.Failed],
  ])('stops for good when a refresh ends as %s', async (outcome, reason) => {
    const { onRefresh, onStop } = mountSlot();
    onRefresh.mockResolvedValueOnce(outcome);

    await advance(10 * AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledWith(
      expect.objectContaining({ reason, count: 0, sessionCount: 0 }),
    );
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

  it('keeps the slot count when its card remounts', async () => {
    config = { ...config, maxPerSlot: 1 };
    const { onRefresh, onStop, rerender, unmount } = mountSlot(config, 'gen-1');

    await advance(3 * AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    rerender(config, 'gen-2');
    await advance(AD_REFRESH_TICK_MS);
    expect(onStop).toHaveBeenCalledTimes(1);
    unmount();

    const remounted = mountSlot(config, 'gen-2');
    await advance(10 * AD_REFRESH_TICK_MS);
    expect(remounted.onRefresh).not.toHaveBeenCalled();
    expect(remounted.onStop).not.toHaveBeenCalled();
  });

  it('keeps the count when the card unmounts while a refresh is in flight', async () => {
    config = { ...config, maxPerSlot: 1 };
    const { onRefresh, unmount } = mountSlot(config, 'gen-1');
    let finish: (outcome: AdRefreshOutcome) => void = () => {};
    onRefresh.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );

    await advance(3 * AD_REFRESH_TICK_MS);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    unmount();
    carryAdRefreshSlot('gen-1', 'gen-2');
    await act(async () => finish(AdRefreshOutcome.Refreshed));

    const remounted = mountSlot(config, 'gen-2');
    await advance(10 * AD_REFRESH_TICK_MS);
    expect(remounted.onRefresh).not.toHaveBeenCalled();
    expect(remounted.onStop).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: AdRefreshStopReason.SlotCap,
        count: 1,
      }),
    );
  });

  it('does not count a long gap between ticks as time on screen', async () => {
    config = { ...config, intervalSec: 10 };
    const { onRefresh } = mountSlot();

    await advance(AD_REFRESH_TICK_MS);
    jest.setSystemTime(Date.now() + 60 * 60 * 1_000);
    fireEvent.pointerMove(window);
    await advance(AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('counts the real time between ticks while hidden', async () => {
    const { onRefresh } = mountSlot();

    setVisibility('hidden');
    await advance(AD_REFRESH_TICK_MS);
    jest.setSystemTime(Date.now() + 60 * 1_000);
    await advance(AD_REFRESH_TICK_MS);

    setVisibility('visible');
    fireEvent.pointerMove(window);
    await advance(3 * AD_REFRESH_TICK_MS);
    expect(
      onRefresh.mock.calls[0][0].stats.pauses[AdRefreshPause.Hidden],
    ).toEqual({ count: 1, ms: 62 * AD_REFRESH_TICK_MS });
  });

  it('never refreshes without a config', async () => {
    const { onRefresh, onStop } = mountSlot(null);

    await advance(10 * AD_REFRESH_TICK_MS);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
  });
});
