import React, { ReactElement } from 'react';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ShareIcon } from '../../icons';

export function CardCoverShare(): ReactElement {
  return (
    <span className="absolute inset-0 flex flex-col items-center justify-center bg-theme-highlight-blur">
      <p className="font-bold typo-callout">
        Should anyone else see this post?
      </p>
      <span className="mt-2 flex flex-row gap-3 p-2">
        <Button variant={ButtonVariant.Secondary}>Copy link</Button>
        <Button variant={ButtonVariant.Secondary} icon={<ShareIcon />} />
      </span>
    </span>
  );
}
