import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ReasonSelectionModal } from './ReasonSelectionModal';
import type { ReportReason } from '../../../report';
import { ReportEntity, SEND_REPORT_MUTATION } from '../../../report';
import { Checkbox } from '../../fields/Checkbox';
import type { UserShortProfile } from '../../../lib/user';
import { gqlClient } from '../../../graphql/common';
import {
  CONTENT_PREFERENCE_BLOCK_MUTATION,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks';

const reportReasons: { value: string; label: string }[] = [
  { value: 'inappropriate', label: 'Inappropriate or NSFW Content' },
  { value: 'trolling', label: 'Trolling or Disruptive Behavior' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'impersonation', label: 'Impersonation or False Identity' },
  { value: 'spam', label: 'Spam or Unsolicited Advertising' },
  { value: 'misinformation', label: 'Misinformation or False Claims' },
  { value: 'hateSpeech', label: 'Hate Speech or Discrimination' },
  { value: 'privacy', label: 'Privacy or Copyright Violation' },
  { value: 'plagiarism', label: 'Plagiarism or Content Theft' },
  { value: 'other', label: 'Other' },
];

type ReportUserModalProps = {
  offendingUser: Pick<UserShortProfile, 'id' | 'username'>;
  defaultBlockUser?: boolean;
  onClose: () => void;
};

export const ReportUserModal = ({
  offendingUser,
  defaultBlockUser,
  onClose,
}: ReportUserModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const [blockUser, setBlockUser] = useState(defaultBlockUser);
  const { isPending: isBlockPending, mutateAsync: blockUserMutation } =
    useMutation({
      mutationFn: () =>
        gqlClient.request(CONTENT_PREFERENCE_BLOCK_MUTATION, {
          id: offendingUser.id,
          entity: ContentPreferenceType.User,
          feedId: user.id,
        }),
      onSuccess: () => {
        displayToast(`🚫 ${offendingUser.username} has been blocked`);
        onClose();
      },
      onError: () => {
        displayToast(`❌ Failed to block ${offendingUser.username}`);
      },
    });
  const { isPending: isReportPending, mutateAsync: reportUserMutation } =
    useMutation({
      mutationFn: ({ reason, text }: { reason: ReportReason; text: string }) =>
        gqlClient.request(SEND_REPORT_MUTATION, {
          id: offendingUser.id,
          type: ReportEntity.User,
          reason,
          comment: text,
        }),
      onSuccess: () => {
        if (!blockUser) {
          displayToast(`🗒️ ${offendingUser.username} has been reported`);
          onClose();
        }
      },
      onError: () => {
        displayToast(`❌ Failed to report ${offendingUser.username}`);
      },
    });

  const onReportUser = (
    e: React.MouseEvent,
    reason: ReportReason,
    text: string,
  ) => {
    e.preventDefault();
    reportUserMutation({ reason, text });
    if (defaultBlockUser) {
      blockUserMutation();
    }
  };

  const isPending = isBlockPending || isReportPending;
  const checkboxDisabled = defaultBlockUser || isPending;
  return (
    <ReasonSelectionModal
      isOpen
      onReport={onReportUser}
      disabled={isPending}
      reasons={reportReasons}
      onRequestClose={onClose}
      heading="Select reason for reporting"
      footer={
        <Checkbox
          name="blockUser"
          className="font-normal"
          disabled={checkboxDisabled}
          onChange={(e) => setBlockUser(e.target.checked)}
          checked={blockUser}
        >
          Block {offendingUser.username}
        </Checkbox>
      }
    />
  );
};

export default ReportUserModal;
