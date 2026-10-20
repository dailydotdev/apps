import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { SettingsFlags } from '../../graphql/settings';
import { useFeedWidgets } from './useFeedWidgets';
import { FeedWidgetKind, FeedWidgetSize } from './types';

const setSettings = jest.fn();

const renderWidgets = (feedWidgets?: unknown) =>
  renderHook(() => useFeedWidgets(), {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <TestBootProvider
        client={new QueryClient()}
        settings={{
          flags: { feedWidgets } as unknown as SettingsFlags,
          setSettings,
        }}
      >
        {children}
      </TestBootProvider>
    ),
  });

const writtenRail = () => setSettings.mock.calls.at(-1)?.[0].flags.feedWidgets;

beforeEach(() => {
  setSettings.mockClear();
});

describe('useFeedWidgets', () => {
  it('starts from the default and records it on the first edit', () => {
    const { result } = renderWidgets();

    expect(result.current.isCustomized).toBe(false);
    expect(result.current.widgets.map(({ kind }) => kind)).toEqual([
      FeedWidgetKind.TopStory,
    ]);

    act(() => {
      result.current.addWidget(FeedWidgetKind.HappeningNow);
    });

    expect(writtenRail()).toEqual({
      version: 1,
      startedFrom: 'default-1',
      widgets: [
        { id: 'top-story', kind: 'topStory', size: 'large' },
        expect.objectContaining({ kind: 'happeningNow', size: 'tall' }),
      ],
    });
  });

  it('does not stamp a default on a rail saved without one', () => {
    const { result } = renderWidgets({
      version: 1,
      widgets: [{ id: 'a', kind: 'happeningNow', size: 'tall' }],
    });

    act(() => {
      result.current.resizeWidget('a', FeedWidgetSize.Small);
    });

    expect(writtenRail()).toEqual({
      version: 1,
      widgets: [{ id: 'a', kind: 'happeningNow', size: 'small' }],
    });
  });

  it('keeps what another client stored when this one edits', () => {
    const { result } = renderWidgets({
      version: 1,
      startedFrom: 'default-2',
      offered: ['streak'],
      widgets: [
        { id: 'a', kind: 'happeningNow', size: 'tall' },
        { id: 'later', kind: 'fromANewerBuild', size: 'wide', x: 1 },
        { id: 'b', kind: 'topStory', size: 'large' },
      ],
    });

    expect(result.current.widgets.map(({ id }) => id)).toEqual(['a', 'b']);

    act(() => {
      result.current.resizeWidget('a', FeedWidgetSize.Small);
    });

    expect(writtenRail()).toEqual({
      version: 1,
      startedFrom: 'default-2',
      offered: ['streak'],
      widgets: [
        { id: 'a', kind: 'happeningNow', size: 'small' },
        { id: 'later', kind: 'fromANewerBuild', size: 'wide', x: 1 },
        { id: 'b', kind: 'topStory', size: 'large' },
      ],
    });
  });

  it('refuses a config that does not validate for the kind', () => {
    const { result } = renderWidgets({
      version: 1,
      widgets: [{ id: 'w', kind: 'weather', size: 'small' }],
    });

    let saved: boolean | undefined;
    act(() => {
      saved = result.current.updateWidgetConfig('w', {
        unit: 'kelvin',
      } as never);
    });

    expect(saved).toBe(false);
    expect(setSettings).not.toHaveBeenCalled();
  });
});
