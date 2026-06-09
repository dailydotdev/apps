import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { fallbackImages } from '../../../lib/config';

interface GivebackAvatarProps {
  src: string;
  sizeClassName?: string;
  className?: string;
}

// Single avatar that swaps to the shared placeholder if the image fails. Uses
// state rather than mutating the element so it plays nicely with lint rules.
export const GivebackAvatar = ({
  src,
  sizeClassName = 'size-6',
  className,
}: GivebackAvatarProps): ReactElement => {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed ? fallbackImages.avatar : src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={classNames(
        'rounded-full object-cover',
        sizeClassName,
        className,
      )}
    />
  );
};

interface GivebackContributorFacesProps {
  avatars: string[];
  /** Total contributors; anything beyond the shown faces becomes a "+N" chip. */
  totalCount: number;
  /** Tailwind size utility for each face. Defaults to a compact card size. */
  sizeClassName?: string;
  className?: string;
}

// Overlapping avatar stack used to put real faces on the community engagement
// row.
export const GivebackContributorFaces = ({
  avatars,
  totalCount,
  sizeClassName = 'size-6',
  className,
}: GivebackContributorFacesProps): ReactElement | null => {
  const faces = avatars.slice(0, 3);
  if (!faces.length) {
    return null;
  }

  const overflow = totalCount - faces.length;

  return (
    <div className={classNames('flex items-center', className)}>
      <div className="flex -space-x-2">
        {faces.map((avatar, index) => (
          <GivebackAvatar
            // Avatars come from a small shared pool, so index keeps keys stable.
            // eslint-disable-next-line react/no-array-index-key
            key={`${avatar}-${index}`}
            src={avatar}
            sizeClassName={sizeClassName}
            className="border-2 border-background-default bg-surface-float"
          />
        ))}
        {overflow > 0 && (
          <span
            className={classNames(
              'flex items-center justify-center rounded-full border-2 border-background-default bg-surface-secondary font-bold text-text-primary typo-caption2',
              sizeClassName,
            )}
          >
            +{overflow > 99 ? '99' : overflow}
          </span>
        )}
      </div>
    </div>
  );
};
