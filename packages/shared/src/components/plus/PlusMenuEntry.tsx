import type { ReactElement } from 'react';
import React from 'react';
import { plusUrl, settingsUrl } from '../../lib/constants';
import { LogEvent } from '../../lib/log';
import type { TargetId } from '../../lib/log';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { usePlusSale } from '../../hooks/usePlusSale';
import { PlusEntryRow } from './PlusEntryRow';
import { PlusPerkTicker } from './PlusPerkTicker';
import { PlusSaleLabel } from './PlusSaleLabel';

interface PlusMenuEntryProps {
  target: TargetId;
}

export const PlusMenuEntry = ({ target }: PlusMenuEntryProps): ReactElement => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { isActive: isSaleActive } = usePlusSale();

  if (isPlus) {
    return (
      <PlusEntryRow
        member
        href={`${settingsUrl}/subscription`}
        title="Plus member"
        description="Manage your plan and perks"
      />
    );
  }

  return (
    <PlusEntryRow
      href={plusUrl}
      title="Get Plus"
      description={<PlusPerkTicker />}
      trailing={isSaleActive ? <PlusSaleLabel /> : undefined}
      onClick={() =>
        logSubscriptionEvent({
          event_name: LogEvent.UpgradeSubscription,
          target_id: target,
        })
      }
    />
  );
};
