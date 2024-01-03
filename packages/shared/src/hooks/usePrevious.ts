import React, { useEffect } from 'react';

export const usePrevious = (value: string): string => {
  const ref = React.useRef<string>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
