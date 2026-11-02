/* eslint-disable no-underscore-dangle -- __ciads is Content Ignite's mandated global */
import React from 'react';
import { act, render } from '@testing-library/react';
import { useRouter } from 'next/router';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { LogContextData } from '@dailydotdev/shared/src/hooks/log/useLogContextData';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import {
  ADS_ALLOWED_CLASS,
  CONTENT_IGNITE_TAG_SRC,
} from '@dailydotdev/shared/src/features/monetization/contentIgnite';
import { ContentIgniteTag } from '../components/ContentIgniteTag';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const LogContext = getLogContextStatic();
const logEvent = jest.fn();
const routeListeners = new Set<() => void>();

const tagScripts = (): HTMLScriptElement[] =>
  Array.from(
    document.querySelectorAll<HTMLScriptElement>(
      `script[src="${CONTENT_IGNITE_TAG_SRC}"]`,
    ),
  );

/** What the loaded tag does with its queue: runs commands as they arrive. */
const loadTag = (): { reload: jest.Mock } => {
  const reload = jest.fn();
  window.__ciads = {
    cmd: { push: (command: () => void) => command() } as unknown as Array<
      () => void
    >,
    reload,
  };
  return { reload };
};

const renderTag = (enabled: boolean) =>
  render(
    <LogContext.Provider value={{ logEvent } as unknown as LogContextData}>
      <ContentIgniteTag enabled={enabled} />
    </LogContext.Provider>,
  );

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  routeListeners.clear();
  jest.mocked(useRouter).mockReturnValue({
    events: {
      on: (_: string, listener: () => void) => routeListeners.add(listener),
      off: (_: string, listener: () => void) => routeListeners.delete(listener),
    },
  } as unknown as ReturnType<typeof useRouter>);
});

afterEach(() => {
  jest.useRealTimers();
  tagScripts().forEach((script) => script.remove());
  document.body.classList.remove(ADS_ALLOWED_CLASS);
  delete window.__ciads;
});

it('opens the page-level gate and loads the tag once, a tick later', () => {
  const { rerender } = renderTag(true);

  expect(document.body).toHaveClass(ADS_ALLOWED_CLASS);
  expect(tagScripts()).toHaveLength(0);

  act(() => jest.runOnlyPendingTimers());
  rerender(
    <LogContext.Provider value={{ logEvent } as unknown as LogContextData}>
      <ContentIgniteTag enabled />
    </LogContext.Provider>,
  );
  act(() => jest.runOnlyPendingTimers());

  expect(tagScripts()).toHaveLength(1);
});

it('does nothing for a page that may not carry ads', () => {
  renderTag(false);
  act(() => jest.runOnlyPendingTimers());

  expect(document.body).not.toHaveClass(ADS_ALLOWED_CLASS);
  expect(tagScripts()).toHaveLength(0);
  expect(window.__ciads).toBeUndefined();
});

it('rebuilds the units on every client-side navigation', () => {
  const { reload } = loadTag();
  renderTag(true);

  expect(reload).not.toHaveBeenCalled();

  act(() => routeListeners.forEach((listener) => listener()));

  expect(reload).toHaveBeenCalledTimes(1);
});

it('closes the gate and rebuilds when the page stops allowing ads', () => {
  const { reload } = loadTag();
  const { unmount } = renderTag(true);

  unmount();

  expect(document.body).not.toHaveClass(ADS_ALLOWED_CLASS);
  expect(reload).toHaveBeenCalledTimes(1);
  expect(routeListeners.size).toBe(0);
});

it('forwards the tag events to the slot telemetry while enabled', () => {
  const { unmount } = renderTag(true);

  act(() => {
    window.dispatchEvent(
      new CustomEvent('ci_al', {
        detail: { config_id: 3, slot: { creativeId: 9, size: '300x250' } },
      }),
    );
  });

  expect(logEvent).toHaveBeenCalledTimes(1);
  expect(logEvent.mock.calls[0][0].event_name).toBe(LogEvent.FillAdSlot);

  unmount();
  act(() => {
    window.dispatchEvent(new CustomEvent('ci_al', { detail: {} }));
  });

  expect(logEvent).toHaveBeenCalledTimes(1);
});
