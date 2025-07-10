import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
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
      onClick={(event) => {
        if (!squad.currentMember) {
          logEvent({
            event_name: LogEvent.ClickJoinSquad,
            extra: JSON.stringify({
              inviter: inviterMember?.id,
              squad: squad.id,
            }),
          });
        }

        onClick(event);
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
    entityId: squad.id,
    entityType: ContentPreferenceType.Source,
  });
  const {
    join = 'Join Squad',
    leave = 'Leave Squad',
    blockedTooltip = 'You are not allowed to join the Squad',
  } = copy;
  const [joinVariant, memberVariant] = buttonVariants;
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, showLogin } = useAuthContext();
  const isMemberBlocked =
    squad.currentMember?.role === SourceMemberRole.Blocked;
  const isCurrentMember = !!squad.currentMember && !isMemberBlocked;

  const fuzzyQueryKey = generateQueryKey(
    RequestKey.Sources,
    null,
    undefined,
    true,
    squad.category?.id,
  );
  const fuzzyQueryMatch = queryClient.getQueriesData({
    queryKey: fuzzyQueryKey,
  });
  const fuzzyFeaturedQueryMatch = queryClient.getQueriesData({
    queryKey: generateQueryKey(RequestKey.Sources, null, true, true),
  });
  const categoryQueryKey = fuzzyQueryMatch?.[0]?.[0];
  const featuredQueryKey = fuzzyFeaturedQueryMatch?.[0]?.[0];

  const joinSquadMutation = (data) => ({
    ...data,
    pages: data?.pages?.map((edge) => ({
      ...edge,
      sources: {
        ...edge.sources,
        edges: edge.sources.edges.map((subEdge) => {
          const { node } = subEdge;
          return {
            ...subEdge,
            node: {
              ...subEdge.node,
              ...(node.id === squad.id && { currentMember: user }),
            },
          };
        }),
      },
    })),
  });

  const { mutateAsync: joinSquad, isPending: isJoiningSquad } = useMutation({
    mutationFn: useJoinSquad({ squad }),
    onError: () => {
      displayToast(labels.error.generic);
    },
    onMutate: () => {
      const currentCategoryData = queryClient.getQueryData(categoryQueryKey);
      if (currentCategoryData) {
        queryClient.setQueryData(
          categoryQueryKey,
          joinSquadMutation(currentCategoryData),
        );
      }

      const currentFeaturedData = queryClient.getQueryData(featuredQueryKey);
      if (currentFeaturedData) {
        queryClient.setQueryData(
          featuredQueryKey,
          joinSquadMutation(currentFeaturedData),
        );
      }
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
