import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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

const mockOpenModal = jest.fn();
jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

const mockDisplayToast = jest.fn();
jest.mock('../../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../../hooks/useToastNotification'),
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

const myLinks = ['https://github.com', 'https://linear.app'];
const topSites = [
  { url: 'https://news.ycombinator.com', title: 'Hacker News' },
  { url: 'https://www.youtube.com', title: 'YouTube' },
];

const askTopSitesPermission = jest.fn();
const setShowImportSource = jest.fn();
const onConfigChange = jest.fn(() => true);
const logEvent = jest.fn();

const mockShortcuts = (isAllowed = true) =>
  jest.mocked(useShortcuts).mockReturnValue({
    topSites: isAllowed ? topSites : undefined,
    hasCheckedPermission: true,
    askTopSitesPermission,
    setShowImportSource,
  } as unknown as ReturnType<typeof useShortcuts>);

const widgetTree = ({
  size = FeedWidgetSize.Tall,
  links = myLinks,
  config,
  client = new QueryClient(),
  meta = { 'https://github.com': { name: 'GitHub' } },
}: {
  size?: FeedWidgetSize;
  links?: string[];
  config?: FeedWidgetConfig<FeedWidgetKind.Shortcuts>;
  client?: QueryClient;
  meta?: Record<string, { name?: string; iconUrl?: string }>;
} = {}) => (
  <TestBootProvider
    client={client}
    log={{ logEvent }}
    settings={{
      customLinks: links,
      flags: {
        shortcutMeta: meta,
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
  </TestBootProvider>
);

const renderWidget = (options?: Parameters<typeof widgetTree>[0]) =>
  render(widgetTree(options));

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

  it('offers the appearance when managing from a grid, not a list', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Shortcut settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'Manage shortcuts' }));
    expect(mockOpenModal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        props: { showRowSettings: false, showAppearance: true },
      }),
    );

    const list = within(renderWidget({ config: { layout: 'list' } }).container);
    fireEvent.click(list.getByRole('button', { name: 'Shortcut settings' }));
    fireEvent.click(list.getByRole('button', { name: 'Manage shortcuts' }));
    expect(mockOpenModal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        props: { showRowSettings: false, showAppearance: false },
      }),
    );
  });

  it('only hides the tile controls from a mouse', () => {
    renderWidget();

    const touchClasses = screen
      .getByRole('button', { name: 'GitHub actions' })
      .className.split(' ')
      .filter((className) => !className.startsWith('mouse:'));

    expect(touchClasses).not.toContain('opacity-0');
  });

  it('shows a list row’s new icon once the shortcut is edited', () => {
    const client = new QueryClient();
    const withIcon = (iconUrl: string) =>
      widgetTree({
        client,
        config: { layout: 'list' },
        meta: { 'https://github.com': { name: 'GitHub', iconUrl } },
      });
    const icon = () =>
      screen.getByRole('link', { name: /GitHub/ }).querySelector('img');
    const { rerender } = render(withIcon('https://icons.test/old.png'));
    expect(icon()).toHaveAttribute('src', 'https://icons.test/old.png');

    rerender(withIcon('https://icons.test/new.png'));
    expect(icon()).toHaveAttribute('src', 'https://icons.test/new.png');

    fireEvent.error(icon() as HTMLImageElement);
    expect(icon()?.getAttribute('src')).toContain('/icon?url=');
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
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Most visited');

    fireEvent.keyDown(tabs.getByRole('tab', { name: 'Most visited' }), {
      key: 'ArrowLeft',
    });
    expect(tabs.getByRole('tab', { name: 'Shortcuts' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeVisible();
  });

  it('brings a hidden most visited site back from the toast’s undo', async () => {
    const client = new QueryClient();
    renderWidget({ client });
    await waitFor(() =>
      expect(
        client.getQueryState(['shortcuts_hidden_top_sites', []])?.status,
      ).toBe('success'),
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Most visited' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hide Hacker News' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'Hacker News' }),
      ).not.toBeInTheDocument(),
    );
    expect(mockDisplayToast).toHaveBeenCalledWith(
      'Hidden Hacker News',
      expect.anything(),
    );

    const [, { action }] = mockDisplayToast.mock.calls[0];
    await act(() => action.onClick());

    expect(
      await screen.findByRole('link', { name: 'Hacker News' }),
    ).toBeVisible();
  });

  it('moves focus into its settings and back to the gear', () => {
    renderWidget();

    const gear = screen.getByRole('button', { name: 'Shortcut settings' });
    fireEvent.click(gear);
    expect(screen.getByRole('button', { name: 'Done' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(
      screen.getByRole('button', { name: 'Shortcut settings' }),
    ).toHaveFocus();
  });

  it('logs a middle click on a list row', () => {
    renderWidget({ config: { layout: 'list' } });

    fireEvent(
      screen.getByRole('link', { name: /GitHub/ }),
      new MouseEvent('auxclick', { bubbles: true, button: 1 }),
    );

    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'click',
        target_type: 'shortcuts',
      }),
    );
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
