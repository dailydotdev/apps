import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

type SeeAllAchievementsCardProps = {
  href: string;
};

export const SeeAllAchievementsCard = ({
  href,
}: SeeAllAchievementsCardProps): ReactElement => {
  return (
    <Link href={href} passHref>
      <a className="group flex h-[252px] w-48 shrink-0 flex-col items-center justify-center gap-3 rounded-16 border border-border-subtlest-tertiary transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover">
        <span className="flex size-14 items-center justify-center rounded-max bg-background-subtle text-text-primary transition-transform group-hover:translate-x-1">
          <ArrowIcon size={IconSize.Large} className="rotate-90" />
        </span>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Primary}
          bold
        >
          See all achievements
        </Typography>
      </a>
    </Link>
  );
};
