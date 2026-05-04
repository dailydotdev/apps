import React from 'react';
import { render, screen } from '@testing-library/react';
import { RelativeTime } from './RelativeTime';

describe('RelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-28T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the relative label for the provided dateTime', () => {
    const tenMinutesAgo = new Date('2026-04-28T11:50:00Z').toISOString();
    render(<RelativeTime dateTime={tenMinutesAgo} />);
    expect(screen.getByText('10m ago')).toBeInTheDocument();
  });

  it('updates the label immediately when the dateTime prop changes', () => {
    const tenMinutesAgo = new Date('2026-04-28T11:50:00Z').toISOString();
    const twoHoursAgo = new Date('2026-04-28T10:00:00Z').toISOString();

    const { rerender } = render(<RelativeTime dateTime={tenMinutesAgo} />);
    expect(screen.getByText('10m ago')).toBeInTheDocument();

    rerender(<RelativeTime dateTime={twoHoursAgo} />);
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });
});
