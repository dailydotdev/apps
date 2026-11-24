import type { ReactElement } from 'react';
import React from 'react';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { useLogStartups } from '../../hooks/useLogStartups';
import { FreeBoostCard } from './FreeBoostCard';
import { useSquadFreeBoost } from './useSquadFreeBoost';

/** The free first-post boost card on a company page, for its admins */
export const SquadFreeBoost = (): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const freeBoost = useSquadFreeBoost(squad);
  const logStartups = useLogStartups();
  const sourceId = getSquadId(squad);

  if (!freeBoost) {
    return null;
  }

  if (freeBoost.state !== 'boosting') {
    return <FreeBoostCard {...freeBoost} />;
  }

  return (
    <FreeBoostCard
      {...freeBoost}
      upgradeUrl={getStartupsCheckoutUrl({ sourceId })}
      onUpgrade={() =>
        logStartups(LogEvent.UpgradeSubscription, 'free boost card', {
          origin: Origin.SquadPage,
          source_id: sourceId,
        })
      }
    />
  );
};
