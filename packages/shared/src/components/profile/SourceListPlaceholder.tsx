import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';

export interface SourceListPlaceholderProps {
  placeholderAmount: number;
}

const MAX_DISPLAY = 3;

const Placeholder = () => (
  <div className="flex gap-2">
    <ElementPlaceholder className="size-10 rounded-full" />
    <div className="flex max-w-full flex-1 flex-col">
      <ElementPlaceholder className="mb-2 h-5 w-1/3 rounded-14" />
      <ElementPlaceholder className="h-5 w-1/2 rounded-14" />
    </div>
    <ElementPlaceholder className="h-8 w-24 rounded-12" />
  </div>
);

export function SourceListPlaceholder({
  placeholderAmount,
}: SourceListPlaceholderProps): ReactElement {
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
