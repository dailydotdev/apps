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
import { AuthTriggers } from '../../../lib/auth';
import { checkIsExtension } from '../../../lib/func';

type BriefShortcutButtonProps = {
  className?: string;
  // When true the button renders icon-only (no "Generate brief" label).
  iconOnly?: boolean;
};

export const BriefShortcutButton = ({
  className,
  iconOnly,
}: BriefShortcutButtonProps): ReactElement | null => {
  const { isLoggedIn, isAuthReady, user, showLogin } = useAuthContext();
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

  const onLoggedInClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.ClickBrief,
      target_id: TargetId.Header,
      extra: JSON.stringify({
        is_demo: !user?.isPlus,
        brief_date: new Date(),
      }),
    });
  }, [logEvent, user?.isPlus]);

  const commonButtonProps = {
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Small,
    icon: (
      <BriefIcon size={IconSize.XSmall} secondary aria-hidden />
    ) as ReactElement,
    className,
    'aria-label': 'Generate brief',
    children: iconOnly ? undefined : 'Generate brief',
  };

  // Render the button for logged-out users on the extension new tab so
  // the strip looks the same; click opens the auth modal instead of
  // navigating to the briefing flow. Webapp keeps existing behavior
  // (logged-out users don't see the button there).
  if (!isLoggedIn) {
    if (!checkIsExtension()) {
      return null;
    }

    return (
      <Button
        type="button"
        {...commonButtonProps}
        onClick={() =>
          showLogin({
            trigger: AuthTriggers.MainButton,
            options: { isLogin: false },
          })
        }
      />
    );
  }

  return (
    <Button
      tag="a"
      href={targetHref}
      onClick={onLoggedInClick}
      {...commonButtonProps}
    />
  );
};
