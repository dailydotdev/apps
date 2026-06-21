import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';

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

// Convenience for the top-level sidebar: owns the flag and returns both the
// provider value and a ref-free setter.
export const useSidebarDragStateValue = (): SidebarDragState => {
  const [isDragging, setDragging] = useState(false);
  return useMemo(() => ({ isDragging, setDragging }), [isDragging]);
};
