import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { safeContextHookExport } from '../../lib/func';

export interface SquadPageTabs {
  /** Opens the Jobs tab, when the page has one. */
  openJobs?: () => void;
  isJobsOpen: boolean;
}

interface SquadPageTabsProviderProps extends SquadPageTabs {
  children?: ReactNode;
}

const [SquadPageTabsProvider, useSquadPageTabsHook] = createContextProvider(
  ({ openJobs, isJobsOpen }: SquadPageTabsProviderProps): SquadPageTabs => ({
    openJobs,
    isJobsOpen,
  }),
  { errorMessage: 'SquadPageTabsNotFound' },
);

/** Lets the right column's widgets reach the tabs of the card beside them. */
const useSquadPageTabs = safeContextHookExport(
  useSquadPageTabsHook,
  'SquadPageTabsNotFound',
  { isJobsOpen: false },
);

export { SquadPageTabsProvider, useSquadPageTabs };
