import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalSize } from '../common/types';
import { useReferralLadder } from '../../../hooks/referral/useReferralLadder';
import {
  REFERRAL_LADDER_POPUP_TITLE,
  ReferralLadderPopupContent,
} from '../../referral/ReferralLadderPopupContent';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';

export interface ReferralLadderModalProps extends ModalProps {
  origin: TargetId;
}

function ReferralLadderModal({
  origin,
  onRequestClose,
  ...props
}: ReferralLadderModalProps): ReactElement {
  const { isEligible, referredCount } = useReferralLadder();

  // Waits for the ladder so the logged count is the real one.
  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.ReferralPopup,
      extra: JSON.stringify({ origin, referredCount }),
    }),
    { condition: isEligible },
  );

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
      size={ModalSize.Small}
    >
      <Modal.Header title={REFERRAL_LADDER_POPUP_TITLE} />
      <Modal.Body>
        {isEligible && (
          <ReferralLadderPopupContent
            logTargetId={TargetId.ReferralLadderPopup}
            logTargetType={TargetType.ReferralPopup}
            origin={origin}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ReferralLadderModal;
