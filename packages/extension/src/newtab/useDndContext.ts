import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';
import { useMemo } from 'react';
import { DndContextData, DndSettings } from './DndContext';

const now = new Date();

export default function useDndContext(): DndContextData {
  const [dndSettings, setDndSettings] = usePersistentState<
    DndSettings | undefined
  >('dnd', undefined);

  return useMemo<DndContextData>(
    () => ({
      dndSettings,
      isActive: dndSettings?.expiration?.getTime() > now.getTime(),
      setDndSettings,
    }),
    [dndSettings],
  );
}
