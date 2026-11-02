import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import type { SettingsFlags } from '../../../../graphql/settings';
import { useShortcuts } from '../../contexts/ShortcutsProvider';
import ShortcutsManageModal from './ShortcutsManageModal';

jest.mock('../../contexts/ShortcutsProvider', () => ({
  useShortcuts: jest.fn(),
}));

beforeEach(() => {
  jest.mocked(useShortcuts).mockReturnValue({
    topSites: [{ url: 'https://news.ycombinator.com' }],
    hasCheckedPermission: true,
    setShowImportSource: jest.fn(),
  } as unknown as ReturnType<typeof useShortcuts>);
});

const renderModal = (showRowSettings?: boolean, showAppearance?: boolean) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={{
        customLinks: ['https://github.com'],
        flags: {
          shortcutsMode: 'auto',
          shortcutMeta: { 'https://github.com': { name: 'GitHub' } },
        } as unknown as SettingsFlags,
      }}
    >
      <ShortcutsManageModal
        isOpen
        onRequestClose={jest.fn()}
        showRowSettings={showRowSettings}
        showAppearance={showAppearance}
      />
    </TestBootProvider>,
  );

describe('ShortcutsManageModal', () => {
  it('follows the row mode from the new-tab row', () => {
    renderModal();

    expect(
      screen.getByRole('checkbox', { name: 'Show shortcuts' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
  });

  it('manages the reader’s own list outside the row, whatever its mode', () => {
    renderModal(false);

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: 'Show shortcuts' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('radiogroup', { name: 'Shortcut appearance' }),
    ).toBeInTheDocument();
  });

  it('leaves the appearance out where it changes nothing', () => {
    renderModal(false, false);

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(
      screen.queryByRole('radiogroup', { name: 'Shortcut appearance' }),
    ).not.toBeInTheDocument();
  });
});
