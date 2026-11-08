import { createContext, useContext } from 'react';

export interface SquadPageTabs {
  /** Opens the Jobs tab, when the page has one. */
  openJobs?: () => void;
  isJobsOpen: boolean;
}

export const SquadPageTabsContext = createContext<SquadPageTabs>({
  isJobsOpen: false,
});

/** Lets the right column's widgets reach the tabs of the card beside them. */
export const useSquadPageTabs = (): SquadPageTabs =>
  useContext(SquadPageTabsContext);
