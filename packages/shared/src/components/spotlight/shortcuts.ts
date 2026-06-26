import { isSpecialKeyPressed } from '../../lib/func';

let shortcutBlockerCount = 0;

interface ShouldHandleSpotlightShortcutParams {
  event: KeyboardEvent;
  isShortcutDisabled: boolean;
}

export const registerSpotlightShortcutBlocker = (): (() => void) => {
  let isRegistered = true;
  shortcutBlockerCount += 1;

  return () => {
    if (!isRegistered) {
      return;
    }

    isRegistered = false;
    shortcutBlockerCount = Math.max(0, shortcutBlockerCount - 1);
  };
};

export const isSpotlightShortcutDisabled = (): boolean =>
  shortcutBlockerCount > 0;

export const shouldHandleSpotlightShortcut = ({
  event,
  isShortcutDisabled,
}: ShouldHandleSpotlightShortcutParams): boolean => {
  if (isShortcutDisabled || event.defaultPrevented) {
    return false;
  }

  return isSpecialKeyPressed({ event }) && event.key.toLowerCase() === 'k';
};
