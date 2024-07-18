import React, { PropsWithChildren, ReactElement } from 'react';
import { SquadPublicProgressBars } from '../SquadPublicProgressBars';

interface PublicStatusPanelProps {
  count: number;
}

export function PublicStatusPanel({
  children,
  count,
}: PropsWithChildren<PublicStatusPanelProps>): ReactElement {
  return (
    <div className="flex flex-col items-end gap-4">
      <SquadPublicProgressBars postsCount={count} />
      {children}
    </div>
  );
}
