export type TooltipOptions = { position: 'up' | 'down' | 'left' | 'right' };

export const getTooltipProps = (
  content: string,
  opts?: TooltipOptions,
): Record<string, unknown> => ({
  'aria-label': content,
  'data-balloon-pos': opts?.position ?? 'up',
  'data-balloon-nofocus': true,
});

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
