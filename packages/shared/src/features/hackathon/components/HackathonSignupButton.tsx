import type { ReactElement } from 'react';
import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { VIcon } from '../../../components/icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { AuthTriggers } from '../../../lib/auth';
import { LogEvent, TargetId } from '../../../lib/log';
import { gqlClient } from '../../../graphql/common';
import { JOIN_HACKATHON_MUTATION } from '../../../graphql/users';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { hackathonParticipationQueryOptions } from '../queries';

type HackathonSignupButtonProps = {
  size?: ButtonSize;
  className?: string;
};

export const HackathonSignupButton = ({
  size = ButtonSize.Large,
  className,
}: HackathonSignupButtonProps): ReactElement => {
  const { user, isLoggedIn, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const participationOptions = hackathonParticipationQueryOptions(user);
  const { data, isFetched } = useQuery(participationOptions);
  const [getParticipation, setParticipation] =
    useUpdateQuery(participationOptions);
  const isParticipant = !!data?.whoami?.isHackathonParticipant;

  const { mutateAsync: join, isPending: isJoining } = useMutation({
    mutationFn: () => gqlClient.request(JOIN_HACKATHON_MUTATION),
    onMutate: () => {
      const previous = getParticipation();
      if (previous) {
        setParticipation({
          whoami: { ...previous.whoami, isHackathonParticipant: true },
        });
      }
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        setParticipation(context.previous);
      }
    },
  });

  if (isLoggedIn && isParticipant) {
    return (
      <Button
        variant={ButtonVariant.Secondary}
        size={size}
        className={className}
        icon={<VIcon />}
        disabled
      >
        You&apos;re signed up
      </Button>
    );
  }

  const handleClick = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.HackathonPage,
      extra: JSON.stringify({ action: isLoggedIn ? 'join' : 'login' }),
    });

    if (!isLoggedIn) {
      showLogin({ trigger: AuthTriggers.Hackathon });
      return;
    }

    await join();
  };

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={size}
      className={className}
      onClick={handleClick}
      loading={isJoining || (isLoggedIn && !isFetched)}
    >
      Sign me up
    </Button>
  );
};
