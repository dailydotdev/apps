import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';

export interface TagListPlaceholderProps {
  placeholderAmount: number;
}

const MAX_DISPLAY = 3;

const Placeholder = () => (
  <div className="flex gap-2">
    <div className="flex max-w-full flex-1 flex-col">
      <ElementPlaceholder className="h-5 w-1/3 rounded-14" />
    </div>
    <ElementPlaceholder className="h-8 w-24 rounded-12" />
  </div>
);

export function TagListPlaceholder({
  placeholderAmount,
}: TagListPlaceholderProps): ReactElement {
  const amount =
    placeholderAmount <= MAX_DISPLAY ? placeholderAmount : MAX_DISPLAY;

  return (
    <div className="flex flex-col gap-2">
      {Array(amount)
        .fill(0)
        .map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Placeholder key={i} />
        ))}
    </div>
  );
}
