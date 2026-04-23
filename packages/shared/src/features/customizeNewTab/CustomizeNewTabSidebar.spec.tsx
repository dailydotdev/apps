import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    open,
    close,
    isFlagLoading: false,
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
  it('renders nothing when shouldRender is false', () => {
    const { container } = renderSidebar({ shouldRender: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all three sections when open', () => {
    renderSidebar();
    expect(screen.getByText('Make this tab yours')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('New tab widgets')).toBeInTheDocument();
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
    const panel = screen.getByLabelText('Make this tab yours');
    expect(panel).toHaveAttribute('aria-hidden', 'true');
  });
});
