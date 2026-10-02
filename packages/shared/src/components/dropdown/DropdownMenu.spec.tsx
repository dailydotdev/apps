import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { useViewSize } from '../../hooks/useViewSize';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const renderMenu = (isPhone: boolean) => {
  jest.mocked(useViewSize).mockReturnValue(isPhone);
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
  screen
    .getAllByRole('menuitem')
    .filter((item) => item.tagName === 'BUTTON');

describe('DropdownMenu', () => {
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
});
