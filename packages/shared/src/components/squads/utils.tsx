import React, { PropsWithChildren, ReactElement } from 'react';
import classed from '../../lib/classed';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import {
  BasePageContainer,
  pageBorders,
  WithClassNameProps,
} from '../utilities';

export const SquadTitle = ({
  children,
  className,
}: PropsWithChildren<WithClassNameProps>): ReactElement => (
  <Typography
    className={className}
    tag={TypographyTag.H1}
    type={TypographyType.LargeTitle}
    bold
  >
    {children}
  </Typography>
);

export const SquadSubTitle = ({
  children,
}: PropsWithChildren): ReactElement => (
  <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
    {children}
  </Typography>
);
export const SquadTitleColor = classed('span', 'text-brand-default');

export const ManageSquadPageContainer = classed(
  BasePageContainer,
  '!p-0 laptop:min-h-page h-full !max-w-[42.5rem] !w-full',
  pageBorders,
);

export const ManageSquadPageMain = classed('div', 'flex flex-1 flex-col');
