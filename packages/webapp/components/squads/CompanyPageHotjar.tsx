import type { ReactElement } from 'react';
import React from 'react';
import { useSquad } from '@dailydotdev/shared/src/hooks/squads/useSquad';
import { isCompanyPage } from '@dailydotdev/shared/src/features/squads/lib/companyPage';
import {
  getSquadViewer,
  isStaffViewer,
} from '@dailydotdev/shared/src/features/squads/lib/viewer';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { useCompanyPageHotjarEvents } from '@dailydotdev/shared/src/features/squads/components/companyPage/useCompanyPageHotjarEvents';
import { StartupsHotjar } from '../Pixels';

// The first post of a company page is written in the composer at
// /squads/create?sid=<handle>, linked from the page's setup checklist. Hotjar
// records it only when that squad is a company page the viewer manages, like
// the squad pages themselves (SquadRoute).
export const CompanyPageHotjar = ({
  handle,
}: {
  handle?: string | null;
}): ReactElement | null => {
  const { isLoggedIn } = useAuthContext();
  const { squad } = useSquad({ handle: handle ?? '' });

  if (
    !squad ||
    !isCompanyPage(squad) ||
    !isStaffViewer(getSquadViewer(squad, isLoggedIn))
  ) {
    return null;
  }

  return <StartupsHotjar />;
};

// On a company page its admin manages: the stages it reaches while they watch
export const CompanyPageHotjarEvents = ({
  squad,
}: {
  squad: Squad;
}): ReactElement => {
  useCompanyPageHotjarEvents(squad);

  return <StartupsHotjar />;
};
