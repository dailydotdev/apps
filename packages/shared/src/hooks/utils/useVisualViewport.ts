import { useState } from 'react';
import { useEventListener } from '../useEventListener';

interface VisualViewportResult {
  width?: number;
  height?: number;
  offsetTop?: number;
}

const getVisualViewport = (): VisualViewportResult => ({
  width: globalThis?.window?.visualViewport?.width ?? 0,
  height: globalThis?.window?.visualViewport?.height ?? 0,
  // iOS scrolls the layout viewport under the keyboard rather than resizing it,
  // so a fixed overlay has to be pushed down by this much to stay on screen.
  offsetTop: globalThis?.window?.visualViewport?.offsetTop ?? 0,
});

/**
 * @param enabled subscribe to viewport changes. Pass `false` from consumers
 * that only read the value in some states: `scroll` fires continuously on iOS
 * while the keyboard is open, and each event re-renders the whole subtree.
 */
export const useVisualViewport = (enabled = true): VisualViewportResult => {
  const [viewPort, setViewPort] = useState(getVisualViewport); // <- only calls the function 1 time this way - performance improvement
  const update = () => setViewPort(getVisualViewport);
  const target = enabled ? globalThis?.window?.visualViewport : undefined;
  useEventListener(target, 'resize', update);
  useEventListener(target, 'scroll', update);

  return viewPort;
};
