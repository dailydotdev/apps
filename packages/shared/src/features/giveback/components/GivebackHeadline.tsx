import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface GivebackHeadlineProps {
  title: string;
  highlight: string;
  className?: string;
}

// One big two-part headline per tab: a white line plus a gradient payoff,
// matching the hero. Sections beneath only carry small plain sub-titles.
export const GivebackHeadline = ({
  title,
  highlight,
  className,
}: GivebackHeadlineProps): ReactElement => (
  <Typography
    tag={TypographyTag.H2}
    type={TypographyType.LargeTitle}
    bold
    className={classNames('max-w-3xl', className)}
  >
    {title}
    <span className="block bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
      {highlight}
    </span>
  </Typography>
);
