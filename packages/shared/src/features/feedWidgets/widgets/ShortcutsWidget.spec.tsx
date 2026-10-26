import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { SettingsFlags } from '../../../graphql/settings';
import { checkIsExtension } from '../../../lib/func';
import { useShortcuts } from '../../shortcuts/contexts/ShortcutsProvider';
import type { FeedWidgetConfig } from '../types';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { ShortcutsWidget } from './ShortcutsWidget';

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  checkIsExtension: jest.fn(),
}));

jest.mock('../../shortcuts/contexts/ShortcutsProvider', () => ({
  useShortcuts: jest.fn(),
}));

jest.mock('../../shortcuts/hooks/useHiddenTopSites', () => ({
  useHiddenTopSites: () => ({
    hidden: [],
    hide: jest.fn(),
    unhide: jest.fn(),
  }),
}));

const myLinks = ['https://github.com', 'https://linear.app'];
const topSites = [
  { url: 'https://news.ycombinator.com', title: 'Hacker News' },
  { url: 'https://www.youtube.com', title: 'YouTube' },
];

const askTopSitesPermission = jest.fn();
const setShowImportSource = jest.fn();
const onConfigChange = jest.fn(() => true);

const mockShortcuts = (isAllowed = true) =>
  jest.mocked(useShortcuts).mockReturnValue({
    topSites: isAllowed ? topSites : undefined,
    hasCheckedPermission: true,
    askTopSitesPermission,
    setShowImportSource,
  } as unknown as ReturnType<typeof useShortcuts>);

const renderWidget = ({
  size = FeedWidgetSize.Tall,
  links = myLinks,
  config,
}: {
  size?: FeedWidgetSize;
  links?: string[];
  config?: FeedWidgetConfig<FeedWidgetKind.Shortcuts>;
} = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={{
        customLinks: links,
        flags: {
          shortcutMeta: { 'https://github.com': { name: 'GitHub' } },
        } as unknown as SettingsFlags,
      }}
    >
      <ShortcutsWidget
        widget={{
          id: 'shortcuts',
          kind: FeedWidgetKind.Shortcuts,
          size,
          ...(config && { config }),
        }}
        size={size}
        isEditing={false}
        onConfigChange={onConfigChange}
        canConfigure
        isConfiguring={false}
        onConfigureEnd={() => undefined}
      />
    </TestBootProvider>,
  );

const setExtension = (isExtension: boolean) =>
  jest.mocked(checkIsExtension).mockReturnValue(isExtension);

beforeEach(() => {
  jest.clearAllMocks();
  mockShortcuts();
});

describe('ShortcutsWidget on the webapp', () => {
  beforeEach(() => setExtension(false));

  it('shows only the reader’s shortcuts, with no tabs', () => {
    renderWidget({ size: FeedWidgetSize.Large });

    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com',
    );
    expect(screen.getByRole('link', { name: 'linear.app' })).toBeVisible();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByText('Most visited')).not.toBeInTheDocument();
    expect(screen.queryByText('Hacker News')).not.toBeInTheDocument();
  });

  it('keeps only layout and managing in its settings', () => {
    renderWidget();

    fireEvent.click(screen.getByRole('button', { name: 'Shortcut settings' }));

    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Manage shortcuts' }),
    ).toBeVisible();
    expect(screen.queryByText('Most visited sites')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Import bookmarks' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(onConfigChange).toHaveBeenCalledWith({ layout: 'list' });

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeVisible();
  });

  it('asks for the first shortcut, without the bookmarks import', () => {
    renderWidget({ links: [] });

    expect(
      screen.getByText('Pin the sites you open every day.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add shortcuts' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Import bookmarks' }),
    ).not.toBeInTheDocument();
  });
});

describe('ShortcutsWidget in the extension', () => {
  beforeEach(() => setExtension(true));

  it('switches between shortcuts and most visited with tabs', () => {
    renderWidget();

    const tabs = within(screen.getByRole('tablist'));
    expect(tabs.getByRole('tab', { name: 'Shortcuts' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeVisible();

    fireEvent.click(tabs.getByRole('tab', { name: 'Most visited' }));

    expect(screen.getByRole('link', { name: 'Hacker News' })).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'GitHub' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Hide Hacker News' }),
    ).toBeInTheDocument();
  });

  it('shows both lists side by side on Large, with no tabs', () => {
    renderWidget({ size: FeedWidgetSize.Large });

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByText('Most visited')).toBeVisible();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Hacker News' })).toBeVisible();
  });

  it('drops the tabs when most visited is turned off', () => {
    renderWidget({ config: { showMostVisited: false } });

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeVisible();
  });

  it('lists each site with its domain in list layout', () => {
    renderWidget({ config: { layout: 'list' } });

    const github = screen.getByRole('link', { name: /GitHub/ });
    expect(within(github).getByText('github.com')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add shortcut' })).toBeVisible();
  });

  it('turns over to its settings and back', () => {
    renderWidget();

    fireEvent.click(screen.getByRole('button', { name: 'Shortcut settings' }));

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Most visited sites' }),
    );
    expect(onConfigChange).toHaveBeenCalledWith({ showMostVisited: false });

    fireEvent.click(screen.getByRole('button', { name: 'Import bookmarks' }));
    expect(setShowImportSource).toHaveBeenCalledWith('bookmarks');

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('tablist')).toBeVisible();
  });

  it('offers the bookmarks import when nothing is pinned yet', () => {
    renderWidget({ links: [] });

    expect(
      screen.getByText('Pin the sites you open every day.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Import bookmarks' }));
    expect(setShowImportSource).toHaveBeenCalledWith('bookmarks');
  });

  it('asks for the browser’s permission before most visited', () => {
    mockShortcuts(false);
    renderWidget();

    fireEvent.click(screen.getByRole('tab', { name: 'Most visited' }));

    expect(
      screen.getByText('Your most visited sites, one click away.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show most visited' }));
    expect(askTopSitesPermission).toHaveBeenCalled();
  });
});
