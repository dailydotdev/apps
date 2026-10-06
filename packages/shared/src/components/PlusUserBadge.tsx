import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../lib/user';
import { SimpleTooltip } from './tooltips';
import { PlusUser } from './PlusUser';
import { plusUrl } from '../lib/constants';
import Link from './utilities/Link';
import { DateFormat } from './utilities';
import { TimeFormatType } from '../lib/dateFormat';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import { usePlusPreviewLog } from '../hooks/usePlusPreviewLog';
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
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { logPreviewOpen, logPreviewAction } = usePlusPreviewLog(
    TargetId.PlusBadge,
  );

  if (!user.isPlus) {
    return null;
  }

  const badge = <PlusUser withText={false} iconSize={size} />;
  const memberSince = (
    <DateFormat
      prefix="Plus member since "
      date={user.plusMemberSince}
      type={TimeFormatType.PlusMember}
    />
  );

  if (!tooltip) {
    return <div className="flex items-center">{badge}</div>;
  }

  if (isPlus) {
    return (
      <SimpleTooltip content={memberSince} placement="top">
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
    <PlusPreview
      side="bottom"
      onOpen={logPreviewOpen}
      onAction={logPreviewAction}
      context={
        <span className="text-text-tertiary typo-footnote">{memberSince}</span>
      }
    >
      {clickable ? (
        <span className="flex items-center">
          <Link href={plusUrl} passHref>
            <a
              href={plusUrl}
              aria-label="Plus member"
              className="focus-outline flex items-center rounded-6"
              onClick={(event) => {
                event.stopPropagation();
                logUpgradeClick();
              }}
            >
              {badge}
            </a>
          </Link>
        </span>
      ) : (
        <div className="flex items-center">{badge}</div>
      )}
    </PlusPreview>
  );
};
