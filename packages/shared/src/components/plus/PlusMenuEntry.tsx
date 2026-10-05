import type { ReactElement } from 'react';
import React from 'react';
import { plusUrl, settingsUrl } from '../../lib/constants';
import { LogEvent } from '../../lib/log';
import type { TargetId } from '../../lib/log';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { usePlusSale } from '../../hooks/usePlusSale';
import { PlusEntryRow, PlusEntryRowSize } from './PlusEntryRow';
import { PlusPerkTicker } from './PlusPerkTicker';
import { PlusSaleLabel } from './PlusSaleLabel';

interface PlusMenuEntryProps {
  target: TargetId;
  size?: PlusEntryRowSize;
  className?: string;
}

export const PlusMenuEntry = ({
  target,
  size = PlusEntryRowSize.Medium,
  className,
}: PlusMenuEntryProps): ReactElement => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { isActive: isSaleActive } = usePlusSale();

  if (isPlus) {
    return (
      <PlusEntryRow
        member
        size={size}
        className={className}
        href={`${settingsUrl}/subscription`}
        title="Plus member"
        description="Manage your plan and perks"
      />
    );
  }

  return (
    <PlusEntryRow
      size={size}
      className={className}
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
