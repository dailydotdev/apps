import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { IconSize } from '../../../components/Icon';
import { HammerIcon } from '../../../components/icons/Hammer';
import { GraduationIcon } from '../../../components/icons/Graduation';
import { VolunteeringIcon } from '../../../components/icons/Volunteering';
import { LfgKind } from '../types';
import { lfgKindLabel } from '../constants';

const kindIcon: Record<LfgKind, typeof HammerIcon> = {
  [LfgKind.Build]: HammerIcon,
  [LfgKind.Learn]: GraduationIcon,
  [LfgKind.Help]: VolunteeringIcon,
};

const kindColor: Record<LfgKind, string> = {
  [LfgKind.Build]: 'text-accent-cabbage-default',
  [LfgKind.Learn]: 'text-accent-water-default',
  [LfgKind.Help]: 'text-accent-avocado-default',
};

export const LfgKindIcon = ({
  kind,
  size = IconSize.Size16,
  className,
}: {
  kind: LfgKind;
  size?: IconSize;
  className?: string;
}): ReactElement => {
  const Icon = kindIcon[kind];

  return (
    <Icon
      size={size}
      secondary
      aria-hidden
      className={classNames(kindColor[kind], className)}
    />
  );
};

export const LfgKindLine = ({
  kind,
  className,
}: {
  kind: LfgKind;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-1.5', className)}>
    <LfgKindIcon kind={kind} />
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
      bold
    >
      {lfgKindLabel[kind]}
    </Typography>
  </div>
);
