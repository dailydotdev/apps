import React, { ReactElement, useState } from 'react';
import { useMutation } from 'react-query';
import { Radio } from '../../fields/Radio';
import { Button } from '../../buttons/Button';
import { Modal, ModalProps } from '../common/Modal';

export interface Props extends ModalProps {
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

export default function ReportCommentModal({
  onReport,
  ...props
}: Props): ReactElement {
  const [reason, setReason] = useState(null);
  const [comment, setComment] = useState<string>();
  const { mutateAsync: sendReport } = useMutation(() => Promise.resolve(), {
    onSuccess: () => {
      onReport();
      props.onRequestClose(null);
    },
  });

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      {...props}
    >
      <Modal.Header title="Report comment" />
      <Modal.Body className="py-5">
        <Radio
          name="report_reason"
          options={reportReasons}
          value={reason}
          onChange={setReason}
        />
        <p className="px-2 mt-6 mb-1 font-bold typo-caption1">
          Anything else you&apos;d like to add?
        </p>
        <textarea
          onChange={(event) => setComment(event.target.value)}
          className="self-stretch p-2 mb-1 w-full h-20 bg-theme-float rounded-10 resize-none typo-body"
          data-testid="report_comment"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn-primary"
          disabled={!reason || (reason === 'OTHER' && !comment)}
          onClick={() => sendReport()}
        >
          Submit report
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
