import React, { useEffect } from 'react';

export const usePrevious = <T>(value: T): T => {
  const ref = React.useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
