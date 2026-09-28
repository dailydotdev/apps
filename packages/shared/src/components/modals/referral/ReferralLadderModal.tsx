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

function ReferralLadderModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { referredCount, isReady } = useReferralLadder();

  // Waits for the campaign so the logged count is the real one.
  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.ReferralPopup,
      extra: JSON.stringify({ referredCount }),
    }),
    { condition: isReady },
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
        <ReferralLadderPopupContent
          logTargetId={TargetId.ProfileDropdown}
          logTargetType={TargetType.ReferralPopup}
        />
      </Modal.Body>
    </Modal>
  );
}

export default ReferralLadderModal;
