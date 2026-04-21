import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useShortcuts } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import { useShortcutsManager } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutsManager';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { Justify } from '@dailydotdev/shared/src/components/utilities';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { MAX_SHORTCUTS } from '@dailydotdev/shared/src/features/shortcuts/types';

// Coordinates the "Import from browser" / "Import from bookmarks" flows for
// the new hub. Keeps the permission modals, picker modal, and silent-import
// paths in one place so the hub UI itself stays declarative.
export function ShortcutImportFlow(): ReactElement | null {
  const {
    showImportSource,
    setShowImportSource,
    topSites,
    hasCheckedPermission: hasCheckedTopSitesPermission,
    askTopSitesPermission,
    bookmarks,
    hasCheckedBookmarksPermission,
    askBookmarksPermission,
  } = useShortcuts();
  const { customLinks } = useSettingsContext();
  const manager = useShortcutsManager();
  const { displayToast } = useToastNotification();
  const { openModal } = useLazyModal();

  // Prevents running the same import more than once for a single click.
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!showImportSource) {
      handledRef.current = null;
      return;
    }

    const capacity = Math.max(0, MAX_SHORTCUTS - (customLinks?.length ?? 0));

    if (showImportSource === 'topSites') {
      if (!hasCheckedTopSitesPermission || topSites === undefined) {
        return;
      }
      if (handledRef.current === 'topSites') {
        return;
      }
      handledRef.current = 'topSites';

      if (topSites.length === 0) {
        displayToast('No top sites yet. Visit some sites and try again.');
        setShowImportSource?.(null);
        return;
      }
      if (capacity === 0) {
        displayToast(
          `You already have ${MAX_SHORTCUTS} shortcuts. Remove some to import more.`,
        );
        setShowImportSource?.(null);
        return;
      }

      const items = topSites.map((s) => ({ url: s.url }));
      if (items.length <= capacity) {
        manager
          .importFrom('topSites', items)
          .then((result) => {
            displayToast(
              `Imported ${result.imported} sites to shortcuts${
                result.skipped ? `. ${result.skipped} skipped.` : ''
              }`,
            );
          })
          .finally(() => {
            setShowImportSource?.(null);
          });
        return;
      }
      openModal({
        type: LazyModal.ImportPicker,
        props: { source: 'topSites', items },
      });
      setShowImportSource?.(null);
      return;
    }

    if (showImportSource === 'bookmarks') {
      if (!hasCheckedBookmarksPermission || bookmarks === undefined) {
        return;
      }
      if (handledRef.current === 'bookmarks') {
        return;
      }
      handledRef.current = 'bookmarks';

      if (bookmarks.length === 0) {
        displayToast(
          'Your bookmarks bar is empty. Add some bookmarks and try again.',
        );
        setShowImportSource?.(null);
        return;
      }
      if (capacity === 0) {
        displayToast(
          `You already have ${MAX_SHORTCUTS} shortcuts. Remove some to import more.`,
        );
        setShowImportSource?.(null);
        return;
      }

      const items = bookmarks.map((b) => ({ url: b.url, title: b.title }));
      if (items.length <= capacity) {
        manager
          .importFrom('bookmarks', items)
          .then((result) => {
            displayToast(
              `Imported ${result.imported} bookmarks to shortcuts${
                result.skipped ? `. ${result.skipped} skipped.` : ''
              }`,
            );
          })
          .finally(() => {
            setShowImportSource?.(null);
          });
        return;
      }
      openModal({
        type: LazyModal.ImportPicker,
        props: { source: 'bookmarks', items },
      });
      setShowImportSource?.(null);
    }
  }, [
    showImportSource,
    topSites,
    hasCheckedTopSitesPermission,
    bookmarks,
    hasCheckedBookmarksPermission,
    customLinks,
    manager,
    displayToast,
    openModal,
    setShowImportSource,
  ]);

  // Permission modals: shown when the user asked to import but the browser
  // hasn't granted permission yet. Once granted, the provider refreshes
  // `topSites` / `bookmarks` and the effect above finishes the import.
  if (
    showImportSource === 'topSites' &&
    hasCheckedTopSitesPermission &&
    topSites === undefined
  ) {
    const onGrant = async () => {
      const granted = await askTopSitesPermission();
      if (!granted) {
        setShowImportSource?.(null);
      }
    };
    return (
      <Modal
        kind={Modal.Kind.FlexibleCenter}
        size={Modal.Size.Medium}
        isOpen
        onRequestClose={() => setShowImportSource?.(null)}
      >
        <Modal.Header />
        <Modal.Body>
          <Modal.Title className="mb-4">Show most visited sites</Modal.Title>
          <Modal.Text className="text-center">
            To import your most visited sites, your browser will ask for
            permission. Once approved, the data is kept locally.
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
          <Button onClick={onGrant} variant={ButtonVariant.Primary}>
            Import shortcuts
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  if (
    showImportSource === 'bookmarks' &&
    hasCheckedBookmarksPermission &&
    bookmarks === undefined
  ) {
    const onGrant = async () => {
      const granted = await askBookmarksPermission();
      if (!granted) {
        setShowImportSource?.(null);
      }
    };
    return (
      <Modal
        kind={Modal.Kind.FlexibleCenter}
        size={Modal.Size.Medium}
        isOpen
        onRequestClose={() => setShowImportSource?.(null)}
      >
        <Modal.Header />
        <Modal.Body>
          <Modal.Title className="mb-4">Import your bookmarks bar</Modal.Title>
          <Modal.Text className="text-center">
            To import your bookmarks bar, your browser will ask for permission
            to read bookmarks. We never sync your bookmarks to our servers.
          </Modal.Text>
        </Modal.Body>
        <Modal.Footer justify={Justify.Center}>
          <Button onClick={onGrant} variant={ButtonVariant.Primary}>
            Import bookmarks
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return null;
}
