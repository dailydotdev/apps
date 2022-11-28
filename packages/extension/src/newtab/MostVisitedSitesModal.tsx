import React, { ReactElement } from 'react';
import { ModalProps } from '@dailydotdev/shared/src/components/modals/StyledModal';
import classed from '@dailydotdev/shared/src/lib/classed';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { Justify } from '@dailydotdev/shared/src/components/utilities';

const Heading = classed('h1', 'typo-title1 font-bold text-center mb-4');
const Paragraph = classed(
  'p',
  'text-theme-label-secondary text-center typo-callout',
);

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
        <Heading>Show most visited sites</Heading>
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
          className="my-8 mx-auto w-full rounded-2xl max-w-[22rem]"
          ratio="45.8%"
          eager
        />
        <Paragraph>
          We will never collect your browsing history. We promise.
        </Paragraph>
      </Modal.Body>
      <Modal.Footer justify={Justify.Center}>
        <Button onClick={onApprove} className="btn-primary">
          Add the shortcuts
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
