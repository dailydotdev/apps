import React, { useMemo } from 'react';
import type { ReactElement } from 'react';

export const useScrambler = (text?: string): (ReactElement | string)[] | null =>
  useMemo(
    () =>
      text
        ? text.split('').map((char, index) => {
            // 50% chance to wrap in a span (fragmentation)
            const isSpan = Math.random() > 0.5;
            // 50% chance to append a zero-width space
            const hasZws = Math.random() > 0.5;

            const content = hasZws ? `${char}\u200B` : char;

            if (isSpan) {
              // eslint-disable-next-line react/no-array-index-key
              return <span key={`scramble-${index}`}>{content}</span>;
            }
            return content;
          })
        : null,
    [text],
  );
