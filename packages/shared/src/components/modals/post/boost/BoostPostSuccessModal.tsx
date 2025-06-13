import React from 'react';
import { postBoostSuccessCover } from '../../../../lib/image';
import { Button } from '../../../buttons/Button';
import { ButtonVariant } from '../../../buttons/common';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../typography/Typography';
import type { ModalProps } from '../../common/Modal';
import { Modal } from '../../common/Modal';
import { Image } from '../../../image/Image';

export function BoostPostSuccessModal({
  onBackToDashboard,
  ...props
}: ModalProps & { onBackToDashboard: () => void }): React.ReactElement {
  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
    >
      <Modal.Body className="flex flex-col">
        <Image src={postBoostSuccessCover} />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Title2}>
            Post boosted successfully!
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            Your post is now being promoted and will start reaching more
            developers shortly. You can track its performance anytime from the
            ads dashboard.
          </Typography>
        </div>
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          type="button"
          onClick={onBackToDashboard}
        >
          Ads dashboard
        </Button>
      </Modal.Body>
    </Modal>
  );
}
