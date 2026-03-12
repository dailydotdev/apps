import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ReadingReminderHero from './ReadingReminderHero';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, TargetType } from '../../lib/log';

jest.mock('../../hooks/log/useLogEventOnce', () => jest.fn());

describe('ReadingReminderHero', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log impression target on mount', () => {
    render(
      <ReadingReminderHero
        title="Never miss a learning day"
        subtitle="Turn on your daily reading reminder and keep your routine."
        onEnable={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );

    expect(useLogEventOnce).toHaveBeenCalledTimes(1);

    const getEvent = (useLogEventOnce as jest.Mock).mock.calls[0][0];
    expect(getEvent()).toEqual({
      event_name: LogEvent.Impression,
      target_type: TargetType.ReadingReminder,
    });
  });

  it('should handle enable action', () => {
    const onEnable = jest.fn();

    render(
      <ReadingReminderHero
        title="Never miss a learning day"
        subtitle="Turn on your daily reading reminder and keep your routine."
        onEnable={onEnable}
        onDismiss={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Enable reminder' }));

    expect(onEnable).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();
  });

  it('should handle dismiss action when enabled', () => {
    const onDismiss = jest.fn();

    render(
      <ReadingReminderHero
        title="Reminder title"
        subtitle="Reminder subtitle"
        shouldShowDismiss
        onEnable={jest.fn()}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByText('Reminder title')).toBeInTheDocument();
    expect(screen.getByText('Reminder subtitle')).toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
