import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BriefIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';

type BriefShortcutButtonProps = {
  className?: string;
};

export const BriefShortcutButton = ({
  className,
}: BriefShortcutButtonProps): ReactElement | null => {
  const { isLoggedIn, isAuthReady, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isActionsFetched, checkHasCompleted } = useActions();
  const impressionRef = useRef(false);

  const hasGeneratedPreviously =
    isActionsFetched && checkHasCompleted(ActionType.GeneratedBrief);
  const targetHref = `${webappUrl}${
    hasGeneratedPreviously ? 'briefing/generate' : 'briefing?generate=true'
  }`;

  useEffect(() => {
    if (impressionRef.current || !isAuthReady || !isLoggedIn) {
      return;
    }

    impressionRef.current = true;
    logEvent({
      event_name: LogEvent.ImpressionBrief,
      target_id: TargetId.Header,
      extra: JSON.stringify({
        is_demo: !user?.isPlus,
        brief_date: new Date(),
      }),
    });
  }, [isAuthReady, isLoggedIn, logEvent, user?.isPlus]);

  const onClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.ClickBrief,
      target_id: TargetId.Header,
      extra: JSON.stringify({
        is_demo: !user?.isPlus,
        brief_date: new Date(),
      }),
    });
  }, [logEvent, user?.isPlus]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Button
      tag="a"
      href={targetHref}
      onClick={onClick}
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<BriefIcon size={IconSize.XSmall} secondary aria-hidden />}
      className={className}
    >
      Generate brief
    </Button>
  );
};
