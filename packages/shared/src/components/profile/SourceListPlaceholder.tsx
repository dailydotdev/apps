import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { BodyTextPlaceholder, TextPlaceholder } from '../widgets/common';

export interface SourceListPlaceholderProps {
  placeholderAmount: number;
}

const MAX_DISPLAY = 8;

const Placeholder = () => (
  <div className="flex gap-2 px-6 py-3">
    <ElementPlaceholder className="mt-2 size-10 shrink-0 rounded-full" />
    <div className="flex max-w-full flex-1 flex-col gap-1 py-1">
      <BodyTextPlaceholder className="w-2/5" />
      <TextPlaceholder className="w-1/4" />
      <TextPlaceholder className="w-4/5" />
    </div>
    <ElementPlaceholder className="h-8 w-20 shrink-0 rounded-12" />
  </div>
);

export function SourceListPlaceholder({
  placeholderAmount,
}: SourceListPlaceholderProps): ReactElement {
  const amount =
    placeholderAmount <= MAX_DISPLAY ? placeholderAmount : MAX_DISPLAY;

  return (
    <div className="flex flex-col" aria-busy>
      {Array(Math.max(0, amount))
        .fill(0)
        .map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Placeholder key={i} />
        ))}
    </div>
  );
}
