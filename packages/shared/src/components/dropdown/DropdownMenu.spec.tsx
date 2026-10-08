import React, { useEffect, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
  useDropdownMenuIsPhone,
} from './DropdownMenu';
import { useIsPhone, useViewSize } from '../../hooks/useViewSize';
import { attachSheetDrag } from '../shell/sheetDrag';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
  useIsPhone: jest.fn(),
}));

jest.mock('../shell/sheetDrag', () => ({
  attachSheetDrag: jest.fn(() => () => undefined),
}));

const renderMenu = (isPhone: boolean) => {
  jest.mocked(useViewSize).mockReturnValue(isPhone);
  jest.mocked(useIsPhone).mockReturnValue(isPhone);
  const share = jest.fn();
  const report = jest.fn();

  render(
    <QueryClientProvider client={new QueryClient()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Options</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuOptions
            options={[
              { label: 'Share', action: share },
              { label: 'Report', action: report },
            ]}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </QueryClientProvider>,
  );

  fireEvent.keyDown(screen.getByRole('button', { name: 'Options' }), {
    key: 'Enter',
  });

  return { share, report };
};

// Each option is a Radix item around its own button; the buttons are the
// rows a finger or a keyboard reaches.
const menuButtons = () =>
  screen.getAllByRole('menuitem').filter((item) => item.tagName === 'BUTTON');

describe('DropdownMenu', () => {
  beforeEach(() => {
    jest.mocked(attachSheetDrag).mockClear();
  });

  it('opens a popover on a desktop with the items wired to their actions', () => {
    const { share } = renderMenu(false);

    const items = menuButtons();
    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'Share',
      'Report',
    ]);
    expect(items[0].closest('.shell-menu-sheet')).toBeNull();

    fireEvent.click(items[0]);
    expect(share).toHaveBeenCalledTimes(1);
  });

  it('opens the same items as a bottom sheet on a phone', () => {
    const { report } = renderMenu(true);

    const items = menuButtons();
    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'Share',
      'Report',
    ]);
    expect(items[0].closest('.shell-menu-sheet')).not.toBeNull();

    fireEvent.click(items[1]);
    expect(report).toHaveBeenCalledTimes(1);
  });

  // The post menu mounts its content only while open, and the real hook
  // reads the media query after mount. The content takes the root's settled
  // answer, so it is a sheet with its drag from its first render.
  it('makes content that mounts on open a sheet from its first render', () => {
    jest.mocked(useViewSize).mockReturnValue(true);
    jest.mocked(useIsPhone).mockImplementation(() => {
      const [settled, setSettled] = useState(false);
      useEffect(() => setSettled(true), []);
      return settled;
    });
    const seen: boolean[] = [];
    const Probe = () => {
      seen.push(useDropdownMenuIsPhone());
      return null;
    };
    const MountOnOpen = () => {
      const [open, setOpen] = useState(false);
      return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button type="button">Options</button>
          </DropdownMenuTrigger>
          {open && (
            <DropdownMenuContent>
              <Probe />
              <DropdownMenuOptions options={[{ label: 'Share' }]} />
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      );
    };
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MountOnOpen />
      </QueryClientProvider>,
    );

    fireEvent.keyDown(screen.getByRole('button', { name: 'Options' }), {
      key: 'Enter',
    });

    expect(seen[0]).toBe(true);
    expect(menuButtons()[0].closest('.shell-menu-sheet')).not.toBeNull();
    expect(attachSheetDrag).toHaveBeenCalledTimes(1);
  });
});
