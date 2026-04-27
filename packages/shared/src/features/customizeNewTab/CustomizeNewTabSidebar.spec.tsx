import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { CustomizeNewTabSidebar } from './CustomizeNewTabSidebar';
import type { UseCustomizeNewTab } from './useCustomizeNewTab';
import { DndContextProvider } from '../../contexts/DndContext';
import { ShortcutsProvider } from '../shortcuts/contexts/ShortcutsProvider';

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
    realIsFirstSession: false,
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

  it('calls close with via="done" when Done is clicked', () => {
    const { close } = renderSidebar();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(close).toHaveBeenCalledWith('done');
  });

  it('calls close with via="x" when the X button is clicked', () => {
    const { close } = renderSidebar();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(close).toHaveBeenCalledWith('x');
  });

  it('calls close with via="esc" when Escape is pressed', () => {
    const { close } = renderSidebar();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(close).toHaveBeenCalledWith('esc');
  });

  it('shows the rail (and not the panel title) when closed', () => {
    renderSidebar({ isOpen: false });
    expect(screen.getByTitle('Customize new tab')).toBeInTheDocument();
    const panel = screen.getByRole('dialog', { hidden: true });
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(panel).toHaveAttribute('aria-label', 'Customize new tab');
  });

  it('does not render the dev-only first-session toggle inside the sidebar', () => {
    // The dev toggle moved out of the sidebar into a standalone component
    // mounted at the new-tab page level so it stays visible regardless of
    // sidebar shouldRender / isOpen state. See FirstSessionDevToggle.
    renderSidebar();
    expect(
      screen.queryByRole('button', { name: /first session/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the first-session welcome hero when isFirstSession is true', () => {
    renderSidebar({ isFirstSession: true, realIsFirstSession: true });
    expect(
      screen.getByText(/A new tab that helps you stay current\./i),
    ).toBeInTheDocument();
  });

  it('hides the first-session effects after ten seconds', () => {
    jest.useFakeTimers();
    renderSidebar({ isFirstSession: true, realIsFirstSession: true });

    const welcome = screen
      .getByText(/A new tab that helps you stay current\./i)
      .closest('section');
    expect(welcome).toHaveClass(
      'motion-safe:animate-[newtab-welcome-in_0.6s_ease-out,newtab-welcome-rim_5.6s_ease-in-out_infinite,newtab-welcome-halo_4.8s_ease-in-out_infinite]',
    );

    act(() => {
      jest.advanceTimersByTime(10_000);
    });

    expect(welcome).not.toHaveClass(
      'motion-safe:animate-[newtab-welcome-in_0.6s_ease-out,newtab-welcome-rim_5.6s_ease-in-out_infinite,newtab-welcome-halo_4.8s_ease-in-out_infinite]',
    );
  });

  it('hides the first-session effects on sidebar interaction', () => {
    renderSidebar({ isFirstSession: true, realIsFirstSession: true });

    const welcome = screen
      .getByText(/A new tab that helps you stay current\./i)
      .closest('section');
    expect(welcome).toHaveClass(
      'motion-safe:animate-[newtab-welcome-in_0.6s_ease-out,newtab-welcome-rim_5.6s_ease-in-out_infinite,newtab-welcome-halo_4.8s_ease-in-out_infinite]',
    );

    fireEvent.pointerDown(screen.getByRole('dialog'));

    expect(welcome).not.toHaveClass(
      'motion-safe:animate-[newtab-welcome-in_0.6s_ease-out,newtab-welcome-rim_5.6s_ease-in-out_infinite,newtab-welcome-halo_4.8s_ease-in-out_infinite]',
    );
  });
});
