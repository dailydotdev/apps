import { useEffect, useMemo } from 'react';

export default function useWindowEvents(
  event: string,
  func: () => void,
): [void] {
  const cancelWindowEvent = window.removeEventListener(event, func);

  useEffect(() => {
    window.addEventListener(event, func);
    return () => cancelWindowEvent;
  }, []);

  return useMemo(() => [cancelWindowEvent], []);
}
