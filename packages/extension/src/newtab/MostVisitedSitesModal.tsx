import React, { ReactElement } from 'react';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Modal,
  ModalProps,
} from '@dailydotdev/shared/src/components/modals/common/Modal';
import { Justify } from '@dailydotdev/shared/src/components/utilities';

interface MostVisitedSitesModalProps extends ModalProps {
  onApprove: () => unknown;
}

export default function MostVisitedSitesModal({
  className,
  onApprove,
  ...props
}: MostVisitedSitesModalProps): ReactElement {
  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header />
      <Modal.Body>
        <Modal.Title>Show most visited sites</Modal.Title>
        <Modal.Text className="text-center">
          To show your most visited sites, your browser will now ask for more
          permissions. Once approved, it will be kept locally.
        </Modal.Text>
        <LazyImage
          imgSrc={
            process.env.TARGET_BROWSER === 'firefox'
              ? '/mvs_firefox.jpg'
              : '/mvs_google.jpg'
          }
          imgAlt="Image of the browser's default home screen"
          className="my-8 mx-auto w-full rounded-2xl max-w-[22rem]"
          ratio="45.8%"
          eager
        />
        <Modal.Text className="text-center">
          We will never collect your browsing history. We promise.
        </Modal.Text>
      </Modal.Body>
      <Modal.Footer justify={Justify.Center}>
        <Button onClick={onApprove} className="btn-primary">
          Add the shortcuts
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
