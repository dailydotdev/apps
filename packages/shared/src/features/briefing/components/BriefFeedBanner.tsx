import type { ComponentProps } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { DevPlusIcon, TimerIcon } from '../../../components/icons';
import { briefButtonBg } from '../../../styles/custom';
import { LogEvent, TargetId } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useIsLightTheme } from '../../../hooks/utils';

export const BriefFeedBanner = (props: ComponentProps<'div'>) => {
  const { className, style, ...attrs } = props;
  const router = useRouter();
  const isLightMode = useIsLightTheme();

  const impressionRef = useRef(false);
  const { logEvent } = useLogContext();
  const { user, isAuthReady } = useAuthContext();

  const logBriefEvent = useCallback(
    (eventName: LogEvent) => {
      logEvent({
        event_name: eventName,
        target_id: TargetId.Scroll,
        extra: JSON.stringify({
          is_demo: !user?.isPlus,
          brief_date: new Date(),
        }),
      });
    },
    [logEvent, user?.isPlus],
  );

  useEffect(() => {
    if (impressionRef.current || !isAuthReady) {
      return;
    }

    impressionRef.current = true;
    logBriefEvent(LogEvent.ImpressionBrief);
  }, [isAuthReady, logBriefEvent]);

  return (
    <div
      className={classNames(
        'flex flex-col items-center gap-4  rounded-16 px-4 py-6 text-center',
        className,
        { invert: !isLightMode },
      )}
      style={{
        background: briefButtonBg,
        ...style,
      }}
      {...attrs}
    >
      <div className="flex flex-col gap-1">
        <Typography
          color={TypographyColor.Primary}
          bold
          type={TypographyType.Title3}
        >
          Still scrolling? Let’s fix that
        </Typography>
        <Typography
          color={TypographyColor.Primary}
          type={TypographyType.Callout}
        >
          Put your AI agent to work. It’ll scan everything on daily.dev and
          deliver your personalized Presidential Briefing in seconds.
        </Typography>
      </div>
      <Typography
        color={TypographyColor.Primary}
        className="flex gap-1"
        type={TypographyType.Footnote}
      >
        <span>Agent scans 5,000+ posts</span>
        <span>Reading takes 2-3 minutes</span>
        <TimerIcon className="ml-1" aria-hidden />
        <span>Saves 15-20 hours of effort</span>
      </Typography>
      <Button
        icon={<DevPlusIcon className="ml-0" aria-hidden />}
        size={ButtonSize.Small}
        onClick={() => {
          logBriefEvent(LogEvent.ClickBrief);
          router.push('/briefing/generate');
        }}
        variant={ButtonVariant.Primary}
      >
        Generate your briefing
      </Button>
    </div>
  );
};
