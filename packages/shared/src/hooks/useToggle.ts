import { useCallback, useState } from 'react';

export const useToggle = (initialState = false) => {
  const [state, setState] = useState(initialState);
  const toggle = (forced?: boolean) => {
    if (typeof forced === 'boolean') {
      setState(forced);
      return;
    }

    setState((state) => !state);
  };
  return [state, toggle] as const;
};
