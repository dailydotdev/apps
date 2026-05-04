import { act, renderHook } from '@testing-library/react';
import { useRecentCommands } from './useRecentCommands';
import { RECENT_MAX_ENTRIES, RECENT_STORAGE_KEY } from './types';

describe('useRecentCommands', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts with the persisted entries on first read', () => {
    window.localStorage.setItem(
      RECENT_STORAGE_KEY,
      JSON.stringify([
        { commandId: 'nav.home', lastUsedAt: 1 },
        { commandId: 'create.text', lastUsedAt: 2 },
      ]),
    );

    const { result } = renderHook(() => useRecentCommands());

    expect(result.current.recent.map((entry) => entry.commandId)).toEqual([
      'nav.home',
      'create.text',
    ]);
  });

  it('drops malformed entries silently', () => {
    window.localStorage.setItem(RECENT_STORAGE_KEY, 'not json');
    const { result } = renderHook(() => useRecentCommands());
    expect(result.current.recent).toEqual([]);
  });

  it('moves an existing command id to the front when pushed again', () => {
    window.localStorage.setItem(
      RECENT_STORAGE_KEY,
      JSON.stringify([
        { commandId: 'nav.home', lastUsedAt: 1 },
        { commandId: 'create.text', lastUsedAt: 2 },
      ]),
    );

    const { result } = renderHook(() => useRecentCommands());

    act(() => {
      result.current.push('create.text');
    });

    expect(result.current.recent.map((entry) => entry.commandId)).toEqual([
      'create.text',
      'nav.home',
    ]);
  });

  it('caps the list at RECENT_MAX_ENTRIES', () => {
    const { result } = renderHook(() => useRecentCommands());

    act(() => {
      for (let i = 0; i < RECENT_MAX_ENTRIES + 4; i += 1) {
        result.current.push(`cmd.${i}`);
      }
    });

    expect(result.current.recent).toHaveLength(RECENT_MAX_ENTRIES);
    expect(result.current.recent[0].commandId).toBe(
      `cmd.${RECENT_MAX_ENTRIES + 3}`,
    );
  });

  it('removes a command when forget is called', () => {
    const { result } = renderHook(() => useRecentCommands());

    act(() => {
      result.current.push('cmd.a');
      result.current.push('cmd.b');
      result.current.forget('cmd.a');
    });

    expect(result.current.recent.map((entry) => entry.commandId)).toEqual([
      'cmd.b',
    ]);
  });

  it('refreshes from storage to pick up writes from other tabs', () => {
    const { result } = renderHook(() => useRecentCommands());

    expect(result.current.recent).toEqual([]);

    window.localStorage.setItem(
      RECENT_STORAGE_KEY,
      JSON.stringify([{ commandId: 'cross.tab', lastUsedAt: Date.now() }]),
    );

    act(() => {
      result.current.refresh();
    });

    expect(result.current.recent.map((entry) => entry.commandId)).toEqual([
      'cross.tab',
    ]);
  });
});
