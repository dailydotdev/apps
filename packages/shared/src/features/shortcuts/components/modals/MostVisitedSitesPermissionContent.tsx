import type { ReactElement } from 'react';
import React from 'react';
import { LazyImage } from '../../../../components/LazyImage';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import { isFirefoxExtension } from '../../../../lib/func';

export interface MostVisitedSitesPermissionContentProps {
  onGrant: () => void | Promise<void>;
  ctaLabel?: string;
  footerText?: string;
}

export function MostVisitedSitesPermissionContent({
  onGrant,
  ctaLabel = 'Add the shortcuts',
  footerText = 'We will never collect your browsing history. We promise.',
}: MostVisitedSitesPermissionContentProps): ReactElement {
  return (
    <>
      <Modal.Body>
        <Modal.Text className="text-center">
          To show your most visited sites, your browser will now ask for more
          permissions. Once approved, it will be kept locally.
        </Modal.Text>
        <LazyImage
          imgSrc={isFirefoxExtension ? '/mvs_firefox.jpg' : '/mvs_google.jpg'}
          imgAlt="Image of the browser's default home screen"
          className="mx-auto my-6 w-full max-w-[22rem] rounded-16"
          ratio="45.8%"
          eager
        />
        <Modal.Text className="text-center">{footerText}</Modal.Text>
      </Modal.Body>
      <Modal.Footer justify={Justify.Center}>
        <Button onClick={onGrant} variant={ButtonVariant.Primary}>
          {ctaLabel}
        </Button>
      </Modal.Footer>
    </>
  );
}
