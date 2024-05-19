import React, { ReactElement } from 'react';
import { Button, ButtonVariant } from '../../buttons/Button';
import { SquadPostsProgressBar } from '../SquadPostsProgressBar';

interface PublicStatusPanelProps {
  count: number;
  required: number;
}

export function PublicStatusPanel({
  count,
  required,
}: PublicStatusPanelProps): ReactElement {
  return (
    <div className="flex flex-col items-end gap-2">
      <SquadPostsProgressBar
        postsCount={count}
        goal={required}
        className={{ container: 'w-full' }}
      />
      <Button
        variant={ButtonVariant.Secondary}
        className="mt-5 w-fit"
        disabled={count < required}
      >
        Submit for review
      </Button>
    </div>
  );
}
