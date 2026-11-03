import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { AuthTriggers } from '../../../lib/auth';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { getAppDownloadUrl } from '../appStoreLinks';
import { isIOSNative, isPWA } from '../../../lib/func';

export const openAppUrl = getAppDownloadUrl('mobile_header');

interface MobileAppActionsProps {
  className?: string;
  // Over a cover Log in has no row behind it, so it takes the floating
  // material the squares beside it wear.
  isFloating?: boolean;
}

export function MobileAppActions({
  className,
  isFloating = false,
}: MobileAppActionsProps): ReactElement {
  const { logEvent } = useLogContext();
  const { showLogin, isAndroidApp } = useAuthContext();
  const isBrowser = !isAndroidApp && !isIOSNative() && !isPWA();

  const onAuth = (isLogin: boolean) => () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: isLogin ? TargetType.LoginButton : TargetType.SignupButton,
      target_id: TargetId.MobileHeader,
    });
    showLogin({
      trigger: AuthTriggers.MainButton,
      options: { isLogin },
    });
  };

  const onOpenApp = () => {
    logEvent({
      event_name: LogEvent.DownloadApp,
      target_type: TargetType.GetAppButton,
      target_id: TargetId.MobileHeader,
    });
  };

  return (
    <span className={classNames('flex flex-row items-center gap-2', className)}>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        className={isFloating ? 'shell-material' : undefined}
        onClick={onAuth(true)}
      >
        Log in
      </Button>
      {isBrowser ? (
        <Button
          tag="a"
          href={openAppUrl}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onOpenApp}
        >
          Open app
        </Button>
      ) : (
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onAuth(false)}
        >
          Sign up
        </Button>
      )}
    </span>
  );
}
