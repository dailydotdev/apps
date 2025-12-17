import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { Typography, TypographyType } from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';

export interface RecruiterIntroModalProps extends ModalProps {
  onNext: () => void;
}

export const RecruiterIntroModal = ({
  onNext,
  onRequestClose,
  ...modalProps
}: RecruiterIntroModalProps): ReactElement => {
  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={false}
    >
      <Modal.Body className="flex flex-col items-center gap-6 p-6">
        <Typography type={TypographyType.Title1} bold>
          You&#39;re about to access something rare in recruiting
        </Typography>

        <Typography type={TypographyType.Body}>
          For years, developers have told us the same thing: they want a space
          to learn, grow, and stay sharp without noise or gimmicks.
        </Typography>

        <Typography type={TypographyType.Body}>
          daily.dev became that space because we protected it. Developers show
          up here every day for one reason, they know nothing here tries to game
          their attention.{' '}
          <strong>
            You&#39;re about to hire inside that special environment.
          </strong>
        </Typography>

        {/* Placeholder for video */}
        {/* <div className="flex aspect-video h-60 w-full items-center justify-center rounded-12 bg-background-subtle">
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            [Video]
          </Typography>
        </div> */}

        <Button
          variant={ButtonVariant.Primary}
          onClick={onNext}
          className="w-full"
          size={ButtonSize.Large}
        >
          Get started
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default RecruiterIntroModal;
