import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import Link from '../../../../components/utilities/Link';
import { Image, ImageType } from '../../../../components/image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { combinedClicks } from '../../../../lib/click';
import { hasSquadFeature } from '../../lib/features';
import { VerifiedSquadBadge } from '../VerifiedSquad';

interface SquadRowProps {
  squad: Pick<Squad, 'name' | 'image' | 'permalink' | 'features'>;
  /** The line under the name. */
  details: ReactNode;
  action: ReactNode;
  onClick: () => void;
  children?: ReactNode;
}

// The whole row links to the squad, with the action above the link.
export const SquadRow = ({
  squad,
  details,
  action,
  onClick,
  children,
}: SquadRowProps): ReactElement => {
  const { name, image, permalink } = squad;

  return (
    <div className="relative -mx-2 flex items-center gap-3 rounded-12 px-2 py-2 hover:bg-surface-hover">
      <Link href={permalink}>
        <a
          href={permalink}
          title={name}
          className="absolute inset-0 rounded-12"
          {...combinedClicks(onClick)}
        />
      </Link>
      <Image
        src={image}
        alt={`${name} source`}
        type={ImageType.Squad}
        className="size-10 shrink-0 rounded-full object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
          className="flex min-w-0 items-center gap-1"
        >
          <span className="min-w-0 shrink truncate">{name}</span>
          {hasSquadFeature(squad, 'verified') && <VerifiedSquadBadge />}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="flex min-w-0 items-center"
        >
          {details}
        </Typography>
      </div>
      <div className="relative z-1 shrink-0">{action}</div>
      {children}
    </div>
  );
};
