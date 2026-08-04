import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DotsCoach, useDotsCoach } from './DotsCoach';
import type { DotsCoachState } from './DotsCoach';
import type { SidebarTourState } from './useSidebarTourState';

const mockTargetRef: { current: HTMLElement | null } = { current: null };

jest.mock('./useCoachAnchor', () => ({
  useCoachAnchor: () => ({
    targetRef: mockTargetRef,
    rect: { top: 100, height: 40 } as DOMRect,
    left: 72,
  }),
}));

const onShown = jest.fn();
const onRetire = jest.fn();

const makeCoach = (isActive: boolean): SidebarTourState['dotsCoach'] => ({
  isActive,
  onShown,
  onRetire,
});

const renderCoach = (isActive = true) =>
  renderHook((coach: SidebarTourState['dotsCoach']) => useDotsCoach(coach), {
    initialProps: makeCoach(isActive),
  });

describe('useDotsCoach', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens on the first ••• hover and counts the exposure', () => {
    const { result } = renderCoach();

    act(() => result.current.onCustomizeInteraction('hover'));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isCustomizeForcedVisible).toBe(true);
    expect(onShown).toHaveBeenCalledTimes(1);
  });

  it('does not count a second exposure while the card is open', () => {
    const { result } = renderCoach();

    act(() => result.current.onCustomizeInteraction('hover'));
    act(() => result.current.onCustomizeInteraction('hover'));

    expect(onShown).toHaveBeenCalledTimes(1);
  });

  it('retires the coach for good once the tray is opened', () => {
    const { result } = renderCoach();

    act(() => result.current.onCustomizeInteraction('hover'));
    act(() => result.current.onCustomizeInteraction('open'));

    expect(result.current.isOpen).toBe(false);
    expect(onRetire).toHaveBeenCalledTimes(1);
  });

  it('stays closed for a coach that has already retired', () => {
    const { result } = renderCoach(false);

    act(() => result.current.onCustomizeInteraction('hover'));

    expect(result.current.isOpen).toBe(false);
    expect(onShown).not.toHaveBeenCalled();
  });

  it('writes nothing at all for an inactive coach, tray open included', () => {
    const { result } = renderCoach(false);

    act(() => result.current.onCustomizeInteraction('open'));

    expect(onRetire).not.toHaveBeenCalled();
    expect(onShown).not.toHaveBeenCalled();
  });

  it('closes and releases the ••• button when the coach retires mid-card', () => {
    const { result, rerender } = renderCoach();

    act(() => result.current.onCustomizeInteraction('hover'));
    rerender(makeCoach(false));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isCustomizeForcedVisible).toBe(false);
  });

  it('retires the coach on "Got it", the strongest comprehension signal there is', () => {
    const { result } = renderCoach();

    act(() => result.current.onCustomizeInteraction('hover'));
    act(() => result.current.onDismiss());

    expect(result.current.isOpen).toBe(false);
    expect(onRetire).toHaveBeenCalledTimes(1);
  });

  it('closes without retiring when the pointer just moves on', () => {
    const { result } = renderCoach();

    act(() => result.current.onCustomizeInteraction('hover'));
    act(() => result.current.onClose());

    expect(result.current.isOpen).toBe(false);
    expect(onRetire).not.toHaveBeenCalled();

    act(() => result.current.onCustomizeInteraction('hover'));

    expect(result.current.isOpen).toBe(true);
    expect(onShown).toHaveBeenCalledTimes(2);
  });
});

describe('DotsCoach card', () => {
  const onClose = jest.fn();

  const state: DotsCoachState = {
    isOpen: true,
    isCustomizeForcedVisible: true,
    onCustomizeInteraction: jest.fn(),
    onDismiss: jest.fn(),
    onClose,
  };

  const renderCard = () => {
    mockTargetRef.current = document.createElement('button');
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DotsCoach state={state} />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lets a click anywhere else put the card away', () => {
    renderCard();

    fireEvent.click(document.body);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(state.onDismiss).not.toHaveBeenCalled();
  });

  it('stays put while the pointer is working inside the card', () => {
    renderCard();

    fireEvent.click(screen.getByText('Got it'));

    expect(onClose).not.toHaveBeenCalled();
  });
});
