import React from 'react';
import {
  TypographyType,
  Typography,
  TypographyTag,
  TypographyColor,
} from '../../typography/Typography';
import { DevPlusIcon } from '../../icons';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import type { MarketingCta } from '../../marketingCta/common';
import CloseButton from '../../CloseButton';
import { useBoot } from '../../../hooks';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { PlusItemStatus, PlusListItem } from '../../plus/PlusListItem';

const bulletPoints = [
  {
    label: 'Agent skills for daily.dev',
    tooltip: `Real-time dev context and continuous self-improvement for your agents.`,
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Public API access',
    tooltip: `Pull your feeds, bookmarks, and search results programmatically.`,
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Presidential briefings',
    tooltip: `A 5-minute briefing with what matters, what's worth a look, and what's hype.`,
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Chat with any post using AI',
    tooltip: `Ask questions, challenge arguments, get summaries, or pull out action items.`,
    status: PlusItemStatus.Ready,
  },
];

const PlusGrid = ({ flags, campaignId }: MarketingCta) => {
  const { logEvent } = useLogContext();
  const { clearMarketingCta } = useBoot();

  if (!flags) {
    return null;
  }
  const { title, description, ctaText, ctaUrl } = flags;

  const handleClose = () => {
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.PlusEntryCard,
      target_id: campaignId,
    });
    clearMarketingCta(campaignId);
  };

  const handleClick = () => {
    logEvent({
      event_name: LogEvent.ClickPlusFeature,
      target_type: TargetType.PlusEntryCard,
      target_id: campaignId,
    });
    clearMarketingCta(campaignId);
  };

  return (
    <div className="plus-entry-gradient relative overflow-hidden rounded-b-16 p-4 pb-6">
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

          <div className="flex w-full flex-col gap-1">
            {bulletPoints.map((bulletPoint) => (
              <PlusListItem
                key={bulletPoint.label}
                typographyProps={{
                  className: 'typo-callout',
                }}
                item={bulletPoint}
              />
            ))}
          </div>
        </div>

        <Button
          tag="a"
          href={ctaUrl || '/plus'}
          variant={ButtonVariant.Primary}
          color={ButtonColor.Avocado}
          onClick={handleClick}
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default PlusGrid;
