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
import { getFeedWidgetTips } from '@dailydotdev/shared/src/features/feedWidgets/tips';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { SettingsFlags } from '@dailydotdev/shared/src/graphql/settings';
import TipsPage from '../pages/tips';

const logEvent = jest.fn();

it('lists every tip, each linking to its feature', () => {
  render(
    <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
      <TipsPage />
    </TestBootProvider>,
  );

  const tips = getFeedWidgetTips();
  const items = screen.getAllByRole('listitem');
  expect(items).toHaveLength(tips.length);
  tips.forEach((tip, index) => {
    expect(within(items[index]).getByRole('link')).toHaveAttribute(
      'href',
      tip.href,
    );
    const description = within(items[index]).getByText(tip.description);
    expect(description).toBeVisible();
    // base.css stops every flex item shrinking, so the text column must be
    // told to, or long lines run past the card.
    expect(description.parentElement).toHaveClass('min-w-0', 'flex-1');
  });

  fireEvent.click(within(items[0]).getByRole('link'));
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.ClickFeedWidgetTip,
      target_id: tips[0].id,
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
      screen.queryByRole('button', { name: 'Show tips in my feed' }),
    ).not.toBeInTheDocument();
    unmount();

    renderPage({ ...rail, tipsHidden: true }, false);
    expect(
      screen.queryByRole('button', { name: 'Show tips in my feed' }),
    ).not.toBeInTheDocument();
  });
});
