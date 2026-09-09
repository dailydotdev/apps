import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CoachPopover } from './CoachPopover';
import type { CoachAnchor } from './useCoachAnchor';

const CARD_HEIGHT = 100;
const VIEWPORT_HEIGHT = 900;
const TARGET_TOP = 200;
const TARGET_HEIGHT = 40;

const toDomRect = (top: number, height: number): DOMRect => ({
  x: 0,
  y: top,
  width: 40,
  height,
  left: 0,
  top,
  right: 40,
  bottom: top + height,
  toJSON: () => undefined,
});

const mountTarget = (): HTMLElement => {
  const target = document.createElement('div');
  Object.assign(target, {
    getBoundingClientRect: () => toDomRect(TARGET_TOP, TARGET_HEIGHT),
  });
  document.body.appendChild(target);
  return target;
};

const renderPopover = (): CoachAnchor => {
  const anchor: CoachAnchor = {
    targetRef: { current: mountTarget() },
    rect: toDomRect(TARGET_TOP, TARGET_HEIGHT),
    left: 72,
  };

  render(
    <QueryClientProvider client={new QueryClient()}>
      <CoachPopover anchor={anchor} isOpen message="Teach me" />
    </QueryClientProvider>,
  );
  return anchor;
};

describe('CoachPopover', () => {
  beforeEach(() => {
    window.innerHeight = VIEWPORT_HEIGHT;
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: CARD_HEIGHT,
    });
  });

  it('centres the card on its target once the card has been measured', () => {
    renderPopover();

    const card = screen.getByText('Teach me').closest('.fixed');
    // targetCenter (220) minus half the measured card. Unmeasured, the card
    // would hang from 220 with its pointer stuck at mid-card.
    expect(card).toHaveStyle({ top: '170px', left: '72px' });
  });

  it('aims the pointer at the target centre rather than the card centre', () => {
    renderPopover();

    const pointer = document.querySelector('.rotate-45');
    expect(pointer).toHaveStyle({ top: '46px', marginTop: '0px' });
  });

  it('outranks the Radix poppers that share the rail gap', () => {
    renderPopover();

    const card = screen.getByText('Teach me').closest('.fixed');
    expect(card).toHaveClass('z-coach');
    expect(document.querySelector('.ring-2')).toHaveClass('z-coach');
  });
});
