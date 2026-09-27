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
import { getAppUrl } from '../../../lib/constants';
import { LogEvent, TargetType } from '../../../lib/log';

const logTargetId = 'mobile header';

export const openAppUrl = `${getAppUrl}?utm_source=mobile_header`;

interface MobileAppActionsProps {
  className?: string;
}

export function MobileAppActions({
  className,
}: MobileAppActionsProps): ReactElement {
  const { logEvent } = useLogContext();
  const { showLogin } = useAuthContext();

  const onLogin = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.LoginButton,
      target_id: logTargetId,
    });
    showLogin({
      trigger: AuthTriggers.MainButton,
      options: { isLogin: true },
    });
  };

  const onOpenApp = () => {
    logEvent({
      event_name: LogEvent.DownloadApp,
      target_type: TargetType.GetAppButton,
      target_id: logTargetId,
    });
  };

  return (
    <span className={classNames('flex flex-row items-center gap-2', className)}>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        onClick={onLogin}
      >
        Log in
      </Button>
      <Button
        tag="a"
        href={openAppUrl}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        onClick={onOpenApp}
      >
        Open app
      </Button>
    </span>
  );
}
