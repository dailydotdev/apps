import { useEffect } from 'react';

// to make intellisense work on the first parameter
const useWindowEvents: typeof window.addEventListener = (
  event: string,
  func: (e: Event) => void,
): void => {
  useEffect(() => {
    window.addEventListener(event, func);
    return () => window.removeEventListener(event, func);
  }, []);

  return null;
};

export default useWindowEvents;
