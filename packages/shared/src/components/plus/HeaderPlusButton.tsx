import type { ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { DevPlusIcon } from '../icons/DevPlus';
import { plusUrl } from '../../lib/constants';
import { LogEvent, TargetId } from '../../lib/log';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { PlusPreview } from './PlusPreview';

export const HeaderPlusButton = (): ReactElement | null => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();

  if (isPlus) {
    return null;
  }

  const logUpgradeClick = () =>
    logSubscriptionEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_id: TargetId.Header,
    });

  return (
    <PlusPreview side="bottom" align="end" onAction={logUpgradeClick}>
      <span className="hidden laptop:flex">
        <Link href={plusUrl} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            icon={
              <DevPlusIcon secondary className="text-action-plus-default" />
            }
            onClick={logUpgradeClick}
          >
            Get Plus
          </Button>
        </Link>
      </span>
    </PlusPreview>
  );
};
