import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ShareIcon } from '../../icons';

interface CardCoverShareProps {
  className?: string;
}

export function CardCoverShare({
  className,
}: CardCoverShareProps): ReactElement {
  return (
    <span
      className={classNames(
        'flex flex-col items-center justify-center',
        className,
      )}
    >
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
