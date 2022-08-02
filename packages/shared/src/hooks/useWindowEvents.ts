import { useEffect } from 'react';

export default function useWindowEvents<T = unknown>(
  event: string,
  func: (T) => void,
): [void] {
  useEffect(() => {
    window.addEventListener(event, func);
    return () => window.removeEventListener(event, func);
  }, []);

  return null;
}
