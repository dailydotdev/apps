import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { FlagIcon } from '../../../components/icons';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { LogEvent } from '../../../lib/log';
import {
  acceptDirectMessageRequest,
  declineDirectMessageRequest,
} from '../graphql';
import { invalidateDmRequestQueries } from '../queries';
import type { DmPeer } from '../types';
import { getMessagesUrl } from '../urls';

const genericError = "Couldn't answer the request. Please try again.";

export const MessageRequestResponse = ({
  peer,
}: {
  peer: DmPeer;
}): ReactElement => {
  const { user } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();

  // `blocked` declines on behalf of a report that also blocked the sender, so
  // the modal's own toast is the only feedback.
  const { mutate, isPending, variables } = useMutation({
    mutationFn: async ({ accept }: { accept: boolean; blocked?: boolean }) => {
      if (accept) {
        await acceptDirectMessageRequest(peer.id);
      } else {
        await declineDirectMessageRequest(peer.id);
      }
    },
    onSuccess: (_, { accept, blocked }) => {
      logEvent({
        event_name: accept
          ? LogEvent.AcceptDirectMessageRequest
          : LogEvent.DeclineDirectMessageRequest,
        target_id: peer.id,
      });
      invalidateDmRequestQueries(queryClient, user, peer.id, {
        isAccepted: accept,
      });

      if (accept) {
        router.replace(getMessagesUrl(peer.id));
        return;
      }

      if (!blocked) {
        displayToast('Message request declined');
      }
      router.replace(getMessagesUrl(undefined, { requests: true }));
    },
    onError: () => displayToast(genericError),
  });

  const onReport = () =>
    openModal({
      type: LazyModal.ReportUser,
      props: {
        offendingUser: { id: peer.id, username: peer.username },
        onBlockUser: () => mutate({ accept: false, blocked: true }),
      },
    });

  return (
    <div className="mx-4 mb-4 flex shrink-0 flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary px-4 py-4 text-center tablet:mx-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        @{peer.username} wants to message you. They won&apos;t know you saw this
        unless you accept.
      </Typography>
      <FlexRow className="gap-2">
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<FlagIcon />}
          disabled={isPending}
          onClick={onReport}
        >
          Report
        </Button>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          disabled={isPending}
          loading={isPending && variables?.accept === false}
          onClick={() => mutate({ accept: false })}
        >
          Decline
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          disabled={isPending}
          loading={isPending && variables?.accept === true}
          onClick={() => mutate({ accept: true })}
        >
          Accept
        </Button>
      </FlexRow>
    </div>
  );
};
