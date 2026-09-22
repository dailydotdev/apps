import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

interface CreatorAchievementsSectionProps {
  /**
   * Earned achievements, rendered as a grid once ENG-2127 persists them.
   *
   * Deliberately has no default: a caller that has nothing to pass must pass
   * an empty list and get the empty state, so no placeholder award can ever be
   * mistaken for one the creator earned.
   */
  children?: ReactNode;
  isEmpty: boolean;
}

/**
 * The achievements slot.
 *
 * It exists now so ticket 05 can drop real records in without moving anything
 * else on the page, and it shows nothing but an empty state until then —
 * inventing sample badges here would put awards on screen that nobody won.
 */
export const CreatorAchievementsSection = ({
  children,
  isEmpty,
}: CreatorAchievementsSectionProps): ReactElement => {
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-14 border border-border-subtlest-tertiary px-4 py-8 text-center">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          No achievements yet
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="max-w-80"
        >
          Recognition you earn for your posts will show up here.
        </Typography>
      </div>
    );
  }

  return <div className="flex flex-col gap-4">{children}</div>;
};
