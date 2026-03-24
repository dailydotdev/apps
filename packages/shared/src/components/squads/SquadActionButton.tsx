import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../graphql/sources';
import { SourceMemberRole } from '../../graphql/sources';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonVariant } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useJoinSquad, useLeaveSquad } from '../../hooks';
import { labels } from '../../lib';
import { useLogContext } from '../../contexts/LogContext';
import type { Origin } from '../../lib/log';
import { LogEvent, TargetType } from '../../lib/log';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import type { UserShortProfile } from '../../lib/user';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { AuthTriggers } from '../../lib/auth';
import useShowFollowAction from '../../hooks/useShowFollowAction';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import type { SourcesQueryData } from '../../hooks/source/useSources';

interface ClassName {
  button?: string;
}

interface Copy {
  join: string;
  leave: string;
  view: string;
  blockedTooltip: string;
}

interface SquadActionButtonProps extends Pick<ButtonProps<'button'>, 'size'> {
  className?: ClassName;
  squad: Squad;
  copy?: Partial<Copy>;
  origin: Origin;
  inviterMember?: Pick<UserShortProfile, 'id'>;
  onSuccess?: () => void;
  buttonVariants?: ButtonVariant[];
  alwaysShow?: boolean;
}

type SquadDirectoryData = InfiniteData<SourcesQueryData<Squad>>;

export const updateSquadMembershipInListData = (
  data: SquadDirectoryData,
  squadId: string,
  updateSquad: (currentSquad: Squad) => Squad,
): SquadDirectoryData => ({
  ...data,
  pages: data.pages.map((page) => ({
    ...page,
    sources: {
      ...page.sources,
      edges: page.sources.edges.map((edge) => {
        if (edge.node.id !== squadId) {
          return edge;
        }

        return {
          ...edge,
          node: updateSquad(edge.node),
        };
      }),
    },
  })),
});

export const SimpleSquadJoinButton = <T extends 'a' | 'button'>({
  className,
  squad,
  onClick,
  children,
  origin,
  inviterMember,
  ...buttonProps
}: SquadActionButtonProps & ButtonProps<T>): ReactElement => {
  const { logEvent } = useLogContext();

  useEffect(() => {
    if (!squad) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.SquadJoinButton,
      extra: JSON.stringify({
        squad: squad.id,
        origin,
        squad_type: squad.public ? 'public' : 'private',
      }),
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      {...buttonProps}
      className={classNames(className)}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        if (!squad.currentMember) {
          logEvent({
            event_name: LogEvent.ClickJoinSquad,
            extra: JSON.stringify({
              inviter: inviterMember?.id,
              squad: squad.id,
            }),
          });
        }

        (onClick as React.MouseEventHandler<HTMLElement>)?.(event);
      }}
    >
      {children}
    </Button>
  );
};

