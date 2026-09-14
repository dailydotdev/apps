import type { HTMLAttributes, MouseEvent, TouchEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import type { Origin } from '../lib/log';
import type { UseShareOrCopyLinkProps } from './useShareOrCopyLink';
import { useShareOrCopyLink } from './useShareOrCopyLink';
import { useTouchLongPress } from './useTouchLongPress';

/** Long enough to register on the hand, short enough not to read as an error. */
const HOLD_VIBRATION_MS = 15;

/** How the share was triggered, beside `provider` in the event's extra. */
export const HOLD_GESTURE = 'long press';

interface UseHoldToShareProps {
  shareProps: UseShareOrCopyLinkProps &
    Required<Pick<UseShareOrCopyLinkProps, 'logObject'>>;
  origin: Origin;
}

export type HoldToShareProps = Pick<
  HTMLAttributes<HTMLElement>,
  | 'onTouchStart'
  | 'onTouchMove'
  | 'onTouchEnd'
  | 'onTouchCancel'
  | 'onClickCapture'
  | 'onContextMenu'
>;

interface UseHoldToShareResult {
  /** From the hold registering until the finger lifts, for a pressed style. */
  isHeld: boolean;
  holdProps: HoldToShareProps;
}

/**
 * Hold a row or card to share its link, for touch screens where a hover-only
 * copy control has nothing to reveal it. The share runs when the finger lifts,
 * not when the hold registers: Safari refuses clipboard and share calls from a
 * timer, and touchend is still the user's gesture.
 *
 * The hold takes over from the browser's own hold-a-link sheet, so the element
 * also needs `touch-callout-none`, and its context menu is cancelled while a
 * press is down.
 */
export function useHoldToShare({
  shareProps,
  origin,
}: UseHoldToShareProps): UseHoldToShareResult {
  const [isHeld, setIsHeld] = useState(false);
  const pressingRef = useRef(false);
  const heldRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [, share] = useShareOrCopyLink({
    ...shareProps,
    logObject: (provider) => ({
      ...shareProps.logObject(provider),
      extra: JSON.stringify({ provider, origin, gesture: HOLD_GESTURE }),
    }),
  });

  const onLongPress = useCallback(() => {
    heldRef.current = true;
    setIsHeld(true);
    globalThis.navigator?.vibrate?.(HOLD_VIBRATION_MS);
  }, []);

  const {
    onTouchStart: startLongPress,
    onTouchMove,
    onTouchEnd: endLongPress,
    onTouchCancel: cancelLongPress,
  } = useTouchLongPress<undefined>({ enabled: true, onLongPress });

  const release = useCallback(() => {
    pressingRef.current = false;
    heldRef.current = false;
    setIsHeld(false);
  }, []);

  const onTouchStart = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      suppressClickRef.current = false;
      // The row's own buttons keep their tap: holding Join is not a share.
      if (
        event.target instanceof Element &&
        event.target.closest('button, [role="button"]')
      ) {
        return;
      }

      pressingRef.current = true;
      heldRef.current = false;
      startLongPress(event, undefined);
    },
    [startLongPress],
  );

  const onTouchEnd = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      endLongPress();

      if (heldRef.current) {
        // Cancels the click the browser synthesizes from this touch, so the
        // hold does not also open the row's link.
        event.preventDefault();
        suppressClickRef.current = true;
        share();
      }

      release();
    },
    [endLongPress, release, share],
  );

  const onTouchCancel = useCallback(() => {
    cancelLongPress();
    release();
  }, [cancelLongPress, release]);

  // Not every browser honours the touchend preventDefault.
  const onClickCapture = useCallback((event: MouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) {
      return;
    }

    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // Android opens its link menu at about the moment the hold registers.
  const onContextMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    if (pressingRef.current || heldRef.current) {
      event.preventDefault();
    }
  }, []);

  return {
    isHeld,
    holdProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      onClickCapture,
      onContextMenu,
    },
  };
}
