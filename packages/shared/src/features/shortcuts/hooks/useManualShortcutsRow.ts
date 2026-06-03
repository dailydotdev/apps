import { arrayMove } from '@dnd-kit/sortable';
import type { Shortcut } from '../types';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { LazyModal } from '../../../components/modals/common/types';
import { useShortcutsManager } from './useShortcutsManager';
import { useShortcutDropZone } from './useShortcutDropZone';

interface UseManualShortcutsRowResult {
  shortcuts: Shortcut[];
  canAdd: boolean;
  isDropTarget: boolean;
  dropHandlers: ReturnType<typeof useShortcutDropZone>['dropHandlers'];
  onAdd: () => void;
  onEdit: (shortcut: Shortcut) => void;
  onRemove: (shortcut: Shortcut) => Promise<void>;
  reorderShortcuts: (activeId: string, overId: string) => Shortcut | null;
}

export function useManualShortcutsRow(): UseManualShortcutsRowResult {
  const manager = useShortcutsManager();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();

  const onAdd = () =>
    openModal({ type: LazyModal.ShortcutEdit, props: { mode: 'add' } });

  const onEdit = (shortcut: Shortcut) =>
    openModal({
      type: LazyModal.ShortcutEdit,
      props: { mode: 'edit', shortcut },
    });

  const onRemove = (shortcut: Shortcut) => manager.removeShortcut(shortcut.url);

  const onDropUrl = async (url: string) => {
    const result = await manager.addShortcut({ url });
    if (result.error) {
      displayToast(result.error);
    }
  };

  const { isDropTarget, dropHandlers } = useShortcutDropZone(
    onDropUrl,
    manager.canAdd,
  );

  const reorderShortcuts = (activeId: string, overId: string) => {
    const urls = manager.shortcuts.map((shortcut) => shortcut.url);
    const oldIndex = urls.indexOf(activeId);
    const newIndex = urls.indexOf(overId);

    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
      return null;
    }

    manager.reorder(arrayMove(urls, oldIndex, newIndex));
    return manager.shortcuts[oldIndex] ?? null;
  };

  return {
    shortcuts: manager.shortcuts,
    canAdd: manager.canAdd,
    isDropTarget,
    dropHandlers,
    onAdd,
    onEdit,
    onRemove,
    reorderShortcuts,
  };
}
