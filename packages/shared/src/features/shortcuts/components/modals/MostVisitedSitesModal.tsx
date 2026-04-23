import type { ReactElement } from 'react';
import React from 'react';
import { LazyImage } from '../../../../components/LazyImage';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
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
      {/* Unified with the rest of the shortcut modals: left-aligned Body bold
          title, close button on the right. No more centered h1 hanging in
          the middle of the body. */}
      <Modal.Header showCloseButton>
        <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
          Show most visited sites
        </Typography>
      </Modal.Header>
      <Modal.Body>
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
          className="mx-auto my-6 w-full max-w-[22rem] rounded-16"
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
