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
import { ModalClose } from '../../common/ModalClose';

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
      <Modal.Body className="flex flex-col gap-3 py-1 tablet:!p-4">
        <div className="relative flex overflow-hidden rounded-16">
          <ModalClose
            className="hidden tablet:flex"
            right="0"
            onClick={props.onRequestClose}
          />
          <Image src={postBoostSuccessCover} />
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <Typography type={TypographyType.Title2} center bold>
            Post boosted successfully!
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            center
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
        <Button
          variant={ButtonVariant.Tertiary}
          className="hidden w-full tablet:flex"
          type="button"
          onClick={props.onRequestClose}
        >
          Close
        </Button>
      </Modal.Body>
    </Modal>
  );
}
