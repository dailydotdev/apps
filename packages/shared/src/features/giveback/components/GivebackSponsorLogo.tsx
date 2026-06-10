import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { getSponsorInitials } from '../utils';

interface GivebackSponsorLogoProps {
  name: string;
  logoUrl?: string | null;
  // Overrides the computed initials (e.g. "+3" for a grouped tile).
  initials?: string;
  className?: string;
  tileClassName?: string;
  initialsClassName?: string;
}

// Renders a sponsor's real brand logo on a white chip, falling back to initials
// when there's no logo (individuals, fresh sponsors) or the image fails to load.
export const GivebackSponsorLogo = ({
  name,
  logoUrl,
  initials,
  className,
  tileClassName,
  initialsClassName,
}: GivebackSponsorLogoProps): ReactElement => {
  const [failed, setFailed] = useState(false);
  const showLogo = Boolean(logoUrl) && !failed;
  const label = initials ?? getSponsorInitials(name);

  return (
    <span
      className={classNames(
        'flex shrink-0 items-center justify-center overflow-hidden font-bold',
        className,
        showLogo ? 'bg-white' : tileClassName,
        !showLogo && initialsClassName,
      )}
    >
      {showLogo ? (
        <img
          src={logoUrl ?? undefined}
          alt={`${name} logo`}
          loading="lazy"
          className="size-full object-contain p-1.5"
          onError={() => setFailed(true)}
        />
      ) : (
        label
      )}
    </span>
  );
};
