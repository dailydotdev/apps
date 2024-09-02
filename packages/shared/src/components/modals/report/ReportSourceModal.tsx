import React, { ReactElement, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Checkbox } from '../../fields/Checkbox';
import { ModalProps } from '../common/Modal';
import { useLogContext } from '../../../contexts/LogContext';
import { ReportModal } from './ReportModal';
import { ReportReason, sendSourceReport } from '../../../report';
import { Squad } from '../../../graphql/sources';
import { useLeaveSquad } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent } from '../../../lib/log';

interface SouceReportModalProps extends ModalProps {
  squad: Squad;
  onReported?: () => void;
}

const reportReasons: { value: string; label: string }[] = [
  { value: ReportReason.Nsfw, label: 'NSFW or inappropriate content' },
  { value: ReportReason.Spam, label: 'Spam or excessive self-promotion' },
  { value: ReportReason.Harassment, label: 'Harassment and bullying' },
  {
    value: ReportReason.Hateful,
    label: 'Hate speech and discrimination',
  },
  { value: ReportReason.Copyright, label: 'Copyright violation' },
  { value: ReportReason.Privacy, label: 'Privacy violation' },
  { value: ReportReason.Miscategorized, label: 'Wrong category' },
  { value: ReportReason.Illegal, label: 'Illegal activities and scams' },
  { value: ReportReason.Other, label: 'Other' },
];

interface SubmitReportProps {
  reason: ReportReason;
  comment?: string;
}

export function ReportPostModal({
  squad,
  onReported,
  onRequestClose,
  ...props
}: SouceReportModalProps): ReactElement {
  const { logEvent } = useLogContext();
  const { squads } = useAuthContext();
  const inputRef = useRef<HTMLInputElement>();
  const onLeaveSquad = useLeaveSquad({ squad });
  const { mutateAsync: onReport } = useMutation(
    ({ reason, comment }: SubmitReportProps) =>
      sendSourceReport({
        id: squad.id,
        reason,
        comment,
      }),
    {
      onSuccess: () => {
        logEvent({
          event_name: LogEvent.ReportSquad,
          extra: JSON.stringify({ squad: squad.id }),
        });

        if (inputRef.current?.checked) {
          onLeaveSquad({ forceLeave: true });
        }

        onReported?.();
        onRequestClose(null);
      },
    },
  );

  const isUserMember = squads.some((s) => s.id === squad.id);

  return (
    <ReportModal
      {...props}
      isOpen
      onReport={(_, reason, comment) => onReport({ reason, comment })}
      reasons={reportReasons}
      heading="Report Squad"
      footer={
        isUserMember && (
          <Checkbox ref={inputRef} name="blockSource" className="font-normal">
            Report and leave {squad.name}
          </Checkbox>
        )
      }
    />
  );
}

export default ReportPostModal;
