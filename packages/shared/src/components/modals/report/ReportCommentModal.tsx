import React, { ReactElement } from 'react';
import { ModalProps } from '../common/Modal';
import { ReportModal } from './ReportModal';

interface Props extends ModalProps {
  onReport?(): void;
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
  ...props
}: Props): ReactElement {
  return (
    <ReportModal
      {...props}
      isOpen
      onReport={() => console.log('test')}
      reasons={reportReasons}
      heading="Report comment"
    />
  );
}

export default ReportCommentModal;
