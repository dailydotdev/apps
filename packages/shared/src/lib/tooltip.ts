export type TooltipOptions = { position: 'up' | 'down' | 'left' | 'right' };

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
