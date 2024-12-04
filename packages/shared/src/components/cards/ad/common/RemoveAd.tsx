import React from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  type AllowedTags,
  type ButtonProps,
} from '../../../buttons/Button';
import { plusUrl } from '../../../../lib/constants';
import Link from '../../../utilities/Link';
import { LogEvent, TargetId } from '../../../../lib/log';
import { usePlusSubscription } from '../../../../hooks';

type Props = { iconOnly?: boolean } & ButtonProps<AllowedTags>;

export const RemoveAd = ({
  className,
  size = ButtonSize.Medium,
  iconOnly,
  ...props
}: Props): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();
  return (
    <Link passHref href={plusUrl}>
      <Button
        tag="a"
        variant={ButtonVariant.Float}
        size={size}
        color={ButtonColor.Bacon}
        className={classNames('ml-auto', className)}
        onClick={() => {
          logSubscriptionEvent({
            event_name: LogEvent.UpgradeSubscription,
            target_id: TargetId.Ads,
          });
        }}
        {...props}
      >
        {!iconOnly ? 'Remove' : undefined}
      </Button>
    </Link>
  );
};
