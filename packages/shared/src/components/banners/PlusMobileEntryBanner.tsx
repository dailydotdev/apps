import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { ButtonColor, ButtonVariant, Button } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { PlusEntryArrow } from '../icons';
import type { MarketingCta, MarketingCtaFlags } from '../marketingCta/common';
import type { TargetType } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useBoot } from '../../hooks';

type PlusBannerProps = Omit<MarketingCta, 'flags'> & {
  targetType: TargetType;
  className?: string;
  arrow?: boolean;
  flags: MarketingCtaFlags & { leadIn?: string };
};

const PlusMobileEntryBanner = ({
  className,
  flags,
  arrow,
  targetType,
  campaignId,
}: PlusBannerProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { clearMarketingCta } = useBoot();
  if (!flags) {
    return null;
  }
  const { leadIn, description, ctaText, ctaUrl } = flags;

  const handleClose = () => {
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: targetType,
      target_id: campaignId,
    });
    clearMarketingCta(campaignId);
  };

  const handleClick = () => {
    logEvent({
      event_name: LogEvent.ClickPlusFeature,
      target_type: targetType,
      target_id: campaignId,
    });
    clearMarketingCta(campaignId);
  };

  return (
    <div
      className={classNames(
        'z-modal absolute flex w-full overflow-hidden p-4',
        className,
      )}
    >
      <div className="plus-entry-gradient -z-1 rounded-16 absolute inset-0 h-full w-full" />
      {arrow && <PlusEntryArrow className="absolute top-1 h-[25px] w-[14px]" />}
      <div className="flex w-full flex-col gap-2">
        <div
          className={classNames('relative w-full text-center', arrow && 'pl-3')}
        >
          {leadIn && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              color={TypographyColor.Plus}
            >
              {leadIn}{' '}
            </Typography>
          )}
          <Typography tag={TypographyTag.Span} type={TypographyType.Callout}>
            {description}
          </Typography>
        </div>
        <div className="flex flex-wrap justify-center">
          <Button
            tag="a"
            href={ctaUrl || '/plus'}
            variant={ButtonVariant.Primary}
            color={ButtonColor.Avocado}
            onClick={handleClick}
          >
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Callout}
              bold
            >
              {ctaText}
            </Typography>
          </Button>
          <Button
            className="flex-grow"
            variant={ButtonVariant.Float}
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlusMobileEntryBanner;
