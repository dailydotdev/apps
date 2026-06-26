import { isSpecialKeyPressed } from '../../lib/func';

interface ShouldHandleSpotlightShortcutParams {
  event: KeyboardEvent;
  isShortcutDisabled: boolean;
}

export const shouldHandleSpotlightShortcut = ({
  event,
  isShortcutDisabled,
}: ShouldHandleSpotlightShortcutParams): boolean => {
  if (isShortcutDisabled || event.defaultPrevented) {
    return false;
  }

  return isSpecialKeyPressed({ event }) && event.key.toLowerCase() === 'k';
};
