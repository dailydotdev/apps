import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { PlusSaleLabel } from '@dailydotdev/shared/src/components/plus/PlusSaleLabel';
import { usePlusSale } from '@dailydotdev/shared/src/hooks/usePlusSale';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import { plusUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  plusSaleBannerBg,
  plusSaleBannerGlow,
  plusSaleBannerScrim,
  plusSaleMarkColor,
} from '@dailydotdev/shared/src/styles/custom';

export const MarketplacePlusCard = (): ReactElement | null => {
  const { isActive, headline, description } = usePlusSale();
  const { logSubscriptionEvent } = usePlusSubscription();

  if (!isActive) {
    return null;
  }

  return (
    <article
      className="relative isolate flex flex-col gap-3 overflow-hidden rounded-16 p-4 text-white"
      style={{ background: plusSaleBannerBg }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1"
        style={{ background: plusSaleBannerGlow }}
      />
      <DevPlusIcon
        aria-hidden
        secondary
        className="opacity-80 absolute -bottom-10 -right-6 -z-1 !size-40 rotate-12"
        style={{ color: plusSaleMarkColor }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1"
        style={{ background: plusSaleBannerScrim }}
      />
      <Link href={plusUrl} passHref>
        <a
          href={plusUrl}
          aria-label={headline}
          className="focus-outline absolute inset-0 rounded-16"
          onClick={() =>
            logSubscriptionEvent({
              event_name: LogEvent.UpgradeSubscription,
              target_id: TargetId.Marketplace,
            })
          }
        />
      </Link>
      <PlusSaleLabel className="w-fit" />
      <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
        {headline}
      </Typography>
      <Typography type={TypographyType.Callout} className="flex-1">
        {description}
      </Typography>
      <Button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none w-fit"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
      >
        Get Plus
      </Button>
    </article>
  );
};
