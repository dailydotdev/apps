import { useEffect, useState } from 'react';

interface VisualViewportResult {
  width?: number;
  height?: number;
}

const getVisualViewport = (): VisualViewportResult => ({
  width: globalThis?.window.visualViewport.width,
  height: globalThis?.window.visualViewport.height,
});

export const useVisualViewport = (): VisualViewportResult => {
  const [viewPort, setViewPort] = useState(getVisualViewport); // <- only calls the function 1 time this way - performance improvement
  useEffect(() => {
    const handleResize = () => setViewPort(getVisualViewport);
    window.visualViewport.addEventListener('resize', handleResize);
    return () =>
      window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  return viewPort;
};
