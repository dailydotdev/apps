import React, { ReactElement } from 'react';
import { Button, ButtonVariant } from '../../buttons/Button';
import { StatusDescription } from './common';
import { ProgressBar } from '../../fields/ProgressBar';

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
      <StatusDescription className="flex w-full">
        <span className="mr-auto">Posts</span>
        <strong>{count}/3</strong>
      </StatusDescription>
      <ProgressBar
        className={{ bar: 'h-2.5 rounded-16', wrapper: 'rounded-16' }}
        percentage={(count / required) * 100}
        shouldShowBg
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
