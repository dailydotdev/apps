import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import {
  feedWidgetTipGroups,
  getFeedWidgetTips,
} from '@dailydotdev/shared/src/features/feedWidgets/tips';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { SettingsFlags } from '@dailydotdev/shared/src/graphql/settings';
import TipsPage from '../pages/tips';

const mockOpenSearch = jest.fn();

jest.mock(
  '@dailydotdev/shared/src/components/spotlight/SpotlightContext',
  () => ({
    useSpotlight: () => ({ open: mockOpenSearch }),
  }),
);

const logEvent = jest.fn();

afterEach(() => {
  jest.restoreAllMocks();
});

it('lists every tip under its section, each linking to its feature', () => {
  jest
    .spyOn(window.navigator, 'userAgent', 'get')
    .mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    );
  render(
    <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
      <TipsPage />
    </TestBootProvider>,
  );

  const tips = getFeedWidgetTips();
  expect(screen.getAllByRole('listitem')).toHaveLength(tips.length);
  feedWidgetTipGroups.forEach((group) => {
    const section = screen.getByRole('heading', { name: group }).parentElement;
    const groupTips = tips.filter((tip) => tip.group === group);
    const items = within(section as HTMLElement).getAllByRole('listitem');
    expect(items).toHaveLength(groupTips.length);

    groupTips.forEach((tip, index) => {
      if (tip.id === 'search') {
        expect(
          within(items[index]).queryByRole('link'),
        ).not.toBeInTheDocument();
        fireEvent.click(within(items[index]).getByRole('button'));
        expect(mockOpenSearch).toHaveBeenCalledTimes(1);
        expect(logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            event_name: LogEvent.ClickFeedWidgetTip,
            target_id: tip.id,
            extra: JSON.stringify({ origin: Origin.TipsPage }),
          }),
        );
        return;
      }
      const link = within(items[index]).getByRole('link');
      expect(link).toHaveAttribute('href', tip.href);
      if (tip.isExternal) {
        expect(link).toHaveAttribute('target', '_blank');
      } else {
        expect(link).not.toHaveAttribute('target');
      }
      const description = within(items[index]).getByText(tip.description);
      expect(description).toBeVisible();
      // base.css stops every flex item shrinking, so the text column must be
      // told to, or long lines run past the row.
      expect(description.parentElement).toHaveClass('min-w-0', 'flex-1');
    });
  });

  const [first] = screen.getAllByRole('listitem');
  fireEvent.click(within(first).getByRole('link'));
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.ClickFeedWidgetTip,
      target_id: tips.find((tip) => tip.group === feedWidgetTipGroups[0])?.id,
      extra: JSON.stringify({ origin: Origin.TipsPage }),
    }),
  );
});

describe('showing tips in the feed again', () => {
  const setSettings = jest.fn();
  const rail = {
    version: 1,
    widgets: [{ id: 'now', kind: 'happeningNow', size: 'tall' }],
  };

  const renderPage = (
    feedWidgets: Record<string, unknown>,
    isLoggedIn = true,
  ) =>
    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ user: isLoggedIn ? loggedUser : undefined }}
        settings={{
          flags: { feedWidgets } as unknown as SettingsFlags,
          setSettings,
        }}
        log={{ logEvent }}
      >
        <TipsPage />
      </TestBootProvider>,
    );

  beforeEach(() => {
    setSettings.mockReset();
    logEvent.mockClear();
  });

  it('brings the tips back for a reader who removed them', async () => {
    renderPage({ ...rail, tipsHidden: true });

    expect(
      screen.getByText('You removed tips from your feed.'),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Show tips in my feed' }),
    );

    expect(setSettings).toHaveBeenCalledWith({
      flags: { feedWidgets: rail },
    });
    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.RestoreFeedWidgetTip,
          extra: JSON.stringify({ origin: Origin.TipsPage }),
        }),
      ),
    );
  });

  it('offers nothing while the tips show, or to a signed-out reader', () => {
    const { unmount } = renderPage(rail);
    expect(
      screen.queryByText('You removed tips from your feed.'),
    ).not.toBeInTheDocument();
    unmount();

    renderPage({ ...rail, tipsHidden: true }, false);
    expect(
      screen.queryByRole('button', { name: 'Show tips in my feed' }),
    ).not.toBeInTheDocument();
  });
});
