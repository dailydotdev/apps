import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useLogContext } from '../../../contexts/LogContext';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
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

  return (
    <div
      className={classNames(
        'pointer-events-none flex flex-col justify-end',
        mobileAppFooterHeight,
      )}
    >
      <div className="h-12 bg-gradient-to-b from-transparent to-background-default" />
      <div className="pointer-events-auto relative bg-background-default px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="relative flex h-14 items-end">
          <h3 className="min-w-0 flex-1 pb-2 pr-16 font-bold leading-tight typo-title3">
            {title}
          </h3>
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-2 -right-3 h-[3.625rem] w-[6.625rem] overflow-hidden"
          >
            <div className="animate-charm-rise absolute inset-0">
              <div className="animate-charm-press absolute inset-0">
                <img
                  src={cloudinaryCharmNoComments}
                  alt=""
                  className="absolute -top-2.5 left-0 size-[6.625rem] max-w-none"
                />
              </div>
            </div>
          </div>
          <span className="animate-charm-ripple pointer-events-none absolute -bottom-2.5 right-[2.75rem] z-2 size-5 rounded-max bg-accent-cabbage-default opacity-0 blur-sm" />
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
    </div>
  );
}
