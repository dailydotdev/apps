import type { ReactElement } from 'react';
import React, { useContext, useEffect, useRef } from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalSize } from '../common/types';
import { ReferralLadderPromo } from '../../referral/ReferralLadderPromo';
import { useReferralLadder } from '../../../hooks/referral/useReferralLadder';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent, TargetType } from '../../../lib/log';
import AlertContext from '../../../contexts/AlertContext';

function ReferralLadderPromoModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { updateLastReferralReminder } = useContext(AlertContext);
  const { isEligible, referredCount } = useReferralLadder();
  const isReminderUpdated = useRef(false);

  useEffect(() => {
    if (isReminderUpdated.current) {
      return;
    }

    isReminderUpdated.current = true;
    updateLastReferralReminder?.();
  }, [updateLastReferralReminder]);

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.ReferralLadderPromo,
      extra: JSON.stringify({ referredCount }),
    }),
    { condition: isEligible },
  );

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
      kind={Modal.Kind.FlexibleCenter}
      size={ModalSize.Small}
    >
      {isEligible && (
        <ReferralLadderPromo onClose={(event) => onRequestClose?.(event)} />
      )}
    </Modal>
  );
}

export default ReferralLadderPromoModal;
