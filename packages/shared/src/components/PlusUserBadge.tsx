import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { PublicProfile } from '../lib/user';
import { SimpleTooltip } from './tooltips';
import { PlusUser } from './PlusUser';
import { plusUrl } from '../lib/constants';
import { DateFormat } from './utilities';
import { TimeFormatType } from '../lib/dateFormat';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../lib/log';
import { IconSize } from './Icon';
import { PlusPreview } from './plus/PlusPreview';

export type Props = {
  user: Pick<PublicProfile, 'isPlus' | 'plusMemberSince'>;
  tooltip?: boolean;
  clickable?: boolean;
  size?: IconSize;
};

export const PlusUserBadge = ({
  user,
  tooltip = true,
  clickable = true,
  size = IconSize.Size16,
}: Props): ReactElement | null => {
  const router = useRouter();
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();

  if (!user.isPlus) {
    return null;
  }

  const badge = <PlusUser withText={false} iconSize={size} />;

  if (!tooltip) {
    return <div className="flex items-center">{badge}</div>;
  }

  if (isPlus) {
    return (
      <SimpleTooltip
        content={
          <DateFormat
            prefix="Plus member since "
            date={user.plusMemberSince}
            type={TimeFormatType.PlusMember}
          />
        }
        placement="top"
      >
        <div className="flex items-center">{badge}</div>
      </SimpleTooltip>
    );
  }

  const logUpgradeClick = () =>
    logSubscriptionEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_id: TargetId.PlusBadge,
    });

  return (
    <PlusPreview side="bottom" onAction={logUpgradeClick}>
      {clickable ? (
        <button
          type="button"
          aria-label="Plus member"
          className="focus-outline flex items-center rounded-6"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            logUpgradeClick();
            router.push(plusUrl);
          }}
        >
          {badge}
        </button>
      ) : (
        <div className="flex items-center">{badge}</div>
      )}
    </PlusPreview>
  );
};
