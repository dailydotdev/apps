import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { getFeedWidgetTips } from '@dailydotdev/shared/src/features/feedWidgets/tips';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
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
    expect(within(items[index]).getByText(tip.description)).toBeVisible();
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
