import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import type { DrawerRef } from '../../../components/drawers/Drawer';
import { Drawer } from '../../../components/drawers/Drawer';
import { EarthIcon } from '../../../components/icons/Earth';
import { IconSize } from '../../../components/Icon';
import { useLogContext } from '../../../contexts/LogContext';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { getAppUrl } from '../../../lib/constants';
import { cloudinaryAppIconMain } from '../../../lib/image';
import { LogEvent, TargetType } from '../../../lib/log';
import { useMobileAppSheet } from '../hooks/useMobileAppSheet';

const logTargetId = 'mobile sheet';

export const openAppFromSheetUrl = `${getAppUrl}?utm_source=mobile_sheet`;

export function MobileAppSheet(): ReactElement {
  const drawerRef = useRef<DrawerRef>(null);
  const { logEvent } = useLogContext();
  const { isOpen, onDismiss } = useMobileAppSheet();

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.GetAppButton,
      target_id: logTargetId,
    }),
    { condition: isOpen },
  );

  const onOpen = () => {
    logEvent({
      event_name: LogEvent.DownloadApp,
      target_type: TargetType.GetAppButton,
      target_id: logTargetId,
    });
    onDismiss();
  };

  const onClose = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.GetAppButton,
      target_id: logTargetId,
      extra: JSON.stringify({ choice: 'continue' }),
    });
    onDismiss();
  };

  return (
    <Drawer ref={drawerRef} isOpen={isOpen} onClose={onClose} appendOnRoot>
      <span className="mx-auto mb-4 h-1 w-10 rounded-4 bg-surface-hover" />
      <h2 className="mb-2 text-center font-bold typo-title3">
        See daily.dev in…
      </h2>
      <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
        <div className="flex items-center gap-3 py-2.5">
          <img
            src={cloudinaryAppIconMain}
            alt=""
            className="size-10 shrink-0 rounded-10 border border-border-subtlest-tertiary"
          />
          <span className="flex-1 font-bold typo-callout">daily.dev App</span>
          <Button
            tag="a"
            href={openAppFromSheetUrl}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="w-28"
            onClick={onOpen}
          >
            Open
          </Button>
        </div>
        <div className="flex items-center gap-3 py-2.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-secondary">
            <EarthIcon size={IconSize.Medium} />
          </span>
          <span className="flex-1 font-bold typo-callout">Browser</span>
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            className="w-28"
            onClick={() => drawerRef.current?.onClose()}
          >
            Continue
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
