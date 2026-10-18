import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { PlusPerkTicker } from './PlusPerkTicker';
import { plusTickerPerks } from './PlusList';

const TICK_MS = 2800;

const renderInRow = () =>
  render(
    <a href="/plus">
      Get Plus
      <PlusPerkTicker />
    </a>,
  );

const visiblePerk = (): string | undefined =>
  screen.getByRole('link').querySelector('[aria-hidden] > :last-child')
    ?.textContent ?? undefined;

describe('PlusPerkTicker', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should keep the perks out of the link name', () => {
    renderInRow();

    expect(screen.getByRole('link', { name: 'Get Plus' })).toBeInTheDocument();
  });

  it('should stop on the first perk after one full pass', () => {
    renderInRow();

    act(() => jest.advanceTimersByTime(TICK_MS));
    expect(visiblePerk()).toBe(plusTickerPerks[1]);

    act(() => jest.advanceTimersByTime(TICK_MS * (plusTickerPerks.length - 1)));
    expect(visiblePerk()).toBe(plusTickerPerks[0]);

    act(() => jest.advanceTimersByTime(TICK_MS * 3));
    expect(visiblePerk()).toBe(plusTickerPerks[0]);
  });

  it('should pause while the row is hovered', () => {
    renderInRow();

    fireEvent.pointerEnter(screen.getByRole('link'));
    act(() => jest.advanceTimersByTime(TICK_MS * 2));

    expect(visiblePerk()).toBe(plusTickerPerks[0]);
  });
});
