import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { SparkleIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { ContributionCause } from '../types';

// Brand-tinted emblems so each cause reads as its own tile.
const emblemAccents = [
  'bg-accent-cabbage-flat text-accent-cabbage-default',
  'bg-accent-avocado-flat text-accent-avocado-default',
  'bg-accent-onion-flat text-accent-onion-default',
  'bg-accent-bacon-flat text-accent-bacon-default',
];

interface CauseEmblemProps {
  cause: ContributionCause;
  // Position in the list, used to pick a stable brand tint for the fallback.
  index: number;
  className?: string;
}

// Shows the cause's real logo on a light tile so each card reads as the actual
// nonprofit. Falls back to a brand-tinted sparkle emblem when the logo is
// missing or fails to load.
export const CauseEmblem = ({
  cause,
  index,
  className,
}: CauseEmblemProps): ReactElement => {
  const [failed, setFailed] = useState(false);

  if (cause.logoUrl && !failed) {
    return (
      <span
        className={classNames(
          'flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-16 bg-white',
          className,
        )}
      >
        <img
          src={cause.logoUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-7 object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={classNames(
        'flex size-11 shrink-0 items-center justify-center rounded-16',
        emblemAccents[index % emblemAccents.length],
        className,
      )}
    >
      <SparkleIcon size={IconSize.Medium} />
    </span>
  );
};
