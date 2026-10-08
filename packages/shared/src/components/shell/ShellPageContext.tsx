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
  // Over a thing's cover the block is its floating squares alone; the page
  // turns it solid once the cover has scrolled behind it.
  transparent?: boolean;
  // A page that draws its own top chrome on phones opts out of the block.
  hidden?: boolean;
  // The back square's action when it is not history: settings sections
  // return to their menu.
  onBack?: () => void;
}

interface ShellPageContextData {
  config: ShellPageConfig | null;
  setConfig: (config: ShellPageConfig | null) => void;
  dockedRow: ReactNode;
  setDockedRow: (row: ReactNode) => void;
  actionsSlot: HTMLElement | null;
  setActionsSlot: (element: HTMLElement | null) => void;
}

const ShellPageContext = createContext<ShellPageContextData>({
  config: null,
  setConfig: () => undefined,
  dockedRow: null,
  setDockedRow: () => undefined,
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
  const [dockedRow, setDockedRow] = useState<ReactNode>(null);
  const value = useMemo(
    () => ({
      config,
      setConfig,
      actionsSlot,
      setActionsSlot,
      dockedRow,
      setDockedRow,
    }),
    [config, actionsSlot, dockedRow],
  );

  return (
    <ShellPageContext.Provider value={value}>
      {children}
    </ShellPageContext.Provider>
  );
};

export const useShellPageConfig = (): ShellPageConfig | null =>
  useContext(ShellPageContext).config;

export const useShellDockedRow = (): ReactNode =>
  useContext(ShellPageContext).dockedRow;

// An action that lives in a component apart from the one that speaks for
// the page (a hero's menu) joins the block's actions from where it is.
export const ShellActions = ({
  children,
}: {
  children: ReactNode;
}): ReactElement | null => {
  const { actionsSlot } = useContext(ShellPageContext);

  return actionsSlot ? createPortal(children, actionsSlot) : null;
};

// A page's own row of segments joins the block once it has scrolled behind
// it. It is a second voice beside ShellPage because the hero and the tabs
// of a thing live in different components.
export const ShellDockedRow = ({ children }: { children: ReactNode }): null => {
  const { setDockedRow } = useContext(ShellPageContext);

  useLayoutEffect(() => {
    setDockedRow(children);
  }, [setDockedRow, children]);

  useLayoutEffect(() => () => setDockedRow(null), [setDockedRow]);

  return null;
};

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
  transparent,
  hidden,
  onBack,
}: ShellPageConfig): ReactElement | null => {
  const { setConfig, actionsSlot } = useContext(ShellPageContext);

  useLayoutEffect(() => {
    setConfig({ title, titleFades, row, transparent, hidden, onBack });
  }, [setConfig, title, titleFades, row, transparent, hidden, onBack]);

  useLayoutEffect(() => () => setConfig(null), [setConfig]);

  if (!actions || !actionsSlot) {
    return null;
  }

  return createPortal(actions, actionsSlot);
};
