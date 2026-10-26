import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import type { FeedWidgetTip as FeedWidgetTipItem } from '../tips';
import { feedWidgetTips } from '../tips';
import { FeedWidgetTip } from './FeedWidgetTip';

const logEvent = jest.fn();
const onRemove = jest.fn();

const tipById = (id: string): FeedWidgetTipItem => {
  const tip = feedWidgetTips.find((item) => item.id === id);
  if (!tip) {
    throw new Error(`No tip ${id}`);
  }
  return tip;
};

const renderTip = (
  tip: FeedWidgetTipItem,
  { isEditing = false, canRemove = true } = {},
) =>
  render(
    <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
      <FeedWidgetTip
        tip={tip}
        isEditing={isEditing}
        onRemove={canRemove ? onRemove : undefined}
      />
    </TestBootProvider>,
  );

const tipEvent = (eventName: LogEvent, tip: FeedWidgetTipItem) => ({
  event_name: eventName,
  target_type: TargetType.FeedWidgetTip,
  target_id: tip.id,
  extra: JSON.stringify({ origin: Origin.FeedWidgets }),
});

beforeEach(() => {
  logEvent.mockClear();
  onRemove.mockClear();
});

describe('FeedWidgetTip', () => {
  it('shows the rail copy, with its action and All tips', () => {
    const tip = tipById('streaks');
    renderTip(tip);

    expect(screen.getByText(tip.headline)).toBeInTheDocument();
    expect(screen.getByText(tip.blurb)).toBeInTheDocument();
    expect(screen.queryByText(tip.title)).not.toBeInTheDocument();
    const action = screen.getByRole('link', { name: tip.cta });
    expect(action).toHaveAttribute('href', tip.href);
    expect(action).not.toHaveAttribute('target');
    expect(screen.getByRole('link', { name: 'All tips' })).toHaveAttribute(
      'href',
      '/tips',
    );
    expect(
      screen.queryByRole('button', { name: 'Remove daily.dev tips' }),
    ).not.toBeInTheDocument();
  });

  it('opens an external tip in a new tab', () => {
    const tip = tipById('extension');
    renderTip(tip);

    expect(screen.getByRole('link', { name: tip.cta })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('logs its impression once on screen, and the click on its action', () => {
    const tip = tipById('feed-tags');
    renderTip(tip);
    expect(logEvent).not.toHaveBeenCalled();

    act(() => mockAllIsIntersecting(true));
    expect(logEvent).toHaveBeenCalledWith(
      tipEvent(LogEvent.ImpressionFeedWidgetTip, tip),
    );

    fireEvent.click(screen.getByRole('link', { name: tip.cta }));
    expect(logEvent).toHaveBeenCalledWith(
      tipEvent(LogEvent.ClickFeedWidgetTip, tip),
    );
    expect(logEvent).toHaveBeenCalledTimes(2);
  });

  it('is removable in edit mode, without All tips', () => {
    renderTip(tipById('search'), { isEditing: true });

    expect(
      screen.queryByRole('link', { name: 'All tips' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove daily.dev tips' }),
    );
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('offers no remove where the rail cannot be written', () => {
    renderTip(tipById('search'), { isEditing: true, canRemove: false });

    expect(
      screen.queryByRole('button', { name: 'Remove daily.dev tips' }),
    ).not.toBeInTheDocument();
  });
});
