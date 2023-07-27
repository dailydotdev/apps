import React, { ReactElement, useEffect } from 'react';
import classNames from 'classnames';
import { useMutation, useQueryClient } from 'react-query';
import { SourceMemberRole, Squad } from '../../graphql/sources';
import { Button, ButtonProps } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useLeaveSquad, useJoinSquad } from '../../hooks';
import { labels } from '../../lib';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, Origin, TargetType } from '../../lib/analytics';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { UserShortProfile } from '../../lib/user';

type SquadJoinProps = {
  className?: string;
  squad: Squad;
  joinText?: string;
  leaveText?: string;
  blockedTooltipText?: string;
  origin: Origin;
  inviterMember?: Pick<UserShortProfile, 'id'>;
  onSuccess?: () => void;
};

export const SimpleSquadJoinButton = <T extends 'a' | 'button'>({
  className,
  squad,
  onClick,
  children,
  origin,
  inviterMember,
  ...buttonProps
}: SquadJoinProps & ButtonProps<T>): ReactElement => {
  const { trackEvent } = useAnalyticsContext();

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
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
          trackEvent({
            event_name: AnalyticsEvent.ClickJoinSquad,
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
  className,
  squad,
  joinText = 'Join squad',
  leaveText = 'Leave squad',
  blockedTooltipText = 'You are not allowed to join the squad',
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
      onSuccess: () => {
        displayToast('👋 You have left the squad.');

        queryClient.invalidateQueries(['squad', squad.handle]);
        queryClient.invalidateQueries(['squadMembersInitial', squad.handle]);
      },
      onError: () => {
        displayToast(labels.error.generic);
      },
    },
  );

  const isLoading = isJoiningSquad || isLeavingSquad;

  return (
    <SimpleTooltip
      sticky
      placement="bottom"
      disabled={!isMemberBlocked}
      content={blockedTooltipText}
    >
      <div className="flex flex-1">
        <SimpleSquadJoinButton
          {...rest}
          className={classNames(
            isCurrentMember ? 'btn-secondary' : 'btn-primary',
            className,
          )}
          squad={squad}
          disabled={isMemberBlocked || isLoading}
          onClick={() => {
            if (!user) {
              const onJoinSquad = () => joinSquad();

              showLogin('join squad', {
                onLoginSuccess: onJoinSquad,
                onRegistrationSuccess: onJoinSquad,
              });

              return;
            }

            if (isCurrentMember) {
              leaveSquad();
            } else {
              joinSquad();
            }
          }}
          origin={origin}
        >
          {isCurrentMember ? leaveText : joinText}
        </SimpleSquadJoinButton>
      </div>
    </SimpleTooltip>
  );
};
