import { act, renderHook } from '@testing-library/react';
import { useDotsCoach } from './DotsCoach';
import type { SidebarTourState } from './useSidebarTourState';

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

  it('closes and releases the ••• button when the coach retires mid-card', () => {
    const { result, rerender } = renderCoach();

    act(() => result.current.onCustomizeInteraction('hover'));
    rerender(makeCoach(false));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isCustomizeForcedVisible).toBe(false);
  });

  it('closes on "Got it" without retiring, so the next hover re-opens it and burns another exposure', () => {
    const { result } = renderCoach();

    act(() => result.current.onCustomizeInteraction('hover'));
    act(() => result.current.onDismiss());

    expect(result.current.isOpen).toBe(false);
    expect(onRetire).not.toHaveBeenCalled();

    act(() => result.current.onCustomizeInteraction('hover'));

    expect(result.current.isOpen).toBe(true);
    expect(onShown).toHaveBeenCalledTimes(2);
  });
});
