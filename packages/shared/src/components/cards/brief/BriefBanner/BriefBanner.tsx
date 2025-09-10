import type { ComponentProps } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { DevPlusIcon, MoveToIcon, TimerIcon } from '../../../icons';
import { briefButtonBg } from '../../../../styles/custom';
import { LogEvent, TargetId } from '../../../../lib/log';
import { useLogContext } from '../../../../contexts/LogContext';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useIsLightTheme } from '../../../../hooks/utils';
import { useActions } from '../../../../hooks';
import { ActionType } from '../../../../graphql/actions';
import { webappUrl } from '../../../../lib/constants';
import { IconSize } from '../../../Icon';

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

  const time = (
    <Typography
      color={TypographyColor.Primary}
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      className="flex flex-row items-center gap-1"
    >
      <TimerIcon aria-hidden size={IconSize.Size16} /> Saves 15-20 hours of
      effort
    </Typography>
  );

  return (
    <div
      className={classNames(
        'flex flex-col items-center gap-4 rounded-16 px-4 py-6 text-center',
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
      <div className="flex flex-row items-center justify-center gap-6 text-text-primary tablet:gap-1 ">
        <Typography
          className="max-w-28 tablet:max-w-none"
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
        >
          Agent scans 5,000+ posts
        </Typography>
        <MoveToIcon size={IconSize.XXSmall} />
        <Typography
          className="max-w-28 tablet:max-w-none"
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
        >
          Reading takes 2-3 minutes
        </Typography>
        <div className="hidden tablet:block">{time}</div>
      </div>
      <div className="block tablet:hidden">{time}</div>
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
