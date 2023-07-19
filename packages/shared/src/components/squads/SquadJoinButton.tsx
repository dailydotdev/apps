import React, { ReactElement, useEffect } from 'react';
import classNames from 'classnames';
import { useMutation, useQueryClient } from 'react-query';
import { Squad } from '../../graphql/sources';
import { Button } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useLeaveSquad, useJoinSquad } from '../../hooks';
import { labels } from '../../lib';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, Origin, TargetType } from '../../lib/analytics';

type SquadJoinProps = {
  className?: string;
  squad: Squad;
  joinText?: string;
  leaveText?: string;
  origin: Origin;
};

export const SquadJoinButton = ({
  className,
  squad,
  joinText = 'Join squad',
  leaveText = 'Leave squad',
  origin,
}: SquadJoinProps): ReactElement => {
  const queryClient = useQueryClient();
  const { trackEvent } = useAnalyticsContext();
  const { displayToast } = useToastNotification();
  const { user, showLogin } = useAuthContext();
  const isCurrentMember = !!squad.currentMember;

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
  }, [origin, squad.id, squad.public]);

  const { mutateAsync: joinSquad, isLoading: isJoiningSquad } = useMutation(
    useJoinSquad({ squad }),
    {
      onError: () => {
        displayToast(labels.error.generic);
      },
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
    <Button
      className={classNames(
        isCurrentMember ? 'btn-secondary' : 'btn-primary',
        className,
      )}
      disabled={isLoading}
      onClick={() => {
        if (!isCurrentMember) {
          trackEvent({
            event_name: AnalyticsEvent.ClickJoinSquad,
            extra: JSON.stringify({
              squad: squad.id,
            }),
          });
        }

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
    >
      {isCurrentMember ? leaveText : joinText}
    </Button>
  );
};
