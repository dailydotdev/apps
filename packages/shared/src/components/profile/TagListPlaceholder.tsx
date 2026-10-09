import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { BodyTextPlaceholder } from '../widgets/common';

export interface TagListPlaceholderProps {
  placeholderAmount: number;
}

const MAX_DISPLAY = 8;

const Placeholder = () => (
  <div className="flex items-center gap-2">
    <div className="flex max-w-full flex-1 flex-col">
      <BodyTextPlaceholder className="w-1/3" />
    </div>
    <ElementPlaceholder className="h-8 w-20 rounded-12" />
  </div>
);

export function TagListPlaceholder({
  placeholderAmount,
}: TagListPlaceholderProps): ReactElement {
  const amount =
    placeholderAmount <= MAX_DISPLAY ? placeholderAmount : MAX_DISPLAY;

  return (
    <div className="flex flex-col gap-2" aria-busy>
      {Array(Math.max(0, amount))
        .fill(0)
        .map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Placeholder key={i} />
        ))}
    </div>
  );
}
