import { useState, useEffect } from 'react';

const RED_DOT_STATE = 'red_dot';

export function useRedDot(): [boolean, () => void] {
  const [showRedDot, setShowRedDot] = useState(false);

  useEffect(() => {
    const redDotValue = localStorage.getItem(RED_DOT_STATE);
    if (!redDotValue) {
      setShowRedDot(true);
    }
  }, []);

  const hideRedDot = (): void => {
    setShowRedDot(false);
    localStorage.setItem(RED_DOT_STATE, '1');
  };

  return [showRedDot, hideRedDot];
}
