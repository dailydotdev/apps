import type { Dispatch, ReactElement, ReactNode } from 'react';
import React, { useContext, useState } from 'react';
import usePersistentContext from '../hooks/usePersistentContext';
import { checkIsExtension } from '../lib/func';

export type DndSettings = { expiration: Date; link: string };

export interface DndContextData {
  setShowDnd: Dispatch<boolean>;
  showDnd: boolean;
  dndSettings: DndSettings | null;
  isActive: boolean;
  onDndSettings: (settings: DndSettings | null) => Promise<void>;
}

const DEFAULT_VALUE = {
  showDnd: false,
  setShowDnd: () => undefined,
  dndSettings: null,
  isActive: false,
  onDndSettings: async () => undefined,
} satisfies DndContextData;
const DndContext = React.createContext<DndContextData>(DEFAULT_VALUE);

interface DndContextProviderProps {
  children: ReactNode;
}

export const DndContextProvider = ({
  children,
}: DndContextProviderProps): ReactElement => {
  const [showDnd, setShowDnd] = useState(false);
  const [dndSettings, setDndSettings] =
    usePersistentContext<DndSettings | null>('dnd');
  const handleDndSettings = (settings: DndSettings | null) =>
    setDndSettings(settings);

  if (!checkIsExtension()) {
    return (
      <DndContext.Provider value={DEFAULT_VALUE}>
        {children}
      </DndContext.Provider>
    );
  }

  return (
    <DndContext.Provider
      value={{
        showDnd,
        setShowDnd,
        dndSettings,
        isActive: Boolean(
          dndSettings?.expiration &&
            dndSettings.expiration.getTime() > Date.now(),
        ),
        onDndSettings: handleDndSettings,
      }}
    >
      {children}
    </DndContext.Provider>
  );
};

export default DndContext;

export const useDndContext = (): DndContextData => useContext(DndContext);
