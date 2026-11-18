import type { ReactElement } from 'react';
import React from 'react';
import { useSquadPageContext } from '../../SquadPageContext';
import { FreeBoostCard } from './FreeBoostCard';
import { useSquadFreeBoost } from './useSquadFreeBoost';

/** The free first-post boost card on a company page, for its admins */
export const SquadFreeBoost = (): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const freeBoost = useSquadFreeBoost(squad);

  if (!freeBoost) {
    return null;
  }

  return <FreeBoostCard {...freeBoost} />;
};
