import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { PublicProfile } from '../lib/user';
import { PlusUser } from './PlusUser';
import { plusUrl } from '../lib/constants';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../lib/log';
import { IconSize } from './Icon';
import { PlusPreview } from './plus/PlusPreview';

export type Props = {
  user: Pick<PublicProfile, 'isPlus' | 'plusMemberSince'>;
  tooltip?: boolean;
  size?: IconSize;
};

export const PlusUserBadge = ({
  user,
  tooltip = true,
  size = IconSize.Size16,
}: Props): ReactElement | null => {
  const router = useRouter();
  const { logSubscriptionEvent } = usePlusSubscription();

  if (!user.isPlus) {
    return null;
  }

  if (!tooltip) {
    return (
      <div className="flex items-center">
        <PlusUser withText={false} iconSize={size} />
      </div>
    );
  }

  return (
    <PlusPreview side="bottom">
      <button
        type="button"
        aria-label="Plus member"
        className="focus-outline flex items-center rounded-6"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          logSubscriptionEvent({
            event_name: LogEvent.UpgradeSubscription,
            target_id: TargetId.PlusBadge,
          });
          router.push(plusUrl);
        }}
      >
        <PlusUser withText={false} iconSize={size} />
      </button>
    </PlusPreview>
  );
};
