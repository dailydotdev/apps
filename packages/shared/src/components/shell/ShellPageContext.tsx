import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

export interface ShellPageConfig {
  title?: ReactNode;
  actions?: ReactNode;
  // The page's own row under its title (segments, chips, a field).
  row?: ReactNode;
  // A page that draws its own top chrome on phones opts out of the block.
  hidden?: boolean;
}

interface ShellPageContextData {
  config: ShellPageConfig | null;
  setConfig: (config: ShellPageConfig | null) => void;
}

const ShellPageContext = createContext<ShellPageContextData>({
  config: null,
  setConfig: () => undefined,
});

export const ShellPageProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [config, setConfig] = useState<ShellPageConfig | null>(null);
  const value = useMemo(() => ({ config, setConfig }), [config]);

  return (
    <ShellPageContext.Provider value={value}>
      {children}
    </ShellPageContext.Provider>
  );
};

export const useShellPageConfig = (): ShellPageConfig | null =>
  useContext(ShellPageContext).config;

// A leaf declares what its top block shows by rendering this anywhere in
// its tree; the block in MainLayout picks it up. Unmounting clears it.
export const ShellPage = ({
  title,
  actions,
  row,
  hidden,
}: ShellPageConfig): null => {
  const { setConfig } = useContext(ShellPageContext);

  useLayoutEffect(() => {
    setConfig({ title, actions, row, hidden });
  }, [setConfig, title, actions, row, hidden]);

  useLayoutEffect(() => () => setConfig(null), [setConfig]);

  return null;
};
