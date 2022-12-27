import React, { ReactNode, ReactElement, useMemo } from 'react';
import { Squads } from '../graphql/squads';

export const SQUADS_DEFAULTS: Squads = {
  squads: [],
};

export interface SquadsContextData {
  squads: Squads;
  loadedSquads?: boolean;
}

export const MAX_DATE = new Date(3021, 0, 1);

const SquadsContext = React.createContext<SquadsContextData>({
  squads: SQUADS_DEFAULTS,
  loadedSquads: false,
});

interface SquadsContextProviderProps {
  children: ReactNode;
  squads: Squads;
  loadedSquads?: boolean;
}

export const SquadsContextProvider = ({
  children,
  squads = SQUADS_DEFAULTS,
  loadedSquads,
}: SquadsContextProviderProps): ReactElement => {
  const squadsContextData = useMemo<SquadsContextData>(
    () => ({
      squads,
      loadedSquads,
    }),
    [squads],
  );

  return (
    <SquadsContext.Provider value={squadsContextData}>
      {children}
    </SquadsContext.Provider>
  );
};

export default SquadsContext;
