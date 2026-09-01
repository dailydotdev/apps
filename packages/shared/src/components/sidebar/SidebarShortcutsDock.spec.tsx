import type { ReactElement } from 'react';
import React from 'react';
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  SidebarShortcutsDock,
  useLegacyShortcutsMigration,
  useSidebarShortcutItems,
} from './SidebarShortcutsDock';
import { webappUrl } from '../../lib/constants';
import type { SidebarShortcut } from '../../features/shortcuts/types';
import { useJobsFeature } from '../../hooks/useJobsFeature';

const mockSetLegacy = jest.fn().mockResolvedValue(undefined);
let mockLegacy: unknown[] = [];

const mockUpdateFlag = jest.fn().mockResolvedValue(undefined);
let mockStored: SidebarShortcut[] | undefined;
let mockRemoteSettingsLoaded = true;

jest.mock('../../hooks/usePersistentContext', () => ({
  __esModule: true,
  default: () => [mockLegacy, mockSetLegacy, true, false],
}));

jest.mock('../../contexts/SettingsContext', () => ({
  ...jest.requireActual('../../contexts/SettingsContext'),
  useSettingsContext: () => ({
    flags: { sidebarShortcuts: mockStored },
    updateFlag: mockUpdateFlag,
    isRemoteSettingsLoaded: mockRemoteSettingsLoaded,
  }),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

jest.mock('../../hooks/useJobsFeature');

describe('useSidebarShortcutItems stored entry handling', () => {
  const mockUseJobsFeature = useJobsFeature as jest.MockedFunction<
    typeof useJobsFeature
  >;

  beforeEach(() => {
    mockStored = [];
    mockLegacy = [];
    mockUpdateFlag.mockClear();
    mockSetLegacy.mockClear();
    mockUseJobsFeature.mockReturnValue({
      isJobsEnabled: true,
      isLoading: false,
    });
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

  it('filters jobs shortcuts when jobs UI is disabled', () => {
    mockUseJobsFeature.mockReturnValue({
      isJobsEnabled: false,
      isLoading: false,
    });
    mockStored = ['jobs'];
    const { result } = renderHook(() => useSidebarShortcutItems());

    expect(result.current.items).toEqual([]);
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

  it('does not migrate from the items hook, which mounts once per squad row', async () => {
    mockStored = undefined;
    mockLegacy = ['tags'];
    renderHook(() => useSidebarShortcutItems());

    await waitFor(() => expect(mockUpdateFlag).not.toHaveBeenCalled());
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
    renderHook(() => useLegacyShortcutsMigration());

    await waitFor(() =>
      expect(mockUpdateFlag).toHaveBeenCalledWith(
        'sidebarShortcuts',
        mockLegacy,
      ),
    );
    expect(mockSetLegacy).toHaveBeenCalledWith([]);
  });

  it('waits for the remote settings before migrating', async () => {
    mockRemoteSettingsLoaded = false;
    mockLegacy = ['tags'];
    renderHook(() => useLegacyShortcutsMigration());

    await waitFor(() => expect(mockUpdateFlag).not.toHaveBeenCalled());
    mockRemoteSettingsLoaded = true;
  });

  it('leaves a deliberately emptied dock alone', async () => {
    mockStored = [];
    mockLegacy = ['tags'];
    renderHook(() => useLegacyShortcutsMigration());

    await waitFor(() => expect(mockUpdateFlag).not.toHaveBeenCalled());
  });
});

const onCustomizeInteraction = jest.fn();

const REVEAL_ON_HOVER_CLASS = 'opacity-0';

const renderDock = (element: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      {element}
    </QueryClientProvider>,
  );

const getCustomizeButton = () => screen.getByLabelText('Customize shortcuts');

describe('SidebarShortcutsDock customize button', () => {
  beforeEach(() => {
    mockStored = [];
    mockLegacy = [];
    mockUpdateFlag.mockClear();
    onCustomizeInteraction.mockClear();
  });

  it('keeps an empty dock hover-only for callers that pass no tour props', () => {
    renderDock(<SidebarShortcutsDock />);

    expect(getCustomizeButton()).toHaveClass(REVEAL_ON_HOVER_CLASS);
  });

  it('holds the button painted while the coach card points at it', () => {
    renderDock(<SidebarShortcutsDock forceCustomizeVisible />);

    expect(getCustomizeButton()).not.toHaveClass(REVEAL_ON_HOVER_CLASS);
  });

  it('reports a hover from the pointer, and not from focus', () => {
    renderDock(
      <SidebarShortcutsDock onCustomizeInteraction={onCustomizeInteraction} />,
    );

    fireEvent.mouseEnter(getCustomizeButton());
    // Browsers focus a button on mousedown, so a focus hover would make every
    // click flash the card and log a phantom view before the tray opens.
    fireEvent.focus(getCustomizeButton());

    expect(onCustomizeInteraction).toHaveBeenCalledTimes(1);
    expect(onCustomizeInteraction).toHaveBeenCalledWith('hover');
  });

  it('reports the tray opening once, and not again when the same click closes it', () => {
    renderDock(
      <SidebarShortcutsDock onCustomizeInteraction={onCustomizeInteraction} />,
    );

    fireEvent.click(getCustomizeButton());
    fireEvent.click(getCustomizeButton());

    expect(
      onCustomizeInteraction.mock.calls.filter(([kind]) => kind === 'open'),
    ).toHaveLength(1);
  });
});
