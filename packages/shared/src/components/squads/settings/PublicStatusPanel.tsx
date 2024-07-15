import React, { PropsWithChildren, ReactElement } from 'react';
import { SquadPostsProgressBar } from '../SquadPostsProgressBar';

interface PublicStatusPanelProps {
  count: number;
  required: number;
}

export function PublicStatusPanel({
  children,
  count,
  required,
}: PropsWithChildren<PublicStatusPanelProps>): ReactElement {
  return (
    <div className="flex flex-col items-end gap-2">
      <SquadPostsProgressBar
        postsCount={count}
        goal={required}
        className={{ container: 'w-full' }}
      />
      {children}
    </div>
  );
}
