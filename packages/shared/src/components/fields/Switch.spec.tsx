import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Switch } from './Switch';

const LONG_LABEL =
  'Receive updates whenever your comment gets a reply or an upvote';

const renderSwitch = (onToggle = jest.fn()): void => {
  render(
    <Switch inputId="notify" name="notify" onToggle={onToggle}>
      {LONG_LABEL}
    </Switch>,
  );
};

describe('Switch', () => {
  it('toggles when the label is clicked', () => {
    const onToggle = jest.fn();
    renderSwitch(onToggle);

    fireEvent.click(screen.getByLabelText(LONG_LABEL));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('keeps the track full size next to a long label', () => {
    // The global `* { flex-shrink: 0 }` reset does not apply in flex rows we
    // build manually, so the track must opt out of shrinking itself or a long
    // label squashes it.
    renderSwitch();

    const track = screen
      .getByLabelText(LONG_LABEL)
      .parentElement?.querySelector('.touch-none');
    expect(track).toHaveClass('shrink-0');
  });

  it('lets a long label wrap instead of running off screen', () => {
    // Regression: the "Receive updates..." label overlapped the track and bled
    // past the right edge on mobile because the label span could not shrink.
    renderSwitch();

    expect(screen.getByText(LONG_LABEL)).toHaveClass('min-w-0');
  });
});
