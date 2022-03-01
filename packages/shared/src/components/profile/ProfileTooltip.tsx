import React, { ReactElement } from 'react';
import { useProfileTooltip } from '../../hooks/useProfileTooltip';
import {
  LinkWithTooltip,
  LinkWithTooltipProps,
} from '../tooltips/LinkWithTooltip';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import {
  ProfileTooltipContent,
  ProfileTooltipContentProps,
} from './ProfileTooltipContent';

export interface ProfileTooltipProps extends ProfileTooltipContentProps {
  children: ReactElement;
  link?: Omit<LinkWithTooltipProps, 'children' | 'tooltip'>;
}

export const profileTooltipClasses = {
  padding: 'p-6',
  roundness: 'rounded-16',
  classNames:
    'w-72 bg-theme-bg-primary shadow-2 border border-theme-divider-secondary',
};

export function ProfileTooltip({
  children,
  user,
  link,
}: ProfileTooltipProps): ReactElement {
  const { data, fetchInfo } = useProfileTooltip(user.id);
  const Tooltip = link ? LinkWithTooltip : SimpleTooltip;
  const props = {
    interactive: true,
    container: {
      arrow: false,
      paddingClassName: profileTooltipClasses.padding,
      roundedClassName: profileTooltipClasses.roundness,
      className: profileTooltipClasses.classNames,
    },
  };

  return (
    <Tooltip
      content={data ? <ProfileTooltipContent user={user} data={data} /> : null}
      {...link}
      {...props}
      onTrigger={fetchInfo}
      tooltip={props}
    >
      {children}
    </Tooltip>
  );
}