export const SquadActionButton = ({
  className = {},
  squad,
  copy = {},
  origin,
  onSuccess,
  buttonVariants = [ButtonVariant.Primary, ButtonVariant.Secondary],
  alwaysShow = false,
  ...rest
}: SquadActionButtonProps): ReactElement => {
  const { showActionBtn } = useShowFollowAction({
    entityId: squad?.id,
    entityType: ContentPreferenceType.Source,
  });
  const {
    join = 'Join Squad',
    leave = 'Leave',
    blockedTooltip = 'You are not allowed to join the Squad',
  } = copy;
  const [joinVariant, memberVariant] = buttonVariants;
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, showLogin } = useAuthContext();
  const isMemberBlocked =
    squad?.currentMember?.role === SourceMemberRole.Blocked;
  const isCurrentMember = !!squad?.currentMember && !isMemberBlocked;

  const fuzzyQueryKey = generateQueryKey(
    RequestKey.Sources,
    null,
    undefined,
    true,
    squad?.category?.id,
  );
  const fuzzyQueryMatch = queryClient.getQueriesData({
    queryKey: fuzzyQueryKey,
  });
  const fuzzyFeaturedQueryMatch = queryClient.getQueriesData({
    queryKey: generateQueryKey(RequestKey.Sources, null, true, true),
  });
  const categoryQueryKey = fuzzyQueryMatch?.[0]?.[0];
  const featuredQueryKey = fuzzyFeaturedQueryMatch?.[0]?.[0];

  const updateDirectorySquadCache = (
    queryKey: readonly unknown[] | undefined,
    updateSquad: (currentSquad: Squad) => Squad,
  ) => {
    if (!queryKey) {
      return;
    }

    const currentData = queryClient.getQueryData<SquadDirectoryData>(queryKey);
    if (!currentData) {
      return;
    }

    queryClient.setQueryData(
      queryKey,
      updateSquadMembershipInListData(currentData, squad.id, updateSquad),
    );
  };

  const { mutateAsync: joinSquad, isPending: isJoiningSquad } = useMutation({
    mutationFn: useJoinSquad({ squad }),
    onError: () => {
      displayToast(labels.error.generic);
    },
    onMutate: () => {
      updateDirectorySquadCache(categoryQueryKey, (currentSquad) => ({
        ...currentSquad,
        currentMember:
          currentSquad.currentMember ?? (user as Squad['currentMember']),
        membersCount: currentSquad.currentMember
          ? currentSquad.membersCount
          : currentSquad.membersCount + 1,
      }));
      updateDirectorySquadCache(featuredQueryKey, (currentSquad) => ({
        ...currentSquad,
        currentMember:
          currentSquad.currentMember ?? (user as Squad['currentMember']),
        membersCount: currentSquad.currentMember
          ? currentSquad.membersCount
          : currentSquad.membersCount + 1,
      }));
    },
    onSuccess,
  });

  const { mutateAsync: leaveSquad, isPending: isLeavingSquad } = useMutation({
    mutationFn: useLeaveSquad({ squad }),
    onSuccess: (left) => {
      if (!left) {
        return;
      }

      displayToast('👋 You have left the Squad.');

      const queryKey = generateQueryKey(RequestKey.Squad, user, squad.handle);
      const currenSquad = queryClient.getQueryData<Squad>(queryKey);

      if (currenSquad) {
        queryClient.setQueryData(queryKey, {
          ...currenSquad,
          currentMember: null,
          membersCount: currenSquad.membersCount - 1,
        });
      }
      updateDirectorySquadCache(categoryQueryKey, (currentSquad) => ({
        ...currentSquad,
        currentMember: null,
        membersCount: currentSquad.currentMember
          ? currentSquad.membersCount - 1
          : currentSquad.membersCount,
      }));
      updateDirectorySquadCache(featuredQueryKey, (currentSquad) => ({
        ...currentSquad,
        currentMember: null,
        membersCount: currentSquad.currentMember
          ? currentSquad.membersCount - 1
          : currentSquad.membersCount,
      }));
      queryClient.invalidateQueries({
        queryKey: ['squadMembersInitial', squad.handle],
      });
    },
    onError: () => {
      displayToast(labels.error.generic);
    },
  });

  const isLoading = isJoiningSquad || isLeavingSquad;

  const onLeaveSquad = (e: MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showLogin({
        trigger: AuthTriggers.JoinSquad,
        options: {
          onLoginSuccess: () => joinSquad(),
          onRegistrationSuccess: () => joinSquad(),
        },
      });

      return;
    }

    if (isCurrentMember) {
      leaveSquad({});
    } else {
      joinSquad();
    }
  };

  if (!showActionBtn && !alwaysShow) {
    return null;
  }

  return (
    <SimpleTooltip
      sticky
      placement="bottom"
      disabled={!isMemberBlocked}
      content={blockedTooltip}
    >
      <SimpleSquadJoinButton
        {...rest}
        variant={isCurrentMember ? memberVariant : joinVariant}
        className={className?.button}
        squad={squad}
        disabled={isMemberBlocked || isLoading}
        onClick={onLeaveSquad}
        origin={origin}
      >
        {isCurrentMember ? leave : join}
      </SimpleSquadJoinButton>
    </SimpleTooltip>
  );
};
