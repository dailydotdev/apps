import type { ReactElement } from 'react';
import React from 'react';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  SidebarShortcutsDock,
  useSidebarShortcutItems,
} from './SidebarShortcutsDock';
import { webappUrl } from '../../lib/constants';
import { useJobsFeature } from '../../hooks/useJobsFeature';

const mockSetStored = jest.fn().mockResolvedValue(undefined);
let mockStored: unknown[] = [];

jest.mock('../../hooks/usePersistentContext', () => ({
  __esModule: true,
  default: () => [mockStored, mockSetStored, true, false],
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
    mockSetStored.mockClear();
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
    mockSetStored.mockClear();
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
