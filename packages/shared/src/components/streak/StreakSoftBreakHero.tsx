import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { webappUrl } from '../../lib/constants';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, TargetType } from '../../lib/log';

interface StreakSoftBreakHeroProps {
  max: number;
  className?: string;
}

/**
 * What a reset streak leads with instead of the 0: the reader's best and a way
 * back onto the feed. The popup and the sidebar panel both render it in place
 * of their big current count.
 */
export function StreakSoftBreakHero({
  max,
  className,
}: StreakSoftBreakHeroProps): ReactElement {
  const { logEvent } = useLogContext();

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.StreakSoftBreak,
  }));

  return (
    <div className={classNames('flex flex-col items-start gap-1', className)}>
      <Typography
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
        className="tabular-nums"
      >
        Your best: {max} days.
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Today can be day 1.
      </Typography>
      <Link href={webappUrl} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="mt-2"
          onClick={() =>
            logEvent({
              event_name: LogEvent.Click,
              target_type: TargetType.StreakSoftBreak,
            })
          }
        >
          Start again
        </Button>
      </Link>
    </div>
  );
}
