import React from 'react';
import {
  TypographyType,
  Typography,
  TypographyTag,
  TypographyColor,
} from '../../typography/Typography';
import { DevPlusIcon, InfoIcon, VIcon } from '../../icons';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import type { MarketingCta } from '../../marketingCta/common';
import CloseButton from '../../CloseButton';
import { useBoot } from '../../../hooks';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';

const bulletPoints = [
  {
    copy: 'Advanced custom feeds',
    tooltip: 'Advanced custom feeds',
  },
  {
    copy: 'Ad-free experience',
    tooltip: 'Ad-free experience',
  },
  {
    copy: 'Run prompts on any post',
    tooltip: 'Run prompts on any post',
  },
  {
    copy: 'Bookmark folders',
    tooltip: 'Bookmark folders',
  },
];

const PlusGrid = ({ marketingCta }: { marketingCta: MarketingCta }) => {
  const { logEvent } = useLogContext();
  const { clearMarketingCta } = useBoot();

  if (!marketingCta) {
    return null;
  }
  const { title, description, ctaText, ctaUrl } = marketingCta.flags;

  const handleClose = () => {
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.PlusEntryCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  };

  const handleClick = () => {
    logEvent({
      event_name: LogEvent.ClickPlusFeature,
      target_type: TargetType.PlusEntryCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  };

  // TODO: Create variable for gradient
  return (
    <div
      className="relative overflow-hidden rounded-b-16 p-4 pb-6"
      style={{
        background: `
        radial-gradient(circle at 50% 100%, #CE3DF3 0%, rgba(113, 71, 237, 0.72) 9.6%, rgba(113, 71, 237, 0) 100%),
        #0E1217
      `,
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-8 bg-action-plus-float p-1">
              <DevPlusIcon className="fill-action-plus-default" />
            </div>
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Title3}
              bold
            >
              {title}
            </Typography>
          </div>
          <CloseButton onClick={handleClose} />
        </div>

        <div className="flex flex-col gap-4">
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            {description}
          </Typography>

          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex w-full flex-col gap-1">
              {bulletPoints.map((bulletPoint) => (
                <div
                  key={bulletPoint.copy}
                  className="rounded-md flex items-center justify-between gap-2 p-0.5"
                >
                  <div className="flex items-center gap-1">
                    <VIcon />
                    <Typography
                      tag={TypographyTag.P}
                      type={TypographyType.Callout}
                    >
                      {bulletPoint.copy}
                    </Typography>
                  </div>
                  <InfoIcon className="fill-text-tertiary" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          tag="a"
          href={ctaUrl || '/plus'}
          variant={ButtonVariant.Primary}
          color={ButtonColor.Avocado}
          onClick={handleClick}
        >
          <Typography tag={TypographyTag.P} type={TypographyType.Callout} bold>
            {ctaText}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

export default PlusGrid;
