import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useShortcuts } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import type { ImportPickerItem } from '@dailydotdev/shared/src/features/shortcuts/components/modals/ImportPickerModal';
import { MostVisitedSitesPermissionContent } from '@dailydotdev/shared/src/features/shortcuts/components/modals/MostVisitedSitesPermissionContent';
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
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  type ImportSource,
  MAX_SHORTCUTS,
} from '@dailydotdev/shared/src/features/shortcuts/types';

interface ImportFlowState {
  hasCheckedPermission: boolean;
  items?: ImportPickerItem[];
  askPermission: () => Promise<boolean>;
  emptyToast: string;
  renderPermissionModal: (
    onGrant: () => Promise<void>,
    onClose: () => void,
  ) => ReactElement;
}

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
  const handledRef = useRef<ImportSource | null>(null);

  const closeImportFlow = () => setShowImportSource?.(null);

  const getImportState = (source: ImportSource): ImportFlowState => {
    if (source === 'topSites') {
      return {
        hasCheckedPermission: hasCheckedTopSitesPermission,
        items: topSites?.map((site) => ({ url: site.url })),
        askPermission: askTopSitesPermission,
        emptyToast: 'No top sites yet. Visit some sites and try again.',
        renderPermissionModal: (onGrant, onClose) => (
          <Modal
            kind={Modal.Kind.FlexibleCenter}
            size={Modal.Size.Medium}
            isOpen
            onRequestClose={onClose}
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
        ),
      };
    }

    return {
      hasCheckedPermission: hasCheckedBookmarksPermission,
      items: bookmarks?.map((bookmark) => ({
        url: bookmark.url,
        title: bookmark.title,
      })),
      askPermission: askBookmarksPermission,
      emptyToast: 'Your bookmarks bar is empty. Add some bookmarks and try again.',
      renderPermissionModal: (onGrant, onClose) => (
        <Modal
          kind={Modal.Kind.FlexibleCenter}
          size={Modal.Size.Medium}
          isOpen
          onRequestClose={onClose}
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
            <Button
              type="button"
              onClick={onGrant}
              variant={ButtonVariant.Primary}
            >
              Import bookmarks
            </Button>
          </Modal.Footer>
        </Modal>
      ),
    };
  };

  useEffect(() => {
    if (!showImportSource) {
      handledRef.current = null;
      return;
    }

    const importState = getImportState(showImportSource);
    if (!importState.hasCheckedPermission || importState.items === undefined) {
      return;
    }

    if (handledRef.current === showImportSource) {
      return;
    }
    handledRef.current = showImportSource;

    const capacity = Math.max(0, MAX_SHORTCUTS - (customLinks?.length ?? 0));
    if (importState.items.length === 0) {
      displayToast(importState.emptyToast);
      closeImportFlow();
      return;
    }

    if (capacity === 0) {
      displayToast(
        `You already have ${MAX_SHORTCUTS} shortcuts. Remove some to import more.`,
      );
      closeImportFlow();
      return;
    }

    openModal({
      type: LazyModal.ImportPicker,
      props: {
        source: showImportSource,
        items: importState.items,
        returnTo: returnToAfterImport,
      },
    });
    closeImportFlow();
  }, [
    askBookmarksPermission,
    askTopSitesPermission,
    bookmarks,
    customLinks,
    displayToast,
    hasCheckedBookmarksPermission,
    hasCheckedTopSitesPermission,
    openModal,
    returnToAfterImport,
    setShowImportSource,
    showImportSource,
    topSites,
  ]);

  if (!showImportSource) {
    return null;
  }

  const importState = getImportState(showImportSource);
  if (!importState.hasCheckedPermission || importState.items !== undefined) {
    return null;
  }

  const handleGrant = async () => {
    const granted = await importState.askPermission();
    if (!granted) {
      closeImportFlow();
    }
  };

  return importState.renderPermissionModal(handleGrant, closeImportFlow);
}
