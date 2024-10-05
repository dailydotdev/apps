import React, { ReactElement } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant } from '../../buttons/common';
import { BlockIcon, VIcon } from '../../icons';
import { useSquadPostModeration } from '../../../hooks/squads/useSquadPostModeration';
import { PostModerationReason } from '../../../graphql/squads';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';

const rejectReasons: { value: PostModerationReason; label: string }[] = [
  {
    value: PostModerationReason.OffTopic,
    label: 'Off-topic post unrelated to the squad’s purpose',
  },
  {
    value: PostModerationReason.Violation,
    label: 'Violates the squad’s code of conduct',
  },
  {
    value: PostModerationReason.Promotional,
    label: 'Too promotional without adding value to the discussion',
  },
  {
    value: PostModerationReason.Duplicate,
    label: 'Duplicate or similar content already posted',
  },
  { value: PostModerationReason.LowQuality, label: 'Lacks quality or clarity' },
  {
    value: PostModerationReason.NSFW,
    label: 'Contains inappropriate, NSFW or offensive content',
  },
  { value: PostModerationReason.Spam, label: 'Post is spam or scam' },
  {
    value: PostModerationReason.Misinformation,
    label: 'Contains misleading or false information',
  },
  {
    value: PostModerationReason.Copyright,
    label: 'Copyright or privacy violation',
  },
  { value: PostModerationReason.Other, label: 'Other' },
];

interface SquadModerationActionsProps {
  postId: string;
}

export function SquadModerationActions({
  postId,
}: SquadModerationActionsProps): ReactElement {
  const { openModal } = useLazyModal();
  const { onApprove, onReject, isLoading, isSuccess } =
    useSquadPostModeration();

  const onRejectPost = () => {
    openModal({
      type: LazyModal.Report,
      props: {
        onReport: (_, reason, note) => onReject({ postId, reason, note }),
        reasons: rejectReasons,
        heading: 'Select a reason for declining',
      },
    });
  };

  return (
    <div className="flex w-full flex-row gap-4">
      <Button
        className="flex-1"
        disabled={isLoading || isSuccess}
        variant={ButtonVariant.Float}
        icon={<BlockIcon />}
        onClick={onRejectPost}
      >
        Decline
      </Button>
      <Button
        className="flex-1"
        disabled={isLoading || isSuccess}
        variant={ButtonVariant.Primary}
        icon={<VIcon />}
        onClick={() => onApprove({ postId })}
      >
        Approve
      </Button>
    </div>
  );
}
