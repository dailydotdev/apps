import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { DevPlusIcon } from '../../../components/icons/DevPlus';
import { PlusUser } from '../../../components/PlusUser';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featurePlusCtaCopy } from '../../../lib/featureManagement';
import { plusUrl } from '../../../lib/constants';
import { LogEvent, TargetId } from '../../../lib/log';

const useUpgradeClick = () => {
  const { logSubscriptionEvent } = usePlusSubscription();

  return () =>
    logSubscriptionEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_id: TargetId.FeedSettings,
    });
};

/** A small Get Plus button under controls a free reader sees locked. */
export const GetPlusButton = ({
  className,
}: {
  className?: string;
}): ReactElement => {
  const onClick = useUpgradeClick();

  return (
    <Link href={plusUrl} passHref>
      <Button
        tag="a"
        className={className}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Bacon}
        size={ButtonSize.Small}
        icon={<DevPlusIcon secondary />}
        onClick={onClick}
      >
        Get Plus
      </Button>
    </Link>
  );
};

/** What Plus adds to a section, for free readers only. */
export const PlusBanner = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement | null => {
  const { isPlus } = usePlusSubscription();
  const onClick = useUpgradeClick();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });

  if (isPlus) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex w-full flex-wrap items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-action-plus-float p-3',
        className,
      )}
    >
      <Typography type={TypographyType.Callout} className="flex-auto">
        {children}
      </Typography>
      <Link href={plusUrl} passHref>
        <Button
          className="w-fit"
          tag="a"
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          icon={<DevPlusIcon className="text-action-plus-default" />}
          onClick={onClick}
        >
          {plusCta}
        </Button>
      </Link>
    </div>
  );
};

/**
 * Marks everything under it as Plus: the Plus badge centered on a divider,
 * and for free readers, who see the controls locked, a Get Plus button under
 * the last one.
 */
export const PlusSection = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => {
  const { isPlus } = usePlusSubscription();

  return (
    <div className={classNames('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
        <PlusUser />
        <span className="h-px flex-1 bg-border-subtlest-tertiary" />
      </div>
      {children}
      {!isPlus && <GetPlusButton className="self-start" />}
    </div>
  );
};
