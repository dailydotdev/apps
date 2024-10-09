import React, { ReactElement, useCallback, useEffect, useRef } from 'react';
import {
  DailyIcon,
  LongArrowIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { del } from 'idb-keyval';
import { useEventListener } from '@dailydotdev/shared/src/hooks';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { INSTALLATION_STORAGE_KEY } from '../lib/common';

interface KeepItOverlayProps {
  onClose: () => void;
}

const TEN_SECONDS = 10000;

export function KeepItOverlay({ onClose }: KeepItOverlayProps): ReactElement {
  const { logEvent } = useLogContext();
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout>>();
  const onDelete = useCallback(() => del(INSTALLATION_STORAGE_KEY), []);

  const onClick = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    logEvent({ event_name: LogEvent.DismissNewTabPermission });
    await onDelete();
    onClose();
  }, [onDelete, onClose, logEvent]);

  // when this overlay is opened, there is nothing the user can do, clicking anywhere should close it.
  useEventListener(globalThis?.document, 'click', onClick);

  useEffect(() => {
    logEvent({ event_name: LogEvent.ShowNewTabPermission });
    onDelete();
    // logEvent is unstable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDelete]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      onClick();
    }, TEN_SECONDS);
  }, [onClick]);

  return (
    <div className="fixed inset-0 z-max flex flex-col items-center justify-center bg-overlay-dark-dark3">
      <div className="absolute flex flex-row-reverse">
        <span className="h-[17.5rem] w-[17.5rem] -translate-x-12 bg-accent-onion-default blur-3xl" />
        <span className="h-[17.5rem] w-[17.5rem] translate-x-12 bg-accent-cabbage-default blur-3xl" />
      </div>
      <Button
        variant={ButtonVariant.Primary}
        className="relative"
        onClick={onClick}
      >
        ALREADY DID THAT!
      </Button>
      <div className="absolute ml-16 mt-8 flex translate-y-full flex-col">
        <LongArrowIcon
          size={IconSize.XXXLarge}
          className="z-3 h-[7rem] animate-bounce"
        />
        <span className="absolute right-0 top-[80%] flex min-w-[21.25rem] flex-row items-center gap-2 rounded-12 bg-surface-primary p-3">
          <span className="rounded-full bg-surface-invert">
            <DailyIcon secondary className="w-full" size={IconSize.XLarge} />
          </span>
          <span className="ml-1 flex flex-col text-surface-invert">
            <Typography type={TypographyType.Footnote}>
              Open daily.dev every new tab
            </Typography>
            <Typography type={TypographyType.Title3} bold>
              Click &quot;Keep it&quot;
            </Typography>
          </span>
          <Button
            className="rounded-50 border border-border-subtlest-tertiary text-text-link"
            size={ButtonSize.Small}
          >
            Keep it
          </Button>
        </span>
      </div>
    </div>
  );
}
