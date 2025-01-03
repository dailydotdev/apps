import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { EarthIcon, LockIcon, SourceIcon, SparkleIcon } from '../../icons';

interface SquadPrivacyStateProps {
  isPublic: boolean;
  isFeatured: boolean;
}

export function SquadPrivacyState({
  isPublic,
  isFeatured,
}: SquadPrivacyStateProps): ReactElement {
  const props = (() => {
    if (isFeatured) {
      return { icon: <SourceIcon secondary />, copy: 'Featured' };
    }

    if (isPublic) {
      return { icon: <EarthIcon />, copy: 'Public' };
    }

    return { icon: <LockIcon />, copy: 'Private' };
  })();

  return (
    <Button
      icon={props.icon}
      size={ButtonSize.Small}
      variant={isFeatured ? ButtonVariant.Secondary : ButtonVariant.Float}
      className={classNames(
        'pointer-events-none',
        isFeatured &&
          'relative border-overlay-primary-cabbage bg-overlay-tertiary-cabbage',
      )}
    >
      {props.copy} Squad
      {isFeatured && (
        <>
          <SparkleIcon className="absolute -top-2.5 right-0 animate-scale-down-pulse delay-[625ms]" />
          <SparkleIcon className="absolute -bottom-2.5 left-0 animate-scale-down-pulse" />
        </>
      )}
    </Button>
  );
}
