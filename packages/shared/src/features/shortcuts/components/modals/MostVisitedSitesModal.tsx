import type { ReactElement } from 'react';
import React from 'react';
import { LazyImage } from '../../../../components/LazyImage';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import { useShortcutLinks } from '../../hooks/useShortcutLinks';
import { useShortcuts } from '../../contexts/ShortcutsProvider';

export function MostVisitedSitesModal({
  className,
  ...props
}: ModalProps): ReactElement {
  const { askTopSitesBrowserPermission } = useShortcutLinks();
  const { setIsManual, setShowPermissionsModal } = useShortcuts();

  const onRequestClose = () => {
    setShowPermissionsModal(false);
    setIsManual(true);
  };

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      {...props}
      onRequestClose={onRequestClose}
    >
      <Modal.Header />
      <Modal.Body>
        <Modal.Title className="mb-4">Show most visited sites</Modal.Title>
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
          className="mx-auto my-8 w-full max-w-[22rem] rounded-16"
          ratio="45.8%"
          eager
        />
        <Modal.Text className="text-center">
          We will never collect your browsing history. We promise.
        </Modal.Text>
      </Modal.Body>
      <Modal.Footer justify={Justify.Center}>
        <Button
          onClick={async () => {
            const granted = await askTopSitesBrowserPermission();
            setIsManual(!granted);

            if (granted) {
              setShowPermissionsModal(false);
            }
          }}
          variant={ButtonVariant.Primary}
        >
          Add the shortcuts
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
