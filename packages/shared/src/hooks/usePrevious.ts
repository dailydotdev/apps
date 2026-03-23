import React, { useEffect } from 'react';

export const usePrevious = <T>(value: T): T => {
  const ref = React.useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
