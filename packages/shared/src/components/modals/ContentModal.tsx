import type { ReactElement } from 'react';
import React from 'react';
import type ReactModal from 'react-modal';
import { Modal } from './common/Modal';
import { ModalKind, ModalSize } from './common/types';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

interface ContentModalProps extends ReactModal.Props {
  videoUrl?: string;
  imageUrl?: string;
  mediaType?: 'video' | 'image';
  title: string;
  description: string;
  buttonText?: string;
}

export default function ContentModal({
  onRequestClose,
  videoUrl,
  imageUrl,
  mediaType = 'image',
  title,
  description,
  buttonText = 'Got it',
  ...props
}: ContentModalProps): ReactElement {
  return (
    <Modal
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Small}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
      {...props}
    >
      <div className="flex w-full flex-col items-center">
        <div className="w-full rounded-t-16 bg-surface-active">
          {mediaType === 'video' ? (
            <video
              className="aspect-video w-full border-none"
              poster={imageUrl}
              src={videoUrl}
              muted
              autoPlay
              loop
              playsInline
              disablePictureInPicture
              controls={false}
              title={title}
            />
          ) : (
            <img src={imageUrl} alt={title} className="h-70 w-full" />
          )}
        </div>
        <div className="flex w-full flex-col gap-4 p-6">
          <div className="flex flex-col gap-3">
            <Typography
              type={TypographyType.Title3}
              color={TypographyColor.Primary}
              bold
            >
              {title}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              {description}
            </Typography>
          </div>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            className="mt-3 w-full"
            onClick={onRequestClose}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
