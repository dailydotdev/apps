import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '../modals/common/Modal';
import CloseButton from '../CloseButton';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import YoutubeVideo from './YoutubeVideo';

export interface TutorialVideoModalProps {
  videoId: string;
  videoUrl: string;
  title: string;
  onClose: () => void;
}

export default function TutorialVideoModal({
  videoId,
  videoUrl,
  title,
  onClose,
}: TutorialVideoModalProps): ReactElement {
  return (
    <Modal
      isOpen
      contentLabel={title}
      size={Modal.Size.XLarge}
      kind={Modal.Kind.FlexibleCenter}
      className="!h-auto !max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-16"
      overlayClassName="!z-max !bg-overlay-primary-pepper p-4"
      onRequestClose={onClose}
      overlayElement={(props, content) => (
        <div
          {...props}
          role="presentation"
          onClick={(event) => {
            event.stopPropagation();
            props.onClick?.(event);
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
            props.onMouseDown?.(event);
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
            props.onKeyDown?.(event);
          }}
        >
          {content}
        </div>
      )}
    >
      <header className="flex w-full items-center justify-between gap-4 p-4 tablet:px-6">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
          {title}
        </Typography>
        <CloseButton
          aria-label="Close video"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onClose}
        />
      </header>
      <div className="w-full px-4 pb-4 tablet:px-6 tablet:pb-6">
        <YoutubeVideo
          autoPlay
          videoId={videoId}
          placeholderProps={{
            post: { title, permalink: videoUrl },
            className: 'min-h-72',
          }}
        />
      </div>
    </Modal>
  );
}
