import React, { ReactElement } from 'react';
import {
  LinkWithTooltip,
  LinkWithTooltipProps,
} from '../tooltips/LinkWithTooltip';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import {
  ProfileTooltipContent,
  ProfileTooltipContentProps,
} from './ProfileTolltipContent';

export interface ProfileTooltipProps extends ProfileTooltipContentProps {
  children: ReactElement;
  link?: Omit<LinkWithTooltipProps, 'children'>;
}

export function ProfileTooltip({
  children,
  user,
  link,
}: ProfileTooltipProps): ReactElement {
  const Tooltip = link ? LinkWithTooltip : SimpleTooltip;

  return (
    <Tooltip
      content={<ProfileTooltipContent user={user} />}
      {...link}
      interactive
      container={{
        arrow: false,
        paddingClassName: 'p-6',
        roundedClassName: 'rounded-16',
        className:
          'w-72 bg-theme-bg-primary shadow-2 border border-theme-divider-secondary',
      }}
    >
      {children}
    </Tooltip>
  );
}
