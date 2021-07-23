import React from 'react';

export type DndSettings = { expiration: Date; link: string };

export interface DndContextData {
  dndSettings: DndSettings;
  isActive: boolean;
  setDndSettings: (settings: DndSettings) => Promise<void>;
}

const DndContext = React.createContext<DndContextData>(null);
export default DndContext;
