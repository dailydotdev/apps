import { useState } from 'react';
import { useEventListener } from '../useEventListener';

interface VisualViewportResult {
  width?: number;
  height?: number;
}

const getVisualViewport = (): VisualViewportResult => ({
  width: globalThis?.window?.visualViewport?.width ?? 0,
  height: globalThis?.window?.visualViewport?.height ?? 0,
});

export const useVisualViewport = (): VisualViewportResult => {
  const [viewPort, setViewPort] = useState(getVisualViewport); // <- only calls the function 1 time this way - performance improvement
  useEventListener(globalThis?.window?.visualViewport, 'resize', () =>
    setViewPort(getVisualViewport),
  );

  return viewPort;
};
