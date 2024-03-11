import React, { ReactElement, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Author } from '../../graphql/comments';
import { TooltipProps } from '../tooltips/BaseTooltip';
import {
  LinkWithTooltip,
  LinkWithTooltipProps,
} from '../tooltips/LinkWithTooltip';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { ProfileTooltipContentProps } from './ProfileTooltipContent';
import { DevCard, DevCardType } from './devcard';

export interface ProfileTooltipProps extends ProfileTooltipContentProps {
  children: ReactElement;
  link?: Omit<LinkWithTooltipProps, 'children' | 'tooltip'>;
  tooltip?: TooltipProps;
  nativeLazyLoading?: boolean;
  scrollingContainer?: HTMLElement;
}

export const profileTooltipClasses = {
  padding: 'p-6',
  roundness: 'rounded-16',
  classNames: 'w-72 shadow-2 border border-theme-divider-secondary',
  background: 'bg-background-default',
};

export function ProfileTooltip({
  children,
  user,
  link,
  scrollingContainer,
  tooltip = {},
}: Omit<ProfileTooltipProps, 'user'> & {
  user?: Partial<Author>;
}): ReactElement {
  const query = useQueryClient();
  const handler = useRef<() => void>();

  const onShow = () => {
    if (!scrollingContainer) {
      return;
    }

    scrollingContainer.removeEventListener('scroll', handler.current);
    handler.current = () => query.setQueryData(['readingRank', user.id], {});
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
    onShow,
    onHide,
    container: { bgClassName: null },
    content: user ? (
      <DevCard userId={user?.id} type={DevCardType.Compact} />
    ) : null,
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
