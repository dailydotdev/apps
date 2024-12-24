import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import classed from '../../lib/classed';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { WithClassNameProps } from '../utilities';
import { BasePageContainer, pageBorders } from '../utilities';
import type { Squad } from '../../graphql/sources';
import { SourcePermissions } from '../../graphql/sources';
import { TimerIcon } from '../icons';
import { IconSize } from '../Icon';
import type { PromptOptions } from '../../hooks/usePrompt';
import { ModalSize } from '../modals/common/types';
import { verifyPermission } from '../../graphql/squads';

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

export const moderationRequired = (squad: Squad): boolean =>
  squad?.moderationRequired &&
  !verifyPermission(squad, SourcePermissions.ModeratePost);

export const createModerationPromptProps: PromptOptions = {
  title: 'Your post has been submitted for review',
  description:
    "Your post is now waiting for the admin's approval. We'll notify you once it's been reviewed.",
  okButton: {
    title: 'Got it',
    className: 'tablet:w-full',
  },
  cancelButton: null,
  promptSize: ModalSize.XSmall,
  icon: <TimerIcon size={IconSize.XXXLarge} />,
};

export const editModerationPromptProps: PromptOptions = {
  ...createModerationPromptProps,
  title: 'Your edit has been submitted for review',
  description:
    'Your edit is now waiting for the admin’s approval. We’ll notify you once it’s been reviewed.',
};

export interface SquadSettingsProps {
  handle: string;
}
