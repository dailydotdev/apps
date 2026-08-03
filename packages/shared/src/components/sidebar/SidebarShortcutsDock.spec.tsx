import { renderHook, waitFor } from '@testing-library/react';
import { useSidebarShortcutItems } from './SidebarShortcutsDock';
import { webappUrl } from '../../lib/constants';
import type { SidebarShortcut } from '../../features/shortcuts/types';

const mockSetLegacy = jest.fn().mockResolvedValue(undefined);
let mockLegacy: unknown[] = [];

const mockUpdateFlag = jest.fn().mockResolvedValue(undefined);
let mockStored: SidebarShortcut[] | undefined;

jest.mock('../../hooks/usePersistentContext', () => ({
  __esModule: true,
  default: () => [mockLegacy, mockSetLegacy, true, false],
}));

jest.mock('../../contexts/SettingsContext', () => ({
  ...jest.requireActual('../../contexts/SettingsContext'),
  useSettingsContext: () => ({
    flags: { sidebarShortcuts: mockStored },
    updateFlag: mockUpdateFlag,
  }),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

describe('useSidebarShortcutItems stored entry handling', () => {
  beforeEach(() => {
    mockStored = [];
    mockLegacy = [];
    mockUpdateFlag.mockClear();
    mockSetLegacy.mockClear();
  });

  it('keeps a shortcut whose catalog entry this layout retired', () => {
    mockStored = ['explore'];
    const { result } = renderHook(() => useSidebarShortcutItems());

    // Without the migration the id fails the catalog check and the pin is
    // dropped — then written away for good on the next mutation.
    expect(result.current.resolved).toHaveLength(1);
    expect(result.current.resolved[0]).toMatchObject({
      label: 'Explore',
      path: `${webappUrl}posts`,
    });
  });

  it('migrates the retired id to a pinned page so the next persist keeps it', () => {
    mockStored = ['jobs'];
    const { result } = renderHook(() => useSidebarShortcutItems());

    expect(result.current.items).toEqual([
      { title: 'Jobs', path: `${webappUrl}jobs` },
    ]);
  });

  it('still drops an id that was never a catalog entry', () => {
    mockStored = ['not-a-real-shortcut'];
    const { result } = renderHook(() => useSidebarShortcutItems());

    expect(result.current.resolved).toHaveLength(0);
  });

  it('de-duplicates a retired id against the same page pinned directly', () => {
    mockStored = ['explore', { title: 'Explore', path: `${webappUrl}posts` }];
    const { result } = renderHook(() => useSidebarShortcutItems());

    expect(result.current.resolved).toHaveLength(1);
  });

  it('persists a mutation to settings, not to device storage', () => {
    mockStored = [];
    const { result } = renderHook(() => useSidebarShortcutItems());
    result.current.addCatalog('tags');

    expect(mockUpdateFlag).toHaveBeenCalledWith('sidebarShortcuts', ['tags']);
    expect(mockSetLegacy).not.toHaveBeenCalled();
  });
});

describe('useSidebarShortcutItems device-storage migration', () => {
  beforeEach(() => {
    mockStored = undefined;
    mockLegacy = [];
    mockUpdateFlag.mockClear();
    mockSetLegacy.mockClear();
  });

  it('lifts a pre-existing IndexedDB dock into settings once', async () => {
    mockLegacy = ['tags', { title: 'Squad', path: `${webappUrl}squads/dev` }];
    renderHook(() => useSidebarShortcutItems());

    await waitFor(() =>
      expect(mockUpdateFlag).toHaveBeenCalledWith(
        'sidebarShortcuts',
        mockLegacy,
      ),
    );
    expect(mockSetLegacy).toHaveBeenCalledWith([]);
  });

  it('leaves a deliberately emptied dock alone', async () => {
    mockStored = [];
    mockLegacy = ['tags'];
    renderHook(() => useSidebarShortcutItems());

    await waitFor(() => expect(mockUpdateFlag).not.toHaveBeenCalled());
  });
});
