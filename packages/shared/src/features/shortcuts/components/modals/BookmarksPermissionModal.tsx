import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import { useShortcuts } from '../../contexts/ShortcutsProvider';
import { useShortcutsManager } from '../../hooks/useShortcutsManager';

export default function BookmarksPermissionModal({
  ...props
}: ModalProps): ReactElement {
  const { askBookmarksPermission, bookmarks, setShowImportSource } =
    useShortcuts();
  const manager = useShortcutsManager({ bookmarks });

  const handleGrant = async () => {
    const granted = await askBookmarksPermission();
    if (!granted) {
      return;
    }
    // After permission granted we can't always trust `bookmarks` is populated
    // synchronously. Delay one tick and import whatever we have.
    setTimeout(async () => {
      await manager.importFrom(
        'bookmarks',
        (bookmarks ?? []).map((b) => ({ url: b.url, title: b.title })),
      );
      setShowImportSource?.(null);
      props.onRequestClose?.(undefined as never);
    }, 0);
  };

  const onRequestClose = () => {
    setShowImportSource?.(null);
    props.onRequestClose?.(undefined as never);
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
        <Modal.Title className="mb-4">Import your bookmarks bar</Modal.Title>
        <Modal.Text className="text-center">
          To import your bookmarks bar, your browser will ask for permission to
          read bookmarks. We never sync your bookmarks to our servers.
        </Modal.Text>
      </Modal.Body>
      <Modal.Footer justify={Justify.Center}>
        <Button onClick={handleGrant} variant={ButtonVariant.Primary}>
          Import bookmarks
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
