import React, { ReactElement } from 'react';
import { PlaceholderList } from '../cards/PlaceholderList';

export interface UpvoterListPlaceholderProps {
  placeholderAmount: number;
}

const MAX_DISPLAY = 5;

export function UpvoterListPlaceholder({
  placeholderAmount,
}: UpvoterListPlaceholderProps): ReactElement {
  const amount =
    placeholderAmount <= MAX_DISPLAY ? placeholderAmount : MAX_DISPLAY;

  return (
    <div className="flex flex-col">
      {Array(amount)
        .fill(0)
        .map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <PlaceholderList key={i} />
        ))}
    </div>
  );
}

export default UpvoterListPlaceholder;
