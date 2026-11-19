import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import type { SettingsFlags } from '../../graphql/settings';
import { useFeedWidgets } from './useFeedWidgets';
import { FeedWidgetKind, FeedWidgetSize } from './types';
import { feedRailFingerprint } from './storedRail';
import loggedUser from '../../../__tests__/fixture/loggedUser';

const setSettings = jest.fn();

// Logged in, so the default's Streak is the reader's to have.
const renderWidgets = (
  feedWidgets?: unknown,
  client = new QueryClient(),
  { isLoggedOut = false, optOutReadingStreak = false } = {},
) =>
  renderHook(() => useFeedWidgets(), {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <TestBootProvider
        client={client}
        auth={{ user: isLoggedOut ? undefined : loggedUser }}
        settings={{
          loadedSettings: true,
          optOutReadingStreak,
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

const slotted = (id: string, kind: string, slot: number) => ({
  id,
  kind,
  size: 'tall',
  slot,
});

describe('useFeedWidgets', () => {
  it('starts with no widgets and records the default on the first one', () => {
    const { result } = renderWidgets();

    expect(result.current.isCustomized).toBe(false);
    expect(result.current.widgets).toEqual([]);

    act(() => {
      result.current.addWidget(FeedWidgetKind.Notifications, { slot: 4 });
    });

    expect(writtenRail()).toEqual({
      version: 1,
      startedFrom: 'built-in',
      widgets: [
        expect.objectContaining({
          kind: 'notifications',
          size: 'tall',
          slot: 4,
        }),
      ],
    });
  });

  it('leaves out the old header rail’s widgets, which have no slot', () => {
    const { result } = renderWidgets({
      version: 1,
      widgets: [
        { id: 'rail', kind: 'happeningNow', size: 'large' },
        slotted('a', 'streak', 2),
      ],
    });

    expect(result.current.widgets.map(({ id }) => id)).toEqual(['a']);

    act(() => {
      result.current.addWidget(FeedWidgetKind.TopStory, { slot: 0 });
    });

    expect(writtenRail().widgets).toEqual([
      expect.objectContaining({ kind: 'topStory', slot: 0 }),
      slotted('a', 'streak', 3),
    ]);
  });

  it('moves the widgets after a placed one along a card, and back on removal', () => {
    const { result } = renderWidgets({
      version: 1,
      widgets: [slotted('a', 'streak', 1), slotted('b', 'readingList', 6)],
    });

    act(() => {
      result.current.addWidget(FeedWidgetKind.Notifications, { slot: 3 });
    });
    expect(writtenRail().widgets).toEqual([
      slotted('a', 'streak', 1),
      expect.objectContaining({ kind: 'notifications', slot: 3 }),
      slotted('b', 'readingList', 7),
    ]);

    act(() => {
      result.current.removeWidget('a');
    });
    expect(writtenRail().widgets).toEqual([
      expect.objectContaining({ kind: 'notifications', slot: 2 }),
      slotted('b', 'readingList', 6),
    ]);
  });

  it('puts a removed widget back on its slot', () => {
    const { result } = renderWidgets({
      version: 1,
      widgets: [slotted('a', 'streak', 1), slotted('b', 'readingList', 4)],
    });

    let removed: ReturnType<typeof result.current.removeWidget> = null;
    act(() => {
      removed = result.current.removeWidget('a');
    });
    expect(writtenRail().widgets).toEqual([slotted('b', 'readingList', 3)]);

    act(() => {
      result.current.restoreWidget(removed!.removed);
    });
    expect(writtenRail().widgets).toEqual([
      slotted('a', 'streak', 1),
      slotted('b', 'readingList', 4),
    ]);
  });

  it('moves a widget a card along, swapping with a widget there', () => {
    const { result } = renderWidgets({
      version: 1,
      widgets: [slotted('a', 'streak', 1), slotted('b', 'readingList', 2)],
    });

    act(() => {
      result.current.moveWidget('a', 2);
    });

    expect(writtenRail().widgets).toEqual([
      slotted('b', 'readingList', 1),
      slotted('a', 'streak', 2),
    ]);
  });

  it('makes a widget wide only in a size its kind comes in', () => {
    const { result } = renderWidgets({
      version: 1,
      widgets: [slotted('a', 'streak', 1), slotted('w', 'weather', 3)],
    });

    act(() => {
      result.current.resizeWidget('w', FeedWidgetSize.Large);
    });
    expect(setSettings).not.toHaveBeenCalled();

    act(() => {
      result.current.resizeWidget('a', FeedWidgetSize.Large);
    });
    expect(writtenRail().widgets).toEqual([
      { ...slotted('a', 'streak', 1), size: 'large' },
      slotted('w', 'weather', 3),
    ]);
  });

  it('keeps rail-level fields and newer kinds another client stored', () => {
    const later = {
      id: 'later',
      kind: 'fromANewerBuild',
      size: 'wide',
      slot: 5,
      x: 1,
    };
    const { result } = renderWidgets({
      version: 1,
      startedFrom: 'default-3',
      offered: ['streak'],
      widgets: [slotted('a', 'happeningNow', 0), later],
    });

    expect(result.current.widgets.map(({ id }) => id)).toEqual(['a']);

    act(() => {
      result.current.removeWidget('a');
    });

    expect(writtenRail()).toEqual({
      version: 1,
      startedFrom: 'default-3',
      offered: ['streak'],
      widgets: [{ ...later, slot: 4 }],
    });
  });

  it('leaves a rail saved by a newer build read-only', () => {
    const { result } = renderWidgets({
      version: 2,
      layout: 'from a newer build',
      widgets: [slotted('a', 'topStory', 0)],
    });

    expect(result.current.isReadOnly).toBe(true);
    expect(result.current.canAdd).toBe(false);
    expect(result.current.widgets.map(({ id }) => id)).toEqual(['a']);

    act(() => {
      result.current.addWidget(FeedWidgetKind.HappeningNow);
      result.current.moveWidget('a', 1);
      result.current.resetWidgets();
    });

    expect(result.current.removeWidget('a')).toBeNull();
    expect(setSettings).not.toHaveBeenCalled();
  });

  it('keeps a newer config as stored but never edits it', () => {
    const newer = {
      ...slotted('w', 'weather', 0),
      v: 9,
      config: { place: { lat: 1 } },
    };
    const { result } = renderWidgets({
      version: 1,
      widgets: [newer, slotted('b', 'topStory', 3)],
    });

    let saved: boolean | undefined;
    act(() => {
      saved = result.current.updateWidgetConfig('w', { unit: 'c' } as never);
    });
    expect(saved).toBe(false);
    expect(setSettings).not.toHaveBeenCalled();

    act(() => {
      result.current.removeWidget('b');
    });
    expect(writtenRail().widgets).toEqual([newer]);
  });

  it("stamps this build's version on a config it writes", () => {
    const { result } = renderWidgets({
      version: 1,
      widgets: [{ ...slotted('w', 'weather', 0), v: 1 }],
    });

    act(() => {
      result.current.updateWidgetConfig('w', { unit: 'c' } as never);
    });

    // Version 1 is the absent one, so a stale label is dropped, not kept.
    expect(writtenRail().widgets).toEqual([
      { ...slotted('w', 'weather', 0), config: { unit: 'c' } },
    ]);
  });

  it('refuses a config that does not validate for the kind', () => {
    const { result } = renderWidgets({
      version: 1,
      widgets: [slotted('w', 'weather', 0)],
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

  describe('tips', () => {
    const onDefault = {
      version: 1,
      tipsHidden: true,
      widgets: [],
      fromDefault: feedRailFingerprint([]),
    };

    it('hides them for a reader on the default without customizing', () => {
      const { result } = renderWidgets();

      act(() => {
        result.current.setTipHidden(true);
      });

      expect(writtenRail()).toEqual(onDefault);
    });

    it('keeps them off for a reader who never turned them on', () => {
      const { result } = renderWidgets();

      expect(result.current.isTipHidden).toBe(true);
    });

    it('shows them once the stored rail says false', () => {
      const { result } = renderWidgets({ ...onDefault, tipsHidden: false });

      expect(result.current.isTipHidden).toBe(false);
    });

    it('turns them on by storing an explicit false, keeping the default', () => {
      const { result } = renderWidgets(onDefault);

      act(() => {
        result.current.setTipHidden(false);
      });

      expect(writtenRail()).toEqual({ ...onDefault, tipsHidden: false });
    });

    it('turns them on for a reader who never stored a rail', () => {
      const { result } = renderWidgets();

      act(() => {
        result.current.setTipHidden(false);
      });

      expect(writtenRail()).toEqual({ ...onDefault, tipsHidden: false });
    });

    it('hides them on a customized rail, keeping its widgets', () => {
      const widgets = [slotted('a', 'happeningNow', 0)];
      const { result } = renderWidgets({ version: 1, widgets });

      act(() => {
        result.current.setTipHidden(true);
      });

      expect(writtenRail()).toEqual({ version: 1, tipsHidden: true, widgets });
    });

    it('never hides them on a rail a newer build saved', async () => {
      const { result } = renderWidgets({
        version: 2,
        widgets: [{ id: 'a', kind: 'happeningNow', size: 'tall' }],
      });

      await expect(result.current.setTipHidden(true)).resolves.toBe(false);
      expect(setSettings).not.toHaveBeenCalled();
    });
  });

  it('tells the reader when a write is rejected', async () => {
    setSettings.mockRejectedValueOnce(new Error('offline'));
    const client = new QueryClient();
    const { result } = renderWidgets(undefined, client);

    let saved: Promise<boolean> | undefined;
    act(() => {
      saved = result.current.addWidget(FeedWidgetKind.HappeningNow)?.saved;
    });

    await expect(saved).resolves.toBe(false);
    expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
      message: 'Couldn’t save your widgets. Try again.',
    });
  });
});
