import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

interface ShellPageConfig {
  title?: ReactNode;
  // A thing shows its name in its hero first; the block takes the name
  // once the hero's has scrolled away, and fades it in.
  titleFades?: boolean;
  actions?: ReactNode;
  row?: ReactNode;
  // A page that draws its own top chrome on phones opts out of the block.
  hidden?: boolean;
  // The back square's action when it is not history: settings sections
  // return to their menu.
  onBack?: () => void;
}

interface ShellPageContextData {
  config: ShellPageConfig | null;
  setConfig: (config: ShellPageConfig | null) => void;
  actionsSlot: HTMLElement | null;
  setActionsSlot: (element: HTMLElement | null) => void;
}

const ShellPageContext = createContext<ShellPageContextData>({
  config: null,
  setConfig: () => undefined,
  actionsSlot: null,
  setActionsSlot: () => undefined,
});

export const ShellPageProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [config, setConfig] = useState<ShellPageConfig | null>(null);
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null);
  const value = useMemo(
    () => ({ config, setConfig, actionsSlot, setActionsSlot }),
    [config, actionsSlot],
  );

  return (
    <ShellPageContext.Provider value={value}>
      {children}
    </ShellPageContext.Provider>
  );
};

export const useShellPageConfig = (): ShellPageConfig | null =>
  useContext(ShellPageContext).config;

// The block hands its actions slot to the context; pages portal their
// actions into it so they keep the page's own providers.
export const useShellActionsSlot = (): ((
  element: HTMLElement | null,
) => void) => useContext(ShellPageContext).setActionsSlot;

// A leaf declares what its top block shows by rendering this anywhere in
// its tree; the block in MainLayout picks it up. Unmounting clears it.
export const ShellPage = ({
  title,
  titleFades,
  actions,
  row,
  hidden,
  onBack,
}: ShellPageConfig): ReactElement | null => {
  const { setConfig, actionsSlot } = useContext(ShellPageContext);

  useLayoutEffect(() => {
    setConfig({ title, titleFades, row, hidden, onBack });
  }, [setConfig, title, titleFades, row, hidden, onBack]);

  useLayoutEffect(() => () => setConfig(null), [setConfig]);

  if (!actions || !actionsSlot) {
    return null;
  }

  return createPortal(actions, actionsSlot);
};
