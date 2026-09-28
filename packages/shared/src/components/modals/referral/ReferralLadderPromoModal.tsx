import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalSize, LazyModal } from '../common/types';
import type { ReferralLadderPromoVariant } from '../../referral/ReferralLadderPromo';
import { ReferralLadderPromo } from '../../referral/ReferralLadderPromo';
import { useLazyModal } from '../../../hooks/useLazyModal';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

interface ReferralLadderPromoModalProps extends ModalProps {
  variant: ReferralLadderPromoVariant;
}

function ReferralLadderPromoModal({
  variant,
  onRequestClose,
  ...props
}: ReferralLadderPromoModalProps): ReactElement {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.ReferralPopup,
    target_id: variant,
  }));

  const onInvite = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.ReferralPopup,
      target_id: variant,
    });
    openModal({ type: LazyModal.ReferralLadder });
  };

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
      kind={Modal.Kind.FlexibleCenter}
      size={ModalSize.Small}
    >
      <ReferralLadderPromo
        variant={variant}
        onInvite={onInvite}
        onClose={(event) => onRequestClose?.(event)}
      />
    </Modal>
  );
}

export default ReferralLadderPromoModal;
