import React from 'react';
import { render, screen } from '@testing-library/react';
import { WorldGuideSheet } from '../components/world/WorldGuide';
import type { WorldState } from '../components/world/worldState';

const state = {
  status: 'ready',
  articles: 1204,
  districts: 18,
  realms: 4,
  span: '8 mo',
} as WorldState;

const renderSheet = (
  props: Partial<Parameters<typeof WorldGuideSheet>[0]> = {},
) =>
  render(
    <WorldGuideSheet
      state={state}
      userName="Ido"
      isOwn={false}
      isTouch
      onClose={jest.fn()}
      {...props}
    />,
  );

describe('the guide on a phone', () => {
  /* The rail is laptop-only, so until this existed the four counters were
     unreachable below that breakpoint. They are half of what the sheet is for. */
  it('carries the numbers the rail would have shown', () => {
    renderSheet();

    expect(screen.getByText('1,204')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('8 mo')).toBeInTheDocument();
  });

  it('says whose world it is, which nothing else on a phone does', () => {
    renderSheet();
    expect(screen.getByText("Ido's world")).toBeInTheDocument();

    renderSheet({ isOwn: true });
    expect(screen.getByText('Your world')).toBeInTheDocument();
  });

  it('asks for taps rather than clicks', () => {
    renderSheet();

    expect(screen.getByText(/Tap a realm/)).toBeInTheDocument();
    expect(screen.queryByText(/Click a realm/)).not.toBeInTheDocument();
  });

  /* Riding is not merely hard to find on touch, it cannot be done: a bird is
     mounted through the reticle a hover puts on it, and a finger never hovers.
     Offering it would be the guide describing a control that does not exist. */
  it('does not offer the birds to a finger', () => {
    renderSheet();

    expect(screen.queryByText(/a bird/)).not.toBeInTheDocument();
  });

  it('offers the birds on a pointer', () => {
    renderSheet({ isTouch: false });

    expect(screen.getByText(/Click a bird/)).toBeInTheDocument();
  });
});
