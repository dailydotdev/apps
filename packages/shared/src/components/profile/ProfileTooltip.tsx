import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Author } from '../../graphql/comments';
import type { TooltipProps } from '../tooltips/BaseTooltip';
import type { LinkWithTooltipProps } from '../tooltips/LinkWithTooltip';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import type { MostReadTag, UserReadingRank } from '../../graphql/users';
import { getUserShortInfo } from '../../graphql/users';
import UserEntityCard from '../cards/entity/UserEntityCard';
import { generateQueryKey, RequestKey } from '../../lib/query';

export interface ProfileTooltipProps extends ProfileTooltipContentProps {
  children: ReactElement;
  link?: Omit<LinkWithTooltipProps, 'children' | 'tooltip'>;
  tooltip?: TooltipProps;
  nativeLazyLoading?: boolean;
  scrollingContainer?: HTMLElement;
}

export type UserTooltipContentData = {
  rank: UserReadingRank;
  tags: MostReadTag[];
  user?: Author;
};

export interface ProfileTooltipContentProps {
  userId: Author['id'];
  data?: UserTooltipContentData;
}

export function ProfileTooltip({
  children,
  userId,
  link,
  scrollingContainer,
  tooltip = {},
}: Omit<ProfileTooltipProps, 'user'>): ReactElement {
  const query = useQueryClient();
  const handler = useRef<() => void>();
  const [id, setId] = useState<string | undefined>(undefined);
  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(RequestKey.UserShortById, { id }),
    queryFn: () => {
      return getUserShortInfo(id);
    },
    enabled: !!id,
  });

  const onShow = () => {
    if (!scrollingContainer) {
      return;
    }

    scrollingContainer.removeEventListener('scroll', handler.current);
    handler.current = () =>
      query.setQueryData(['readingRank', userId], () => {});
    scrollingContainer.addEventListener('scroll', handler.current);
  };

  const onHide = () => {
    if (!scrollingContainer) {
      return;
    }
    scrollingContainer.removeEventListener('scroll', handler.current);
  };

  const props: TooltipProps = {
    showArrow: false,
    interactive: true,
    onHide,
    appendTo: tooltip?.appendTo || globalThis?.document?.body,
    container: { bgClassName: null },
    // content: data ? <DevCard data={data} type={DevCardType.Compact} /> : null,
    content: !isLoading && data ? <UserEntityCard user={data} /> : null,
    ...tooltip,
    onShow: (instance) => {
      if (id !== userId) {
        setId(userId);
      }
      if (typeof tooltip.onShow === 'function') {
        tooltip.onShow(instance);
        return;
      }
      onShow();
    },
  };

  if (link) {
    return (
      <LinkWithTooltip {...link} tooltip={props}>
        {children}
      </LinkWithTooltip>
    );
  }

  return (
    <SimpleTooltip {...props} key={userId}>
      {children}
    </SimpleTooltip>
  );
}
