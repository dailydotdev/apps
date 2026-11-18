import type { ReactElement } from 'react';
import React from 'react';
import { useSquadPageContext } from '../../SquadPageContext';
import { useLogStartups } from '../../hooks/useLogStartups';
import { LogEvent, Origin } from '../../../../lib/log';
import { FreeBoostCard } from './FreeBoostCard';
import { useSquadFreeBoost } from './useSquadFreeBoost';

/** The free first-post boost card on a company page, for its admins */
export const SquadFreeBoost = (): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const freeBoost = useSquadFreeBoost(squad);
  const logStartups = useLogStartups();

  if (!freeBoost) {
    return null;
  }

  if (freeBoost.state === 'ended') {
    return (
      <FreeBoostCard
        {...freeBoost}
        onUpgradeClick={() =>
          logStartups(LogEvent.UpgradeSubscription, 'free boost results', {
            origin: Origin.SquadPage,
            source_id: squad.id,
          })
        }
      />
    );
  }

  return <FreeBoostCard {...freeBoost} />;
};
