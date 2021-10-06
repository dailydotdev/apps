import React, { ReactElement } from 'react';
import {
  ModalProps,
  StyledModal,
} from '@dailydotdev/shared/src/components/modals/StyledModal';
import classed from '@dailydotdev/shared/src/lib/classed';
import { ModalCloseButton } from '@dailydotdev/shared/src/components/modals/ModalCloseButton';
import classNames from 'classnames';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import styles from './MostVisitedSitesModal.module.css';
import { ConfirmationHeading } from '../../../shared/src/components/modals/ConfirmationModal';

const Paragraph = classed(
  'p',
  'text-theme-label-secondary text-center typo-callout',
);

export default function MostVisitedSitesModal({
  className,
  onApprove,
  ...props
}: ModalProps & { onApprove: () => unknown }): ReactElement {
  return (
    <StyledModal {...props} className={classNames(styles.mvsModal, className)}>
      <ModalCloseButton onClick={props.onRequestClose} />
      <ConfirmationHeading className="mb-1">
        Show most visited sites
      </ConfirmationHeading>
      <Paragraph>
        To show your most visited sites, your browser will now ask for more
        permissions. Once approved, it will be kept locally.
      </Paragraph>
      <LazyImage
        imgSrc={
          process.env.TARGET_BROWSER === 'firefox'
            ? '/mvs_firefox.jpg'
            : '/mvs_google.jpg'
        }
        imgAlt="Image of the browser's default home screen"
        className="my-8 w-full rounded-2xl"
        ratio="45.8%"
        eager
      />
      <Paragraph>
        We will never collect your browsing history.
        <br />
        We promise.
      </Paragraph>
      <Button
        className="mt-6 btn-primary"
        style={{ width: '13.125rem' }}
        onClick={onApprove}
      >
        Next
      </Button>
    </StyledModal>
  );
}
