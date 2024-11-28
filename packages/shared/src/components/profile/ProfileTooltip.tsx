import React, { ReactElement, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Author } from '../../graphql/comments';
import { TooltipProps } from '../tooltips/BaseTooltip';
import {
  LinkWithTooltip,
  LinkWithTooltipProps,
} from '../tooltips/LinkWithTooltip';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { DevCard, DevCardType } from './devcard';
import { useDevCard } from '../../hooks/profile/useDevCard';
import { MostReadTag, UserReadingRank } from '../../graphql/users';

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
  const [id, setId] = useState('');
  const data = useDevCard(id);

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
    content: data ? <DevCard data={data} type={DevCardType.Compact} /> : null,
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
