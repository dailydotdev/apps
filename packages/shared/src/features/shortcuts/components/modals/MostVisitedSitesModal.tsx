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
  const { setSourceManual, setShowPermissionsModal } = useShortcuts();

  const onRequestClose = () => {
    setShowPermissionsModal(false);
    // Cancelling the permission flow means the user backs out of the
    // top-sites choice — fall back to manual so we don't leave them in a
    // half-committed "topsites" preference with no permission.
    setSourceManual(true);
  };

  // NOTE: kept inline (Modal.Body owns the title + body content) instead
  // of routing through `MostVisitedSitesPermissionContent` from main. The
  // extracted component swaps the title from `Modal.Title` (lives inside
  // `Modal.Body`) to a `Typography` inside `Modal.Header`, and that move
  // — combined with this PR's `setSourceManual` (which mutates the
  // react-query cache via `persistSource` in `ShortcutsProvider`) —
  // re-mounts the dialog mid-test before `expect(title).toBeVisible()`
  // runs, breaking `extension/src/newtab/ShortcutLinks.spec.tsx::should
  // display top sites if permission is manually granted`. Keeping the
  // inline layout preserves the test's contract while we ship the
  // customizer's persistence change. The dedup main was after can be
  // re-introduced in a follow-up that updates the spec to wait for the
  // re-mount.
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
            // Record the user's final source choice: top sites on grant,
            // manual on deny. Keeps the sidebar segmented control and the
            // popup cards in sync with what the feed actually shows.
            setSourceManual(!granted);
            // Always dismiss the modal — even on deny — so the user isn't
            // trapped behind an unreachable Chrome dialog. The reverted
            // source ('manual') above keeps the rest of the UI consistent.
            setShowPermissionsModal(false);
          }}
          variant={ButtonVariant.Primary}
        >
          Add the shortcuts
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
