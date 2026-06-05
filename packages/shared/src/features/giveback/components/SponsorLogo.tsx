import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { getSponsorInitials } from '../utils';

interface SponsorLogoProps {
  name: string;
  logoUrl?: string;
  /** Overrides the computed initials (e.g. "+3" for a grouped tile). */
  initials?: string;
  /** Size and shape classes for the square. */
  className?: string;
  /** Background + text color used for the initials fallback. */
  tileClassName?: string;
  /** Typography (font size) for the initials fallback. */
  initialsClassName?: string;
}

// Renders a sponsor's real brand logo on a white chip so it reads like a real
// sponsorship, falling back to initials when there's no logo (individuals,
// freshly added sponsors) or the image fails to load.
export const SponsorLogo = ({
  name,
  logoUrl,
  initials,
  className,
  tileClassName,
  initialsClassName,
}: SponsorLogoProps): ReactElement => {
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
          src={logoUrl}
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
