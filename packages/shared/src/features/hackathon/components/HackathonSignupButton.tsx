import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { AddUserIcon, LinkIcon, VIcon } from '../../../components/icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { JOIN_HACKATHON_MUTATION } from '../../../graphql/users';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useCopyLink } from '../../../hooks/useCopy';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { getPathnameWithQuery } from '../../../lib/links';
import { SimpleTooltip } from '../../../components/tooltips';
import { hackathonParticipationQueryOptions } from '../queries';
import { isTesting } from '../../../lib/constants';
import { ButtonV2 } from '../../../components/buttons';

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
  const { user, isLoggedIn } = useAuthContext();
  const { displayToast } = useToastNotification();
  const [, copyLink] = useCopyLink();
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
    onSuccess: () => {
      displayToast(
        "Know someone else who'd want to compete? Share this page with them.",
        {
          action: {
            copy: 'Copy link',
            onClick: () =>
              copyLink({ link: window.location.href, disableToast: true }),
          },
        },
      );
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
      <div className="flex gap-3">
        <SimpleTooltip
          content="We will let you know before hackathon starts"
          forceLoad={!isTesting}
          placement="bottom"
        >
          <div>
            <ButtonV2
              variant={ButtonVariant.Secondary}
              size={size}
              className={className}
              icon={<VIcon />}
              disabled
            >
              You&apos;re signed up
            </ButtonV2>
          </div>
        </SimpleTooltip>
        <SimpleTooltip
          content="Copy share link"
          forceLoad={!isTesting}
          placement="bottom"
        >
          <ButtonV2
            variant={ButtonVariant.Subtle}
            size={size}
            icon={<LinkIcon className="text-text-tertiary" />}
            aria-label="Copy share link"
            onClick={() => copyLink({ link: window.location.href })}
          />
        </SimpleTooltip>
      </div>
    );
  }

  return (
    <ButtonV2
      variant={ButtonVariant.Secondary}
      size={size}
      className={className}
      icon={<AddUserIcon />}
      iconPosition={ButtonIconPosition.Left}
      disabled
    >
      Signups closed
    </ButtonV2>
  );
};
