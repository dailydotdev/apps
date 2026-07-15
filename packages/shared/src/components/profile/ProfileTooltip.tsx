import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Author } from '../../graphql/comments';
import type { BaseTooltipProps, TooltipProps } from '../tooltips/BaseTooltip';
import type { LinkWithTooltipProps } from '../tooltips/LinkWithTooltip';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import type { MostReadTag, UserReadingRank } from '../../graphql/users';
import { getUserShortInfo } from '../../graphql/users';
import UserEntityCard from '../cards/entity/UserEntityCard';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { generateQueryKey, RequestKey } from '../../lib/query';
import type { UserShortProfile } from '../../lib/user';

type TippyInstance = Parameters<NonNullable<BaseTooltipProps['onShow']>>[0];

export interface ProfileTooltipProps extends ProfileTooltipContentProps {
  children: ReactElement;
  link?: Omit<LinkWithTooltipProps, 'children' | 'tooltip'>;
  tooltip?: TooltipProps;
  nativeLazyLoading?: boolean;
  scrollingContainer?: HTMLElement;
  onTooltipMouseEnter?: () => void;
  onTooltipMouseLeave?: () => void;
  eager?: boolean;
  initialUser?: UserShortProfile;
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
  onTooltipMouseEnter,
  onTooltipMouseLeave,
  eager = false,
  initialUser,
}: Omit<ProfileTooltipProps, 'user'>): ReactElement {
  const query = useQueryClient();
  const { logEvent } = useLogContext();
  const handler = useRef<() => void>();
  const hasInitialUser = initialUser?.id === userId;
  const [id, setId] = useState<string | undefined>(
    eager && !hasInitialUser ? userId : undefined,
  );
  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserShortById,
      id ? { id } : undefined,
    ),
    queryFn: () => {
      if (!id) {
        throw new Error('Profile tooltip user id is required');
      }

      return getUserShortInfo(id);
    },
    enabled: !hasInitialUser && !!id,
  });
  const tooltipUser = hasInitialUser ? initialUser : data;

  useEffect(() => {
    if (!eager) {
      return;
    }

    if (hasInitialUser) {
      setId(undefined);
      return;
    }

    setId(userId);
  }, [eager, hasInitialUser, userId]);

  const handleShow = () => {
    if (!scrollingContainer) {
      return;
    }

    if (handler.current) {
      scrollingContainer.removeEventListener('scroll', handler.current);
    }
    handler.current = () =>
      query.setQueryData(['readingRank', userId], () => {});
    scrollingContainer.addEventListener('scroll', handler.current);
  };

  const onHide = () => {
    if (!scrollingContainer) {
      return;
    }
    if (handler.current) {
      scrollingContainer.removeEventListener('scroll', handler.current);
    }
  };

  // This is a workaround to fix the issue of the tooltip getting cleared
  // when the user moves their mouse from a markdown @ to the tooltip
  const hoverPlugin = {
    fn: () => ({
      onShow(instance: TippyInstance) {
        if (onTooltipMouseEnter || onTooltipMouseLeave) {
          if (instance.popper) {
            if (onTooltipMouseEnter) {
              instance.popper.addEventListener(
                'mouseenter',
                onTooltipMouseEnter,
              );
            }
            if (onTooltipMouseLeave) {
              instance.popper.addEventListener(
                'mouseleave',
                onTooltipMouseLeave,
              );
            }
          }
        }
      },
      onHide(instance: TippyInstance) {
        if (onTooltipMouseEnter || onTooltipMouseLeave) {
          if (instance.popper) {
            if (onTooltipMouseEnter) {
              instance.popper.removeEventListener(
                'mouseenter',
                onTooltipMouseEnter,
              );
            }
            if (onTooltipMouseLeave) {
              instance.popper.removeEventListener(
                'mouseleave',
                onTooltipMouseLeave,
              );
            }
          }
        }
      },
    }),
  };

  const props: TooltipProps = {
    showArrow: false,
    interactive: true,
    onHide,
    appendTo: tooltip?.appendTo || globalThis?.document?.body,
    // Render the card with a fixed strategy so it escapes any
    // `overflow: clip/hidden` ancestor (e.g. the post modal card, which would
    // otherwise cut it off), and keep it inside the viewport on every screen
    // size — shifting/flipping rather than spilling past an edge.
    popperOptions: {
      strategy: 'fixed',
      modifiers: [
        {
          name: 'preventOverflow',
          options: { padding: 8, altAxis: true, rootBoundary: 'viewport' },
        },
        {
          name: 'flip',
          options: { padding: 8, fallbackPlacements: ['bottom', 'top'] },
        },
      ],
    },
    container: { bgClassName: '' },
    content:
      !isLoading && tooltipUser ? (
        <UserEntityCard user={tooltipUser} />
      ) : undefined,
    plugins:
      onTooltipMouseEnter || onTooltipMouseLeave ? [hoverPlugin] : undefined,
    trigger: 'mouseenter',
    ...tooltip,
    onShow: (instance) => {
      logEvent({
        event_name: LogEvent.HoverUserCard,
        target_id: userId,
      });
      if (!hasInitialUser && id !== userId) {
        setId(userId);
      }
      if (typeof tooltip.onShow === 'function') {
        tooltip.onShow(instance);
        return;
      }
      handleShow();
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
