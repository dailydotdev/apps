import React, { ReactElement } from 'react';
import { LazyModalCommonProps, Modal } from '../common/Modal';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ModalClose } from '../common/ModalClose';
import { Pill } from '../../Pill';
import { Image } from '../../image/Image';
import { cloudinary } from '../../../lib/image';

export default function MigrateUserStreakModal({
  onRequestClose,
  ...props
}: LazyModalCommonProps): ReactElement {
  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
    >
      <Modal.Body className="items-center !pt-4 tablet:items-start">
        <div className="flex w-full flex-row items-center justify-between">
          <Pill
            label="New Release"
            className="bg-theme-overlay-float-avocado text-status-success"
          />
          <ModalClose
            position="relative"
            className="right-0"
            onClick={onRequestClose}
          />
        </div>
        <div className="mt-5 flex flex-col gap-6">
          <h1 className="font-bold typo-large-title">
            Goodbye weekly goals,
            <br />
            Welcome reading streaks!
          </h1>
          <p className="text-text-secondary typo-body">
            Unlock the magic of consistently learning with our new reading
            streaks system
          </p>
          <Image
            src={cloudinary.streak.migrate}
            className="w-full object-cover"
          />
          <Button
            tag="a"
            // href={links} awaiting product decision
            className="w-full"
            variant={ButtonVariant.Primary}
            onClick={onRequestClose}
          >
            Tell me more
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
