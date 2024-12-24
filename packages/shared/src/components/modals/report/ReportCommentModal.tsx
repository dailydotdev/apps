import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { ReasonSelectionModal } from './ReasonSelectionModal';
import useReportComment from '../../../hooks/useReportComment';
import type { Comment } from '../../../graphql/comments';
import { useLogContext } from '../../../contexts/LogContext';
import { postLogEvent } from '../../../lib/feed';
import type { Post } from '../../../graphql/posts';
import type { PostBootData } from '../../../lib/boot';
import { LogEvent } from '../../../lib/log';
import { ReportReason } from '../../../report';

interface Props extends ModalProps {
  onReport: (comment: Comment) => void;
  comment: Comment;
  post: Post | PostBootData;
}

const reportReasons: { value: ReportReason; label: string }[] = [
  { value: ReportReason.Hateful, label: 'Hateful or offensive content' },
  { value: ReportReason.Harassment, label: 'Harassment or bullying' },
  { value: ReportReason.Spam, label: 'Spam or scams' },
  { value: ReportReason.Nsfw, label: 'Explicit sexual content' },
  {
    value: ReportReason.Misinformation,
    label: 'False information or misinformation',
  },
  { value: ReportReason.Other, label: 'Other' },
];

export function ReportCommentModal({
  onReport,
  comment,
  post,
  ...props
}: Props): ReactElement {
  const { reportComment } = useReportComment();
  const { logEvent } = useLogContext();

  const onReportComment = async (
    event: React.MouseEvent<HTMLButtonElement>,
    reason: ReportReason,
    note: string,
  ): Promise<void> => {
    const { successful } = await reportComment({
      commentId: comment.id,
      reason,
      note,
    });
    if (!successful) {
      return;
    }

    logEvent(
      postLogEvent(LogEvent.ReportComment, post, {
        extra: { commentId: comment.id },
      }),
    );

    if (typeof onReport === 'function') {
      onReport(comment);
    }

    props.onRequestClose(event);
  };

  return (
    <ReasonSelectionModal
      {...props}
      isOpen
      onReport={onReportComment}
      reasons={reportReasons}
      heading="Report comment"
    />
  );
}

export default ReportCommentModal;
