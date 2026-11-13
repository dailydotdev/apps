import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { LazyModal } from '../common/types';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ReadingStreakIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useLogContext } from '../../../contexts/LogContext';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LogEvent, TargetType } from '../../../lib/log';

export const STREAK_FREE_FREEZES_UPSELL_TITLE = 'We sorted you out twice.';
export const STREAK_FREE_FREEZES_UPSELL_DESCRIPTION =
  'That was your last free freeze. Get more so a busy day never costs you your streak.';

export type StreakFreeFreezesUpsellModalProps = Pick<
  ModalProps,
  'isOpen' | 'onAfterClose'
> & {
  onRequestClose: () => void;
};

// Shown once the free freezes from streak_free_freezes are all used up, see
// StreakFreeFreezesUpsellPopup
export const StreakFreeFreezesUpsellModal = ({
  isOpen,
  onAfterClose,
  onRequestClose,
}: StreakFreeFreezesUpsellModalProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const loggedImpression = useRef(false);

  useEffect(() => {
    if (loggedImpression.current) {
      return;
    }

    loggedImpression.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.StreakFreeFreezesUpsell,
    });
  }, [logEvent]);

  const logClick = (targetId: string) =>
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.StreakFreeFreezesUpsell,
      target_id: targetId,
    });

  const onMaybeLater = () => {
    logClick('maybe later');
    onRequestClose();
  };

  const onGetFreezes = () => {
    logClick('get freezes');
    // Replaces this modal with the purchase one
    openModal({ type: LazyModal.StreakFreezePurchase });
  };

  return (
    <Modal
      isOpen={isOpen}
      onAfterClose={onAfterClose}
      onRequestClose={onMaybeLater}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      isDrawerOnMobile
    >
      <Modal.Body className="flex flex-col items-center gap-3 text-center">
        <ReadingStreakIcon secondary size={IconSize.XLarge} />
        <Typography tag={TypographyTag.H3} type={TypographyType.Title3} bold>
          {STREAK_FREE_FREEZES_UPSELL_TITLE}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {STREAK_FREE_FREEZES_UPSELL_DESCRIPTION}
        </Typography>
        <Button
          type="button"
          className="mt-2 w-full"
          variant={ButtonVariant.Primary}
          onClick={onGetFreezes}
        >
          Get freezes
        </Button>
        <Button
          type="button"
          className="w-full"
          variant={ButtonVariant.Float}
          onClick={onMaybeLater}
        >
          Maybe later
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default StreakFreeFreezesUpsellModal;
