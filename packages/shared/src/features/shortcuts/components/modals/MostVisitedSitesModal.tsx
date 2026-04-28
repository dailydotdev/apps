import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useShortcutLinks } from '../../hooks/useShortcutLinks';
import { useShortcuts } from '../../contexts/ShortcutsProvider';
import { MostVisitedSitesPermissionContent } from './MostVisitedSitesPermissionContent';

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
      <MostVisitedSitesPermissionContent
        onGrant={async () => {
          const granted = await askTopSitesBrowserPermission();
          setIsManual(!granted);
          if (granted) {
            setShowPermissionsModal(false);
          }
        }}
      />
    </Modal>
  );
}
