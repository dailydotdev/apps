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
import { UserTooltipContentData } from '../../hooks/useProfileTooltip';
import { useDevCard } from '../../hooks/profile/useDevCard';

export interface ProfileTooltipProps extends ProfileTooltipContentProps {
  children: ReactElement;
  link?: Omit<LinkWithTooltipProps, 'children' | 'tooltip'>;
  tooltip?: TooltipProps;
  nativeLazyLoading?: boolean;
  scrollingContainer?: HTMLElement;
}

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
    onShow,
    onTrigger: () => {
      console.log('onTrigger');
      setId(userId);
    },
    appendTo: tooltip?.appendTo || globalThis?.document?.body,
    container: { bgClassName: null },
    content: data ? <DevCard data={data} type={DevCardType.Compact} /> : null,
    ...tooltip,
  };

  if (link) {
    return (
      <LinkWithTooltip {...link} tooltip={props}>
        {children}
      </LinkWithTooltip>
    );
  }

  return <SimpleTooltip {...props}>{children}</SimpleTooltip>;
}
