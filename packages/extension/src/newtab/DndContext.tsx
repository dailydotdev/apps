import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import React, { ReactElement, ReactNode } from 'react';

export type DndSettings = { expiration: Date; link: string };

export interface DndContextData {
  dndSettings: DndSettings;
  isActive: boolean;
  onDndSettings: (settings: DndSettings) => Promise<void>;
}

const DndContext = React.createContext<DndContextData>(null);
const now = new Date();

interface DndContextProviderProps {
  children: ReactNode;
}

export const DndContextProvider = ({
  children,
}: DndContextProviderProps): ReactElement => {
  const [dndSettings, setDndSettings] =
    usePersistentContext<DndSettings>('dnd');

  return (
    <DndContext.Provider
      value={{
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
