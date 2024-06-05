import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';

export interface UserShortInfoPlaceholderProps {
  placeholderAmount: number;
}

const MAX_DISPLAY = 5;

const Placeholder = () => (
  <div className="flex flex-row px-6 py-3">
    <ElementPlaceholder className="size-12 rounded-14" />
    <div className="ml-4 flex max-w-full flex-1 flex-col">
      <ElementPlaceholder className="mb-2 h-5 w-1/3 rounded-14" />
      <ElementPlaceholder className="h-5 w-1/2 rounded-14" />
    </div>
  </div>
);

export function UserShortInfoPlaceholder({
  placeholderAmount,
}: UserShortInfoPlaceholderProps): ReactElement {
  const amount =
    placeholderAmount <= MAX_DISPLAY ? placeholderAmount : MAX_DISPLAY;

  return (
    <div className="flex flex-col">
      {Array(amount)
        .fill(0)
        .map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Placeholder key={i} />
        ))}
    </div>
  );
}

export default UserShortInfoPlaceholder;
