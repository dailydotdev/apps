import React, { ReactElement, ReactNode, useState } from 'react';
import { Radio, RadioItemProps } from '../../fields/Radio';
import { Button, ButtonVariant } from '../../buttons/Button';
import { Modal, ModalProps } from '../common/Modal';
import { Justify } from '../../utilities';
import { useViewSize, ViewSize } from '../../../hooks';
import { ReportReason } from '../../../report';
import { PostModerationReason } from '../../../graphql/squads';

interface Props<T extends ReportReason | PostModerationReason>
  extends ModalProps {
  onReport(e: React.MouseEvent, reason: T, text: string): void;
  reasons: RadioItemProps[] | ((reason: string) => RadioItemProps[]);
  heading: string;
  title?: string;
  footer?: ReactNode;
  disabled?: boolean;
}

export const OTHER_KEY = 'OTHER';

export function ReasonSelectionModal<
  T extends ReportReason | PostModerationReason = ReportReason,
>({
  onReport,
  reasons,
  heading,
  title,
  footer,
  disabled,
  ...props
}: Props<T>): ReactElement {
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState<string>();
  const isMobile = useViewSize(ViewSize.MobileL);
  const submitButtonProps = {
    disabled: !reason || (reason === OTHER_KEY && !note) || disabled,
    onClick: (e) => onReport(e, reason, note),
  };

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FixedCenter}
      {...props}
      formProps={{
        form: null,
        title: heading,
        rightButtonProps: submitButtonProps,
        copy: { right: 'Submit report' },
      }}
    >
      <Modal.Header title={heading} />
      <Modal.Body className="py-5">
        {title && (
          <p className="mb-6 text-text-tertiary typo-callout">{title}</p>
        )}
        <Radio
          name="report_reason"
          options={typeof reasons === 'function' ? reasons(reason) : reasons}
          value={reason}
          onChange={setReason}
        />

        <p className="mb-1 mt-6 px-2 font-bold typo-caption1">
          Anything else you&apos;d like to add?
        </p>
        <textarea
          onInput={(event) => setNote(event.currentTarget.value)}
          className="mb-1 h-20 w-full resize-none self-stretch rounded-10 bg-surface-float p-2 typo-body"
          data-testid="report_comment"
        />
        {isMobile ? footer : null}
      </Modal.Body>
      <Modal.Footer
        justify={footer && !isMobile ? Justify.Between : Justify.End}
      >
        {isMobile ? null : footer}
        <Button
          variant={ButtonVariant.Primary}
          disabled={!reason || (reason === OTHER_KEY && !note) || disabled}
          onClick={(e) => onReport(e, reason, note)}
        >
          Submit report
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ReasonSelectionModal;
