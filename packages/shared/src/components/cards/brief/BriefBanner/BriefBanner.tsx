import type { ComponentProps } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { DevPlusIcon, TimerIcon } from '../../../icons';
import { briefButtonBg } from '../../../../styles/custom';
import { LogEvent, TargetId } from '../../../../lib/log';
import { useLogContext } from '../../../../contexts/LogContext';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useIsLightTheme } from '../../../../hooks/utils';
import { useActions } from '../../../../hooks';
import { ActionType } from '../../../../graphql/actions';
import { webappUrl } from '../../../../lib/constants';

export const BriefBanner = (props: ComponentProps<'div'>) => {
  const { className, style, ...attrs } = props;
  const isLightMode = useIsLightTheme();

  const impressionRef = useRef(false);
  const { logEvent } = useLogContext();
  const { user, isAuthReady } = useAuthContext();

  const { isActionsFetched, checkHasCompleted } = useActions();
  const hasGeneratedPreviously =
    isActionsFetched && checkHasCompleted(ActionType.GeneratedBrief);

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
        data-testid="brief-banner-cta"
        tag="a"
        icon={<DevPlusIcon className="ml-0" aria-hidden />}
        size={ButtonSize.Small}
        href={`${webappUrl}${
          hasGeneratedPreviously
            ? 'briefing/generate'
            : 'briefing?generate=true'
        }`}
        onClick={() => {
          logBriefEvent(LogEvent.ClickBrief);
        }}
        variant={ButtonVariant.Primary}
      >
        Generate your briefing
      </Button>
    </div>
  );
};
