import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useShortcuts } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { Justify } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { MostVisitedSitesPermissionContent } from '@dailydotdev/shared/src/features/shortcuts/components/modals/MostVisitedSitesPermissionContent';
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
    returnToAfterImport,
    topSites,
    hasCheckedPermission: hasCheckedTopSitesPermission,
    askTopSitesPermission,
    bookmarks,
    hasCheckedBookmarksPermission,
    askBookmarksPermission,
  } = useShortcuts();
  const { customLinks } = useSettingsContext();
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

      // Always show the picker so the user sees exactly what gets imported,
      // which source it comes from, and can deselect items before confirming.
      // Previously we silently imported when items fit in capacity, which was
      // confusing ("what just got added? where from?").
      const items = topSites.map((s) => ({ url: s.url }));
      openModal({
        type: LazyModal.ImportPicker,
        props: { source: 'topSites', items, returnTo: returnToAfterImport },
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
      openModal({
        type: LazyModal.ImportPicker,
        props: { source: 'bookmarks', items, returnTo: returnToAfterImport },
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
    displayToast,
    openModal,
    setShowImportSource,
    returnToAfterImport,
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
        <Modal.Header showCloseButton>
          <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
            Show most visited sites
          </Typography>
        </Modal.Header>
        <MostVisitedSitesPermissionContent
          onGrant={onGrant}
          ctaLabel="Import shortcuts"
        />
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
