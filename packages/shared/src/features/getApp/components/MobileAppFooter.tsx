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
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { AuthTriggers } from '../../../lib/auth';
import { appDownloadUrl } from '../../../lib/constants';
import { cloudinaryCharmNoComments } from '../../../lib/image';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { mobileAppFooterHeight } from '../mobileAppFooter';

export const openAppFromFooterUrl = `${appDownloadUrl}?utm_source=mobile_footer`;

interface MobileAppFooterProps {
  title: string;
}

export function MobileAppFooter({ title }: MobileAppFooterProps): ReactElement {
  const { logEvent } = useLogContext();
  const { showLogin } = useAuthContext();

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.GetAppButton,
    target_id: TargetId.MobileFooter,
    extra: JSON.stringify({ title }),
  }));

  const onOpenApp = () => {
    logEvent({
      event_name: LogEvent.DownloadApp,
      target_type: TargetType.GetAppButton,
      target_id: TargetId.MobileFooter,
    });
  };

  const onSignup = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.SignupButton,
      target_id: TargetId.MobileFooter,
    });
    showLogin({ trigger: AuthTriggers.MainButton });
  };

  return (
    <div
      className={classNames(
        'pointer-events-none flex flex-col justify-end',
        mobileAppFooterHeight,
      )}
    >
      <div className="h-28 bg-gradient-to-b from-transparent to-background-default" />
      <div className="pointer-events-auto flex flex-col items-center gap-3 bg-background-default px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] text-center">
        <div className="relative w-full">
          <div className="relative flex h-[5.25rem] items-end">
            <h3 className="min-w-0 flex-1 pb-3 pr-28 text-left font-bold leading-tight typo-title3">
              {title}
            </h3>
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-3 -right-6 h-24 w-44 overflow-hidden"
            >
              <div className="animate-charm-rise absolute inset-0">
                <div className="animate-charm-press absolute inset-0">
                  <img
                    src={cloudinaryCharmNoComments}
                    alt=""
                    className="absolute -top-4 left-0 size-44 max-w-none"
                  />
                </div>
              </div>
            </div>
            <span className="animate-charm-ripple pointer-events-none absolute -bottom-4 right-[4.625rem] z-2 size-8 rounded-max bg-accent-cabbage-default opacity-0 blur-sm" />
          </div>
          <div className="animate-charm-button-press relative z-1">
            <Button
              tag="a"
              href={openAppFromFooterUrl}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              className="w-full"
              onClick={onOpenApp}
            >
              Open daily.dev app
            </Button>
          </div>
        </div>
        <span className="text-text-tertiary typo-footnote">
          or{' '}
          <button
            type="button"
            className="font-bold text-accent-cabbage-default"
            onClick={onSignup}
          >
            sign up on the web
          </button>
        </span>
      </div>
    </div>
  );
}
