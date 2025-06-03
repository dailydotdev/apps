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
    label: 'Advanced custom feeds',
    tooltip: `Build laser-focused feeds for the tools, languages, and topics you care about. Search less, learn more.`,
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Ad-free experience',
    tooltip: `No ads. No clutter. Just pure content. Your feed, distraction-free.`,
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Run prompts on any post',
    tooltip: `Turn any post into an interactive learning experience. Ask AI to simplify concepts, challenge ideas, compare alternatives, or create your own custom prompt.`,
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Bookmark folders',
    tooltip: `Easily categorize and organize your bookmarked posts into folders so you can find what you need quickly.`,
    status: PlusItemStatus.Ready,
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

          <div className="flex flex-col items-center justify-center gap-6">
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
