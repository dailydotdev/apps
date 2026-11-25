import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
// @ts-expect-error react-dom has no types in this package
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { SpotlightProvider } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import SquadEmptyScreen from '@dailydotdev/shared/src/components/squads/SquadEmptyScreen';
import { SquadPageLayout } from '@dailydotdev/shared/src/features/squads/components/SquadPageLayout';
import { SquadProfileHeader } from '@dailydotdev/shared/src/features/squads/components/header/SquadProfileHeader';
import { acme, noPlan, Seeded } from '../startups-playgrounds/seed';
import { UpsellProposed } from './manage';

/**
 * The real squad page, so you can see where the upsell sits. `isToday` shows the
 * merged widget. Otherwise the proposal takes the same spot, first in the right
 * column, which the page doesn't let anything else fill, so it's placed there.
 */
export const UpsellOnPage = ({
  isToday,
  onSeePlans,
}: {
  isToday?: boolean;
  onSeePlans?: () => void;
}): ReactElement => {
  const client = useQueryClient();
  const pageRef = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<HTMLElement>();

  useState(() => {
    const queryKey = [`startups_upsell_dismissed_${acme.id}`, false];
    client.setQueryData(queryKey, !isToday);
    client.setQueryDefaults(queryKey, { staleTime: Infinity });
    return true;
  });

  useEffect(() => {
    const aside = pageRef.current?.querySelector('aside');

    if (isToday || !aside) {
      return undefined;
    }

    const node = document.createElement('div');
    aside.prepend(node);
    setSlot(node);

    return () => node.remove();
  }, [isToday]);

  return (
    <SpotlightProvider>
      <Seeded squad={acme} subscription={noPlan}>
        <div ref={pageRef} className="min-h-screen bg-background-default">
          <SquadPageLayout header={<SquadProfileHeader />} hasAboutTab>
            <SquadEmptyScreen />
          </SquadPageLayout>
          {slot &&
            createPortal(<UpsellProposed onSeePlans={onSeePlans} />, slot)}
        </div>
      </Seeded>
    </SpotlightProvider>
  );
};
