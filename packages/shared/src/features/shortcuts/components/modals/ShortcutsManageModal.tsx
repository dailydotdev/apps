import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { Switch } from '../../../../components/fields/Switch';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LogEvent, TargetType } from '../../../../lib/log';
import { LazyModal } from '../../../../components/modals/common/types';
import { useShortcuts } from '../../contexts/ShortcutsProvider';
import { useHiddenTopSites } from '../../hooks/useHiddenTopSites';
import { useShortcutsManager } from '../../hooks/useShortcutsManager';
import { DEFAULT_SHORTCUTS_APPEARANCE } from '../../types';
import type { Shortcut, ShortcutsAppearance } from '../../types';
import { AppearancePicker } from './ShortcutsManageAppearancePicker';
import {
  AutoConnectionsSection,
  BrowserConnectionsSection,
  ShortcutsModeSection,
} from './ShortcutsManageConnectionsSection';
import { SectionHeader } from './ShortcutsManageCommon';
import { ManualShortcutsSection } from './ShortcutsManageManualSection';
import {
  ShortcutsManageEditor,
  type ShortcutsManageEditingState,
} from './ShortcutsManageEditor';

export default function ShortcutsManageModal(props: ModalProps): ReactElement {
  const { logEvent } = useLogContext();
  const { showTopSites, toggleShowTopSites, flags, updateFlag } =
    useSettingsContext();
  const manager = useShortcutsManager();
  const {
    setShowImportSource,
    topSites,
    hasCheckedPermission: hasCheckedTopSitesPermission,
    askTopSitesPermission,
    onRevokePermission,
    bookmarks,
    hasCheckedBookmarksPermission,
    askBookmarksPermission,
    revokeBookmarksPermission,
  } = useShortcuts();
  const { hidden: hiddenTopSites, restore: restoreHiddenTopSites } =
    useHiddenTopSites();
  const { closeModal } = useLazyModal();
  const [editing, setEditing] = useState<ShortcutsManageEditingState | null>(
    null,
  );

  const logShortcutsEvent = useCallback(
    (eventName: LogEvent, extra?: Record<string, unknown>) => {
      logEvent({
        event_name: eventName,
        target_type: TargetType.Shortcuts,
        extra: extra ? JSON.stringify(extra) : undefined,
      });
    },
    [logEvent],
  );

  useEffect(() => {
    logShortcutsEvent(LogEvent.OpenShortcutConfig);
  }, [logShortcutsEvent]);

  const close = () => {
    closeModal();
    props?.onRequestClose?.(undefined as never);
  };

  const closeEditor = () => setEditing(null);
  const openEditor = (next: ShortcutsManageEditingState) => setEditing(next);

  const mode = flags?.shortcutsMode ?? 'manual';
  const appearance: ShortcutsAppearance =
    flags?.shortcutsAppearance ?? DEFAULT_SHORTCUTS_APPEARANCE;
  const showOnWebapp = flags?.showShortcutsOnWebapp ?? false;

  const topSitesGranted = topSites !== undefined;
  const topSitesKnown = hasCheckedTopSitesPermission && topSitesGranted;
  const bookmarksGranted = bookmarks !== undefined;
  const bookmarksKnown = hasCheckedBookmarksPermission && bookmarksGranted;

  const handleSelectMode = async (next: 'manual' | 'auto') => {
    if (next === mode) {
      return;
    }

    await updateFlag('shortcutsMode', next);
    logShortcutsEvent(LogEvent.ChangeShortcutsMode, { mode: next });

    if (next === 'auto' && topSites === undefined) {
      await askTopSitesPermission();
    }
  };

  const handleSelectAppearance = (next: ShortcutsAppearance) => {
    if (next === appearance) {
      return;
    }

    updateFlag('shortcutsAppearance', next);
    logShortcutsEvent(LogEvent.ChangeShortcutsAppearance, {
      appearance: next,
    });
  };

  const handleToggleShowOnWebapp = () => {
    const next = !showOnWebapp;
    updateFlag('showShortcutsOnWebapp', next);
    logShortcutsEvent(LogEvent.ToggleShortcutsOnWebapp, { enabled: next });
  };

  const handleReorderShortcuts = (activeId: string, overId: string) => {
    const urls = manager.shortcuts.map((shortcut) => shortcut.url);
    const oldIndex = urls.indexOf(activeId);
    const newIndex = urls.indexOf(overId);

    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
      return;
    }

    manager.reorder(arrayMove(urls, oldIndex, newIndex));
  };

  const handleEditShortcut = (shortcut: Shortcut) =>
    openEditor({ mode: 'edit', shortcut });
  const handleAddShortcut = () => openEditor({ mode: 'add' });

  const openTopSitesImport = setShowImportSource
    ? () => setShowImportSource('topSites', LazyModal.ShortcutsManage)
    : undefined;

  const openBookmarksImport = setShowImportSource
    ? () => setShowImportSource('bookmarks', LazyModal.ShortcutsManage)
    : undefined;

  if (editing) {
    return (
      <ShortcutsManageEditor
        editing={editing}
        onClose={closeEditor}
        {...props}
      />
    );
  }

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header showCloseButton={false}>
        <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
          Shortcuts
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="-mr-2 ml-auto tablet:-mr-4"
          onClick={close}
        >
          Done
        </Button>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col divide-y divide-border-subtlest-tertiary [&>*:not(:first-child)]:pt-5 [&>*:not(:last-child)]:pb-5">
          <SectionHeader
            title="Show shortcuts"
            description="Toggle the row visibility on the new-tab page."
            trailing={
              <Switch
                inputId="showTopSites-switch"
                name="showTopSites"
                compact={false}
                checked={showTopSites}
                onToggle={toggleShowTopSites}
                aria-label="Show shortcuts"
              />
            }
          />

          {showTopSites && (
            <ShortcutsModeSection
              mode={mode}
              onSelectMode={handleSelectMode}
            />
          )}

          {showTopSites && mode === 'auto' && (
            <AutoConnectionsSection
              topSitesGranted={topSitesGranted}
              topSitesKnown={topSitesKnown}
              topSitesCount={topSites?.length ?? 0}
              hiddenTopSitesCount={hiddenTopSites.length}
              onImportTopSites={openTopSitesImport}
              onAskTopSites={askTopSitesPermission}
              onRevokeTopSites={onRevokePermission}
              onRestoreHiddenTopSites={restoreHiddenTopSites}
            />
          )}

          {mode === 'manual' && (
            <ManualShortcutsSection
              shortcuts={manager.shortcuts}
              canAdd={manager.canAdd}
              onAdd={handleAddShortcut}
              onEdit={handleEditShortcut}
              onRemove={(shortcut) => manager.removeShortcut(shortcut.url)}
              onReorder={handleReorderShortcuts}
            />
          )}

          {mode === 'manual' && (
            <BrowserConnectionsSection
              bookmarksGranted={bookmarksGranted}
              bookmarksCount={bookmarks?.length ?? 0}
              bookmarksKnown={bookmarksKnown}
              showOnWebapp={showOnWebapp}
              onToggleShowOnWebapp={handleToggleShowOnWebapp}
              onImportBookmarks={openBookmarksImport}
              onAskBookmarks={askBookmarksPermission}
              onRevokeBookmarks={revokeBookmarksPermission}
            />
          )}

          {showTopSites && (
            <div className="flex flex-col gap-4">
              <AppearancePicker
                value={appearance}
                onChange={handleSelectAppearance}
              />
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
