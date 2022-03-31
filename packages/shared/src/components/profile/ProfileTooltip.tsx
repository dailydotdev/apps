import React, { ReactElement } from 'react';
import { Author } from '../../graphql/comments';
import { useProfileTooltip } from '../../hooks/useProfileTooltip';
import { TooltipProps } from '../tooltips/BaseTooltip';
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
  tooltip?: TooltipProps;
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
  tooltip = {},
  ...rest
}: Omit<ProfileTooltipProps, 'user'> & {
  user?: Partial<Author>;
}): ReactElement {
  const { data, fetchInfo, isLoading } = useProfileTooltip({
    userId: user.id,
    requestUserInfo: true,
  });
  const props = {
    arrow: false,
    interactive: true,
    container: {
      arrow: false,
      paddingClassName: profileTooltipClasses.padding,
      roundedClassName: profileTooltipClasses.roundness,
      className: profileTooltipClasses.classNames,
    },
    content:
      data?.user && !isLoading ? (
        <ProfileTooltipContent user={data.user} data={data} {...rest} />
      ) : null,
    ...tooltip,
  };

  if (link) {
    return (
      <LinkWithTooltip {...link} tooltip={{ ...props, onTrigger: fetchInfo }}>
        {children}
      </LinkWithTooltip>
    );
  }

  return (
    <SimpleTooltip {...props} onTrigger={fetchInfo}>
      {children}
    </SimpleTooltip>
  );
}
