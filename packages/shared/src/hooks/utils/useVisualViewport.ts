import { useEffect, useState } from 'react';

interface VisualViewportResult {
  width?: number;
  height?: number;
}

const getVisualViewport = (): VisualViewportResult => ({
  width: globalThis?.window?.visualViewport.width ?? 0,
  height: globalThis?.window?.visualViewport.height ?? 0,
});

export const useVisualViewport = (): VisualViewportResult => {
  const [viewPort, setViewPort] = useState(getVisualViewport); // <- only calls the function 1 time this way - performance improvement
  useEffect(() => {
    const handleResize = () => setViewPort(getVisualViewport);
    globalThis?.window?.visualViewport.addEventListener('resize', handleResize);
    return () =>
      globalThis?.window?.visualViewport.removeEventListener(
        'resize',
        handleResize,
      );
  }, []);

  return viewPort;
};
