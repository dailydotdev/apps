import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import type { MarketingCta } from './common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { briefButtonBg } from '../../styles/custom';
import { ClickableCard } from '../cards/common/Card';
import { useIsLightTheme } from '../../hooks/utils';
import { IconSize } from '../Icon';
import {
  AnalyticsIcon,
  BellDisabledIcon,
  BriefIcon,
  EyeIcon,
  MenuIcon,
  TimerIcon,
} from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { useActions, useBoot } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';

const stats = [
  {
    Icon: TimerIcon,
    label: 'Save 15-20 hours of reading',
  },
  {
    Icon: AnalyticsIcon,
    label: 'Analyzed 5,000+ posts and videos',
  },
];

export const MarketingCtaBriefing = ({
  campaignId,
  flags: { title, description, ctaText, ctaUrl },
}: MarketingCta) => {
  const { completeAction } = useActions();
  const isLightMode = useIsLightTheme();
  const { clearMarketingCta } = useBoot();
  const { logEvent } = useLogContext();

  const hideCard = useCallback(() => {
    // log dismiss event
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.MarketingCtaBrief,
      target_id: campaignId,
    });

    clearMarketingCta(campaignId);
  }, [campaignId, clearMarketingCta, logEvent]);

  const onNeverShowAgain = useCallback(() => {
    hideCard();
    completeAction(ActionType.DisableBriefCardCta);
  }, [completeAction, hideCard]);

  useEffect(() => {
    // log impression event
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.MarketingCtaBrief,
      target_id: TargetId.Feed,
    });
  }, [logEvent]);

  return (
    <ClickableCard
      className={classNames('flex flex-col gap-3 p-4', {
        invert: !isLightMode,
      })}
      style={{
        background: briefButtonBg,
      }}
    >
      <div className="flex items-center justify-between gap-2 text-text-primary">
        <div className="flex items-center gap-1">
          <BriefIcon secondary size={IconSize.Large} aria-hidden />
          <Typography type={TypographyType.Footnote}>
            {format(new Date(), 'MMMM d, yyyy')}
          </Typography>
        </div>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={ButtonVariant.Tertiary}
                className="my-auto"
                icon={<MenuIcon />}
                size={ButtonSize.Small}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuOptions
                options={[
                  {
                    icon: <EyeIcon aria-hidden />,
                    label: 'Hide',
                    action: () => hideCard(),
                  },
                  {
                    icon: <BellDisabledIcon aria-hidden />,
                    label: `Don't show me again`,
                    action: () => onNeverShowAgain(),
                  },
                ]}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Typography
          bold
          color={TypographyColor.Primary}
          type={TypographyType.Title3}
          tag={TypographyTag.H3}
        >
          {title}
        </Typography>
        <Typography
          color={TypographyColor.Primary}
          type={TypographyType.Footnote}
          tag={TypographyTag.P}
        >
          {description}
        </Typography>
      </div>
      <footer className="flex flex-col gap-4">
        <Typography
          className="flex flex-col gap-2"
          color={TypographyColor.Primary}
          type={TypographyType.Footnote}
          tag={TypographyTag.P}
        >
          {stats.map(({ Icon, label }) => (
            <span
              className="flex items-center gap-1 whitespace-nowrap"
              key={label}
            >
              <Icon size={IconSize.Size16} aria-hidden /> {label}
            </span>
          ))}
        </Typography>
        <Button
          className="w-full"
          tag="a"
          href={ctaUrl}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
        >
          {ctaText}
        </Button>
      </footer>
    </ClickableCard>
  );
};
