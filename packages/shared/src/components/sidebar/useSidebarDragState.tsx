import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

interface SidebarDragState {
  // True while ANY sidebar drag is in progress (rail tab reorder, shortcut
  // reorder/remove, or a panel row being dragged toward the dock). Consumers
  // use it to suppress tooltips, hover-card panels and panel-previews so they
  // never render over the drag ghost.
  isDragging: boolean;
  setDragging: (value: boolean) => void;
}

const SidebarDragContext = createContext<SidebarDragState>({
  isDragging: false,
  setDragging: () => undefined,
});

export const useSidebarDragState = (): SidebarDragState =>
  useContext(SidebarDragContext);

export const SidebarDragStateProvider = ({
  value,
  children,
}: {
  value: SidebarDragState;
  children: ReactNode;
}): ReactElement => (
  <SidebarDragContext.Provider value={value}>
    {children}
  </SidebarDragContext.Provider>
);
