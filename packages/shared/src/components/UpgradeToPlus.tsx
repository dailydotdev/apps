import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { ButtonSize } from './buttons/Button';
import { ButtonColor, Button, ButtonVariant } from './buttons/Button';
import { DevPlusIcon } from './icons';
import Link from './utilities/Link';
import { plusUrl } from '../lib/constants';
import { useConditionalFeature, useViewSize, ViewSize } from '../hooks';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import type { TargetId } from '../lib/log';
import { LogEvent } from '../lib/log';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthTriggers } from '../lib/auth';
import type { WithClassNameProps } from './utilities';
import { isIOSNative } from '../lib/func';
import {
  featurePlusButtonColors,
  featurePlusCtaCopy,
} from '../lib/featureManagement';

type Props = {
  iconOnly?: boolean;
  target: TargetId;
  size?: ButtonSize;
  variant?: ButtonVariant;
  color?: ButtonColor;
} & WithClassNameProps;

const getButtonColor = (colorExperiment: string) => {
  switch (colorExperiment) {
    case 'avocado':
      return {
        color: ButtonColor.Avocado,
        variant: ButtonVariant.Primary,
      };
    case 'cabbage':
      return {
        color: ButtonColor.Cabbage,
        variant: ButtonVariant.Primary,
      };
    case 'onion':
      return {
        color: ButtonColor.Onion,
        variant: ButtonVariant.Primary,
      };
    case 'cheesebacon':
      return {
        className: 'border-none text-surface-invert',
        color: ButtonColor.Bacon,
        style: {
          background: `radial-gradient(49.48% 102.99% at 50% 132.84%, var(--theme-accent-cheese-default) 0%, var(--theme-accent-bacon-default) 100%)`,
        },
      };
    case 'onionbacon':
      return {
        className: 'border-none text-white',
        color: ButtonColor.Onion,
        style: {
          background: `radial-gradient(49.48% 102.99% at 50% 132.84%, var(--theme-accent-bacon-default) 0%, var(--theme-accent-onion-default) 100%)`,
        },
      };
    default:
      return {};
  }
};

export const UpgradeToPlus = ({
  className,
  color,
  size,
  iconOnly = false,
  target,
  variant,
  ...attrs
}: Props): ReactElement => {
  const { isLoggedIn, showLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isLaptopXL = useViewSize(ViewSize.LaptopXL);
  const isFullCTAText = !isLaptop || isLaptopXL;
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { value: ctaCopy } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });
  const { value: colorExperiment } = useConditionalFeature({
    feature: featurePlusButtonColors,
    shouldEvaluate: !isPlus && isLoggedIn,
  });
  const content = isFullCTAText ? ctaCopy.full : ctaCopy.short;

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isLoggedIn) {
        e.preventDefault();
        showLogin({ trigger: AuthTriggers.Plus });
        return;
      }

      logSubscriptionEvent({
        event_name: LogEvent.UpgradeSubscription,
        target_id: target,
      });
    },
    [isLoggedIn, logSubscriptionEvent, showLogin, target],
  );

  if (isPlus || isIOSNative()) {
    return null;
  }

  return (
    <Link passHref href={plusUrl}>
      <Button
        tag="a"
        variant={ButtonVariant.Secondary}
        className={classNames(
          !color &&
            !colorExperiment &&
            'border-action-plus-default text-action-plus-default',
          !iconOnly && 'flex-1',
          className,
        )}
        icon={<DevPlusIcon />}
        size={size}
        onClick={onClick}
        {...(variant && { variant, color })}
        {...attrs}
        {...(colorExperiment && getButtonColor(colorExperiment))}
      >
        {iconOnly ? null : content}
      </Button>
    </Link>
  );
};
