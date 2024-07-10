import { useState } from 'react';

type UseToggle = (
  initialState: boolean,
) => readonly [boolean, (forced?: boolean) => void];

export const useToggle: UseToggle = (initialState) => {
  const [state, setState] = useState(initialState);
  const toggle = (forced?: boolean) => {
    if (typeof forced === 'boolean') {
      setState(forced);
      return;
    }

    setState((value) => !value);
  };
  return [state, toggle] as const;
};
