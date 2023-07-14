import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import { useMutation, useQueryClient } from 'react-query';
import { Squad } from '../../graphql/sources';
import { Button } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useLeaveSquad, useJoinSquad } from '../../hooks';

type SquadJoinProps = {
  squad: Squad;
};

export const SquadJoinButton = ({ squad }: SquadJoinProps): ReactElement => {
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { squads } = useAuthContext();
  const isCurrentMember = useMemo(
    () => squads?.some(({ id }) => id === squad.id) || false,
    [squad, squads],
  );

  const { mutateAsync: joinSquad, isLoading: isJoiningSquad } = useMutation(
    useJoinSquad({ squad }),
    {
      onError: () => {
        displayToast('🚫 Something went wrong, please try again.');
      },
    },
  );

  const { mutateAsync: leaveSquad, isLoading: isLeavingSquad } = useMutation(
    useLeaveSquad({ squad }),
    {
      onSuccess: () => {
        displayToast('👋 You have left the squad.');

        queryClient.invalidateQueries(['squad', squad.handle]);
      },
      onError: () => {
        displayToast('🚫 Something went wrong, please try again.');
      },
    },
  );

  const isLoading = isJoiningSquad || isLeavingSquad;

  return (
    <Button
      className={classNames(isCurrentMember ? 'btn-secondary' : 'btn-primary')}
      disabled={isLoading}
      onClick={() => {
        if (isCurrentMember) {
          leaveSquad();
        } else {
          joinSquad();
        }
      }}
    >
      {isCurrentMember ? 'Leave squad' : 'Join squad'}
    </Button>
  );
};
