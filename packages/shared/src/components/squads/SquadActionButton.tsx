import React, { ReactElement, useEffect, MouseEvent } from 'react';
import classNames from 'classnames';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { SourceMemberRole, Squad } from '../../graphql/sources';
import { Button, ButtonProps, ButtonVariant } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useJoinSquad, useLeaveSquad } from '../../hooks';
import { labels } from '../../lib';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { UserShortProfile } from '../../lib/user';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { AuthTriggers } from '../../lib/auth';

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
  showViewSquadIfMember?: boolean;
  buttonVariants?: ButtonVariant[];
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
  showViewSquadIfMember,
  buttonVariants = [ButtonVariant.Primary, ButtonVariant.Secondary],
  ...rest
}: SquadActionButtonProps): ReactElement => {
  const {
    join = 'Join Squad',
    view = 'View Squad',
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

  const { mutateAsync: joinSquad, isPending: isJoiningSquad } = useMutation({
    mutationFn: useJoinSquad({ squad }),

    onError: () => {
      displayToast(labels.error.generic);
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

  if (isCurrentMember && showViewSquadIfMember) {
    return (
      <Link href={squad.permalink}>
        <Button
          {...rest}
          className={className?.button}
          tag="a"
          href={squad.permalink}
          variant={memberVariant}
        >
          {view}
        </Button>
      </Link>
    );
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
