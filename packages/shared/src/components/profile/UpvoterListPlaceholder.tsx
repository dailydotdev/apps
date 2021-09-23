import React, { ReactElement } from 'react';
import { PlaceholderList } from '../cards/PlaceholderList';

export interface UpvoterListPlaceholderProps {
  placeholderAmount?: number;
}

export function UpvoterListPlaceholder({
  placeholderAmount = 5,
}: UpvoterListPlaceholderProps): ReactElement {
  return (
    <div className="flex flex-col">
      {Array(placeholderAmount)
        .fill(0)
        .map(() => (
          <PlaceholderList key={Math.random()} />
        ))}
    </div>
  );
}

export default UpvoterListPlaceholder;
