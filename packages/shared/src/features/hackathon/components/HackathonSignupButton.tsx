import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { AddUserIcon, VIcon } from '../../../components/icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { AuthTriggers } from '../../../lib/auth';
import { LogEvent, TargetId } from '../../../lib/log';
import { gqlClient } from '../../../graphql/common';
import { JOIN_HACKATHON_MUTATION } from '../../../graphql/users';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { getPathnameWithQuery } from '../../../lib/links';
import { SimpleTooltip } from '../../../components/tooltips';
import { hackathonParticipationQueryOptions } from '../queries';
import { isTesting } from '../../../lib/constants';

type HackathonSignupButtonProps = {
  size?: ButtonSize;
  className?: string;
};

const AUTOJOIN_PARAM = 'autojoin';

export const HackathonSignupButton = ({
  size = ButtonSize.Large,
  className,
}: HackathonSignupButtonProps): ReactElement => {
  const router = useRouter();
  const { user, isLoggedIn, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const participationOptions = hackathonParticipationQueryOptions(user);
  const { data, isPending } = useQuery(participationOptions);
  const [getParticipation, setParticipation] =
    useUpdateQuery(participationOptions);
  const isParticipant = !!data?.whoami?.isHackathonParticipant;
  const autojoinRequested = router.query[AUTOJOIN_PARAM] === '1';

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

  useEffect(() => {
    if (
      !autojoinRequested ||
      !isLoggedIn ||
      isPending ||
      isParticipant ||
      isJoining
    ) {
      return;
    }
    join();
  }, [
    autojoinRequested,
    isLoggedIn,
    isPending,
    isParticipant,
    isJoining,
    join,
  ]);

  useEffect(() => {
    if (!autojoinRequested || !isParticipant) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.delete(AUTOJOIN_PARAM);
    router.replace(getPathnameWithQuery(router.pathname, params), undefined, {
      shallow: true,
    });
  }, [autojoinRequested, isParticipant, router]);

  if (isLoggedIn && isParticipant) {
    return (
      <SimpleTooltip
        content="We will let you know before hackathon starts"
        forceLoad={!isTesting}
        placement="bottom"
      >
        <div>
          <Button
            variant={ButtonVariant.Secondary}
            size={size}
            className={className}
            icon={<VIcon />}
            disabled
          >
            You&apos;re signed up
          </Button>
        </div>
      </SimpleTooltip>
    );
  }

  const handleClick = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.HackathonPage,
      extra: JSON.stringify({ action: isLoggedIn ? 'join' : 'login' }),
    });

    if (!isLoggedIn) {
      const params = new URLSearchParams(window.location.search);
      params.set(AUTOJOIN_PARAM, '1');
      showLogin({
        trigger: AuthTriggers.Hackathon,
        options: {
          afterAuth: getPathnameWithQuery(window.location.pathname, params),
        },
      });
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
      loading={isJoining || (isLoggedIn && isPending)}
      icon={<AddUserIcon />}
      iconPosition={ButtonIconPosition.Left}
    >
      Sign me up
    </Button>
  );
};
