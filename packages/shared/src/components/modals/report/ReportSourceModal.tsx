import React, { ReactElement, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Checkbox } from '../../fields/Checkbox';
import { ModalProps } from '../common/Modal';
import { useLogContext } from '../../../contexts/LogContext';
import { ReportModal } from './ReportModal';
import {
  CommonReportReason,
  ReportEntity,
  sendReport,
  SourceReportReason,
  SourceReportReasonType,
} from '../../../report';
import { Squad } from '../../../graphql/sources';
import { useLeaveSquad } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent } from '../../../lib/log';

interface SouceReportModalProps extends ModalProps {
  squad: Squad;
  onReported?: () => void;
}

const reportReasons: { value: string; label: string }[] = [
  { value: CommonReportReason.Nsfw, label: 'NSFW or inappropriate content' },
  { value: SourceReportReason.Spam, label: 'Spam or excessive self-promotion' },
  { value: SourceReportReason.Bullying, label: 'Harassment and bullying' },
  {
    value: SourceReportReason.Hateful,
    label: 'Hate speech and discrimination',
  },
  { value: SourceReportReason.Copyright, label: 'Copyright violation' },
  { value: SourceReportReason.Privacy, label: 'Privacy violation' },
  { value: SourceReportReason.Miscategorized, label: 'Wrong category' },
  { value: SourceReportReason.Illegal, label: 'Illegal activities and scams' },
  { value: CommonReportReason.Other, label: 'Other' },
];

interface SubmitReportProps {
  reason: SourceReportReasonType;
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
      sendReport({
        type: ReportEntity.Source,
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
    <ReportModal<SourceReportReasonType>
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
