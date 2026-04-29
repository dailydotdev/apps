import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { defaultSettings } from '../../contexts/SettingsContext';
import { SortCommentsBy } from '../../graphql/comments';
import { CustomizeNewTabSidebar } from './CustomizeNewTabSidebar';
import type { UseCustomizeNewTab } from './useCustomizeNewTab';
import { DndContextProvider } from '../../contexts/DndContext';
import { ShortcutsProvider } from '../shortcuts/contexts/ShortcutsProvider';
import {
  DEFAULT_FOCUS_SCHEDULE,
  FOCUS_SCHEDULE_STORAGE_KEY,
} from '../newTab/store/focusSchedule.store';

const renderSidebar = (
  overrides: Partial<UseCustomizeNewTab> = {},
  settings = {},
) => {
  const close = jest.fn();
  const open = jest.fn();
  const customizer: UseCustomizeNewTab = {
    shouldRender: true,
    isOpen: true,
    isFirstSession: false,
    hasSettledInitialOpen: true,
    open,
    close,
    ...overrides,
  };

  const client = new QueryClient();
  const utils = render(
    <TestBootProvider client={client} settings={settings}>
      <ShortcutsProvider>
        <DndContextProvider>
          <CustomizeNewTabSidebar customizer={customizer} />
        </DndContextProvider>
      </ShortcutsProvider>
    </TestBootProvider>,
  );

  return { ...utils, open, close };
};

describe('CustomizeNewTabSidebar', () => {
  beforeEach(() => {
    jest.useRealTimers();
    window.localStorage.clear();
  });

  it('renders nothing when shouldRender is false', () => {
    const { container } = renderSidebar({ shouldRender: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders feed-shaping sections in the default Discover mode', () => {
    renderSidebar();
    expect(screen.getAllByText('Customize').length).toBeGreaterThan(0);
    expect(screen.getByText('Mode')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Widgets')).toBeInTheDocument();
    // Focus controls only matter in Focus mode and should be hidden so the
    // panel reads as "make my feed mine".
    expect(screen.queryByText(/Take a break/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Active hours/i)).not.toBeInTheDocument();
  });

  it('swaps to Focus-only sections after switching to Focus mode', () => {
    renderSidebar();
    act(() => {
      fireEvent.click(screen.getByRole('radio', { name: /Focus/ }));
    });
    // Take a break sits at the top of the Focus section now — it's the
    // most common reason users open the panel after picking Focus.
    expect(screen.getByText(/Take a break/i)).toBeInTheDocument();
    expect(screen.getByText(/Active hours/i)).toBeInTheDocument();
    // Feed-only knobs disappear because they're a no-op while Focus owns the
    // surface — keeping them around just creates dead UI.
    expect(screen.queryByText('Appearance')).not.toBeInTheDocument();
    expect(screen.queryByText('Shortcuts')).not.toBeInTheDocument();
    expect(screen.queryByText('Widgets')).not.toBeInTheDocument();
  });

  it('exposes the Discover and Focus mode options in the mode picker', () => {
    renderSidebar();
    expect(screen.getByRole('radio', { name: /Discover/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Focus/ })).toBeInTheDocument();
  });

  it('does not expose the removed Zen mode option', () => {
    renderSidebar();
    expect(
      screen.queryByRole('radio', { name: /Zen/ }),
    ).not.toBeInTheDocument();
  });

  it('does not render a footer Done button — settings are real-time', () => {
    // Every toggle / picker writes through immediately, so there is no
    // draft state to commit. A "Done" button would imply confirmation and
    // sit redundantly next to the X. Reset moved into the header alongside
    // the X; nothing else lives at the bottom of the panel.
    renderSidebar();
    expect(
      screen.queryByRole('button', { name: 'Done' }),
    ).not.toBeInTheDocument();
  });

  it('exposes Reset to defaults in the header', () => {
    renderSidebar();
    expect(
      screen.getByRole('button', { name: /reset to defaults/i }),
    ).toBeInTheDocument();
  });

  it('calls close when the X button is clicked', () => {
    const { close } = renderSidebar();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(close).toHaveBeenCalled();
  });

  it('calls close when Escape is pressed', () => {
    const { close } = renderSidebar();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(close).toHaveBeenCalled();
  });

  it('hides the panel without rendering any floating affordance when closed', () => {
    // We deliberately removed the floating "Customize" pill — on a brand
    // new tab the panel auto-opens, and returning users open it from the
    // profile dropdown. So when the panel is closed there should be no
    // visible call-to-action in the corner.
    renderSidebar({ isOpen: false });
    expect(screen.queryByTitle('Customize new tab')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Customize/ }),
    ).not.toBeInTheDocument();
    // Multiple <aside> elements (welcome hero, bookmarks tip) all map to
    // the implicit `complementary` role; pick the panel itself by the
    // aria-label we attach to it. Filtering with `name:` doesn't work
    // here because the panel is `aria-hidden` while collapsed and the
    // accessible-name lookup short-circuits on hidden subtrees.
    const panels = screen.getAllByRole('complementary', { hidden: true });
    const panel = panels.find(
      (el) => el.getAttribute('aria-label') === 'Customize new tab',
    );
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(panel).toHaveAttribute('inert');
  });

  it('resets only customizer-owned settings and local new-tab state', () => {
    const setSettings = jest.fn();
    renderSidebar({}, { setSettings });

    fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }));

    expect(setSettings).toHaveBeenCalledWith({
      theme: defaultSettings.theme,
      insaneMode: defaultSettings.insaneMode,
      showTopSites: defaultSettings.showTopSites,
      optOutReadingStreak: defaultSettings.optOutReadingStreak,
      optOutLevelSystem: defaultSettings.optOutLevelSystem,
      optOutQuestSystem: defaultSettings.optOutQuestSystem,
      optOutCompanion: defaultSettings.optOutCompanion,
      optOutCores: defaultSettings.optOutCores,
      optOutReputation: defaultSettings.optOutReputation,
      autoDismissNotifications: defaultSettings.autoDismissNotifications,
      showFeedbackButton: defaultSettings.showFeedbackButton,
    });
    expect(setSettings.mock.calls[0][0]).not.toHaveProperty(
      'sortCommentsBy',
      SortCommentsBy.OldestFirst,
    );
    expect(window.localStorage.getItem(FOCUS_SCHEDULE_STORAGE_KEY)).toBe(
      JSON.stringify(DEFAULT_FOCUS_SCHEDULE),
    );
  });

  it('renders the first-session welcome hero when isFirstSession is true', () => {
    renderSidebar({ isFirstSession: true });
    expect(
      screen.getByText(/Make your new tab work for you\./i),
    ).toBeInTheDocument();
  });

  it('omits the welcome hero on returning visits', () => {
    renderSidebar({ isFirstSession: false });
    expect(
      screen.queryByText(/Make your new tab work for you\./i),
    ).not.toBeInTheDocument();
  });

  it('dampens first-session effects after seven seconds', () => {
    jest.useFakeTimers();
    renderSidebar({ isFirstSession: true });

    const title = screen.getByRole('heading', {
      name: /Make your new tab work for you\./i,
    });
    const welcomeCard = title.closest('section');

    expect(screen.getByTestId('keep-it-overlay')).toBeInTheDocument();
    expect(welcomeCard?.className).toContain('motion-safe:animate');

    act(() => {
      jest.advanceTimersByTime(7_000);
    });

    expect(screen.queryByTestId('keep-it-overlay')).not.toBeInTheDocument();
    expect(welcomeCard?.className).not.toContain('motion-safe:animate');
    expect(welcomeCard).not.toHaveClass('border-accent-cabbage-default/40');
  });
});
