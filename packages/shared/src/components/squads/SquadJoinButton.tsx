import React, { ReactElement, useEffect } from 'react';
import classNames from 'classnames';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  wrapper?: string;
  button?: string;
}

interface SquadJoinProps {
  className?: ClassName;
  squad: Squad;
  joinText?: string;
  leaveText?: string;
  blockedTooltipText?: string;
  origin: Origin;
  inviterMember?: Pick<UserShortProfile, 'id'>;
  onSuccess?: () => void;
}

export const SimpleSquadJoinButton = <T extends 'a' | 'button'>({
  className,
  squad,
  onClick,
  children,
  origin,
  inviterMember,
  ...buttonProps
}: SquadJoinProps & ButtonProps<T>): ReactElement => {
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

export const SquadJoinButton = ({
  className = {},
  squad,
  joinText = 'Join Squad',
  leaveText = 'Leave Squad',
  blockedTooltipText = 'You are not allowed to join the Squad',
  origin,
  onSuccess,
  ...rest
}: SquadJoinProps): ReactElement => {
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, showLogin } = useAuthContext();
  const isMemberBlocked =
    squad.currentMember?.role === SourceMemberRole.Blocked;
  const isCurrentMember = !!squad.currentMember && !isMemberBlocked;

  const { mutateAsync: joinSquad, isLoading: isJoiningSquad } = useMutation(
    useJoinSquad({ squad }),
    {
      onError: () => {
        displayToast(labels.error.generic);
      },
      onSuccess,
    },
  );

  const { mutateAsync: leaveSquad, isLoading: isLeavingSquad } = useMutation(
    useLeaveSquad({ squad }),
    {
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
        queryClient.invalidateQueries(['squadMembersInitial', squad.handle]);
      },
      onError: () => {
        displayToast(labels.error.generic);
      },
    },
  );

  const isLoading = isJoiningSquad || isLeavingSquad;

  const onLeaveSquad = () => {
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
      leaveSquad();
    } else {
      joinSquad();
    }
  };

  return (
    <SimpleTooltip
      sticky
      placement="bottom"
      disabled={!isMemberBlocked}
      content={blockedTooltipText}
    >
      <div className={className?.wrapper}>
        <SimpleSquadJoinButton
          {...rest}
          variant={
            isCurrentMember ? ButtonVariant.Secondary : ButtonVariant.Primary
          }
          className={className?.button}
          squad={squad}
          disabled={isMemberBlocked || isLoading}
          onClick={onLeaveSquad}
          origin={origin}
        >
          {isCurrentMember ? leaveText : joinText}
        </SimpleSquadJoinButton>
      </div>
    </SimpleTooltip>
  );
};
