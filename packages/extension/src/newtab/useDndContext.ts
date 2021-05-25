import { DndContextData, DndSettings } from './DndContext';
import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';

const now = new Date();

export default function useDndContext(): DndContextData {
  const [dndSettings, setDndSettings] = usePersistentState<
    DndSettings | undefined
  >('dnd', undefined);

  return {
    dndSettings,
    isActive: dndSettings?.expiration?.getTime() > now.getTime(),
    setDndSettings,
  };
}
