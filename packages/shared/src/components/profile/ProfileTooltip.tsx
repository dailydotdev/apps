import request from 'graphql-request';
import React, { ReactElement, useState } from 'react';
import { useQuery } from 'react-query';
import {
  UserTooltipContentData,
  USER_TOOLTIP_CONTENT_QUERY,
} from '../../graphql/users';
import { apiUrl } from '../../lib/config';
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

export function ProfileTooltip({
  children,
  user,
  link,
}: ProfileTooltipProps): ReactElement {
  const [shouldFetch, setShouldFetch] = useState(false);
  const Tooltip = link ? LinkWithTooltip : SimpleTooltip;
  const props = {
    interactive: true,
    container: {
      arrow: false,
      paddingClassName: 'p-6',
      roundedClassName: 'rounded-16',
      className:
        'w-72 bg-theme-bg-primary shadow-2 border border-theme-divider-secondary',
    },
  };

  const key = ['readingRank', user.id];
  const { data } = useQuery<UserTooltipContentData>(
    key,
    () =>
      request(`${apiUrl}/graphql`, USER_TOOLTIP_CONTENT_QUERY, {
        id: user.id,
      }),
    {
      refetchOnWindowFocus: false,
      enabled: shouldFetch,
      onSettled: () => setShouldFetch(false),
    },
  );

  return (
    <Tooltip
      content={data ? <ProfileTooltipContent user={user} data={data} /> : null}
      {...link}
      {...props}
      onTrigger={() => setShouldFetch(true)}
      tooltip={props}
    >
      {children}
    </Tooltip>
  );
}
