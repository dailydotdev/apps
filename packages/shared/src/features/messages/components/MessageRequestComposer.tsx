import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { FlexCol, FlexRow } from '../../../components/utilities';
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
import type { ApiErrorResult } from '../../../graphql/common';
import { LogEvent } from '../../../lib/log';
import { composerFrame } from '../../interests/components/AgentComposer';
import { DirectMessageAccess, sendDirectMessageRequest } from '../graphql';
import { dmConversationQueryOptions, dmPeerQueryOptions } from '../queries';
import type { DmPeer } from '../types';
import { DM_REQUEST_MAX_LENGTH } from '../types';

const genericError = "Couldn't send your request. Please try again.";

// Users who don't follow each other start with one short note the peer
// accepts or declines; the chat opens once they accept.
export const MessageRequestComposer = ({
  peer,
}: {
  peer: DmPeer;
}): ReactElement => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const [value, setValue] = useState('');
  const message = value.trim();

  const { mutate, isPending } = useMutation({
    mutationFn: sendDirectMessageRequest,
    onSuccess: (_, { message: note }) => {
      logEvent({
        event_name: LogEvent.SendDirectMessageRequest,
        target_id: peer.id,
      });
      // Set locally rather than refetched: the API drops vordr'd requests
      // without telling, and a refetch would show this composer again.
      queryClient.setQueryData(dmPeerQueryOptions(user, peer.id).queryKey, {
        ...peer,
        access: DirectMessageAccess.Pending,
      });
      queryClient.setQueryData(
        dmConversationQueryOptions(user, peer.id).queryKey,
        {
          id: `request-${peer.id}`,
          jid: null,
          peerJid: null,
          requestMessage: note,
          createdByViewer: true,
          isRequest: true,
          createdAt: new Date().toISOString(),
          peer,
        },
      );
    },
    onError: (error: ApiErrorResult) =>
      displayToast(error?.response?.errors?.[0]?.message ?? genericError),
  });

  return (
    <div className="shrink-0 px-4 pb-4 tablet:px-6">
      <FlexCol className={composerFrame}>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          You and @{peer.username} don&apos;t follow each other, so send a short
          message request first. You can chat once they accept.
        </Typography>
        <textarea
          id="dm-request-composer"
          name="dm-request-composer"
          rows={3}
          aria-label={`Message request to @${peer.username}`}
          placeholder="Introduce yourself and say why you're reaching out"
          maxLength={DM_REQUEST_MAX_LENGTH}
          value={value}
          className="block w-full min-w-0 resize-none bg-transparent py-1.5 text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
          onChange={(event) => setValue(event.target.value)}
        />
        <FlexRow className="justify-end">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            disabled={!message}
            loading={isPending}
            onClick={() => mutate({ userId: peer.id, message })}
          >
            Send request
          </Button>
        </FlexRow>
      </FlexCol>
    </div>
  );
};
