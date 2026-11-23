import React from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import type { AllowedTags, ButtonProps } from '../../../buttons/Button';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../buttons/Button';
import { plusUrl } from '../../../../lib/constants';
import Link from '../../../utilities/Link';
import { LogEvent, TargetId } from '../../../../lib/log';
import { usePlusSubscription } from '../../../../hooks';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { featureAdRemoveCopy } from '../../../../lib/featureManagement';

type Props = { iconOnly?: boolean } & ButtonProps<AllowedTags>;

export const RemoveAd = ({
  className,
  size = ButtonSize.Medium,
  iconOnly,
  ...props
}: Props): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();
  const { value: copy } = useConditionalFeature({
    feature: featureAdRemoveCopy,
    shouldEvaluate: !iconOnly,
  });
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
        {!iconOnly ? copy : undefined}
      </Button>
    </Link>
  );
};
