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

export const useVisualViewport = (): VisualViewportResult => {
  const [viewPort, setViewPort] = useState(getVisualViewport); // <- only calls the function 1 time this way - performance improvement
  const update = () => setViewPort(getVisualViewport);
  useEventListener(globalThis?.window?.visualViewport, 'resize', update);
  useEventListener(globalThis?.window?.visualViewport, 'scroll', update);

  return viewPort;
};
