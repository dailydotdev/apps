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
    label: 'Power your AI agents',
    tooltip: `Connect daily.dev to tools like OpenClaw, Claude Code, Codex, Cursor, and more.`,
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Public API access',
    tooltip: `Access your personalized feed programmatically and build your own integrations.`,
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Chat with any post using AI',
    tooltip: `Get summaries, challenge arguments, compare alternatives, extract action items, or ask follow-up questions.`,
    status: PlusItemStatus.Ready,
  },
  {
    label: 'Advanced custom feeds',
    tooltip: `Build laser-focused feeds for the tools, languages, and topics you care about.`,
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
