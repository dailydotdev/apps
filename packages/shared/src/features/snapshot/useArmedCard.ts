import type { FocusEventHandler, PointerEventHandler } from 'react';
import { useCallback, useState } from 'react';

interface ArmedCard {
  isArmed: boolean;
  /** Spread onto the element wrapping the trigger. */
  armProps: {
    onFocus: FocusEventHandler;
    onPointerDown: PointerEventHandler;
    onPointerEnter: PointerEventHandler;
  };
}

/**
 * Snapshot cards are captured from the live DOM, so the card has to be mounted
 * before the press rather than in response to it. Mounting it with the page
 * would put a second copy of the post's own copy in the document on every
 * view, so it is armed on the first sign the reader is heading for the button
 * instead: hover, touch, or focus. All three land a render before the click.
 */
export function useArmedCard(): ArmedCard {
  const [isArmed, setIsArmed] = useState(false);
  const arm = useCallback(() => setIsArmed(true), []);

  return {
    isArmed,
    armProps: { onFocus: arm, onPointerDown: arm, onPointerEnter: arm },
  };
}
