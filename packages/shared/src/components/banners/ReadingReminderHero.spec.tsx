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
    render(<ReadingReminderHero onEnable={jest.fn()} onDismiss={jest.fn()} />);

    expect(useLogEventOnce).toHaveBeenCalledTimes(1);

    const getEvent = (useLogEventOnce as jest.Mock).mock.calls[0][0];
    expect(getEvent()).toEqual({
      event_name: LogEvent.Impression,
      target_type: TargetType.ReadingReminder,
    });
  });

  it('should handle enable and dismiss actions', () => {
    const onEnable = jest.fn();
    const onDismiss = jest.fn();

    render(<ReadingReminderHero onEnable={onEnable} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Enable reminder' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss reading reminder' }),
    );

    expect(onEnable).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
