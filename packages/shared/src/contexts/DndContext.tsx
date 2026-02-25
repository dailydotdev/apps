import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import React, { useContext, useState } from 'react';
import usePersistentContext from '../hooks/usePersistentContext';
import { checkIsExtension } from '../lib/func';

export type DndSettings = { expiration: Date; link: string };

export interface DndContextData {
  setShowDnd: Dispatch<SetStateAction<boolean>>;
  showDnd: boolean;
  dndSettings?: DndSettings;
  isActive: boolean;
  onDndSettings: (settings: DndSettings) => Promise<void>;
}

const DEFAULT_VALUE: DndContextData = {
  showDnd: false,
  setShowDnd: () => {
    throw new Error('setShowDnd is not available outside DndContextProvider');
  },
  dndSettings: undefined,
  isActive: false,
  onDndSettings: async () => {
    throw new Error(
      'onDndSettings is not available outside DndContextProvider',
    );
  },
};
const DndContext = React.createContext<DndContextData>(DEFAULT_VALUE);
const now = new Date();

interface DndContextProviderProps {
  children: ReactNode;
}

export const DndContextProvider = ({
  children,
}: DndContextProviderProps): ReactElement => {
  const [showDnd, setShowDnd] = useState(false);
  const [dndSettings, setDndSettings] =
    usePersistentContext<DndSettings>('dnd');

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
        isActive: dndSettings?.expiration?.getTime() > now.getTime(),
        onDndSettings: setDndSettings,
      }}
    >
      {children}
    </DndContext.Provider>
  );
};

export default DndContext;

export const useDndContext = (): DndContextData => useContext(DndContext);
