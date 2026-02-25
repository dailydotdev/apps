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

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const DndContext = React.createContext<DndContextData>(null!);
const now = new Date();

interface DndContextProviderProps {
  children: ReactNode;
}

const ExtensionDndContextProvider = ({
  children,
}: DndContextProviderProps): ReactElement => {
  const [showDnd, setShowDnd] = useState(false);
  const [dndSettings, setDndSettings] =
    usePersistentContext<DndSettings>('dnd');

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

export const DndContextProvider = ({
  children,
}: DndContextProviderProps): ReactElement => {
  if (!checkIsExtension()) {
    return <>{children}</>;
  }

  return <ExtensionDndContextProvider>{children}</ExtensionDndContextProvider>;
};

export default DndContext;

export const useDndContext = (): DndContextData => useContext(DndContext);
