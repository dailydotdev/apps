import React, { ReactElement } from 'react';
import { ModalProps } from '../common/Modal';
import { ReportModal } from './ReportModal';
import useReportComment from '../../../hooks/useReportComment';
import { Comment, ReportCommentReason } from '../../../graphql/comments';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../../lib/feed';
import { Post } from '../../../graphql/posts';
import { PostBootData } from '../../../lib/boot';
import { AnalyticsEvent } from '../../../lib/analytics';

interface Props extends ModalProps {
  onReport: (comment: Comment) => void;
  comment: Comment;
  post: Post | PostBootData;
}

const reportReasons: { value: string; label: string }[] = [
  { value: 'HATEFUL', label: 'Hateful or offensive content' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'SPAM', label: 'Spam or scams' },
  { value: 'EXPLICIT', label: 'Explicit sexual content' },
  { value: 'MISINFORMATION', label: 'False information or misinformation' },
  { value: 'OTHER', label: 'Other' },
];

export function ReportCommentModal({
  onReport,
  comment,
  post,
  ...props
}: Props): ReactElement {
  const { reportComment } = useReportComment();
  const { trackEvent } = useAnalyticsContext();

  const onReportComment = async (
    event: React.MouseEvent<HTMLButtonElement>,
    reason: ReportCommentReason,
    note: string,
  ): Promise<void> => {
    const { successful } = await reportComment({
      commentId: comment.id,
      reason,
      note,
    });
    if (!successful) return;

    trackEvent(
      postAnalyticsEvent(AnalyticsEvent.ReportComment, post, {
        extra: { commentId: comment.id },
      }),
    );

    if (typeof onReport === 'function') {
      onReport(comment);
    }

    props.onRequestClose(event);
  };

  return (
    <ReportModal
      {...props}
      isOpen
      onReport={onReportComment}
      reasons={reportReasons}
      heading="Report comment"
    />
  );
}

export default ReportCommentModal;
