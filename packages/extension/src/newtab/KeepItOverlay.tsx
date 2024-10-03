import React, { ReactElement, useCallback, useEffect } from 'react';
import {
  DailyIcon,
  StraightArrowIcon,
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
import { INSTALLATION_STORAGE_KEY } from '../lib/common';

interface KeepItOverlayProps {
  onClose: () => void;
}

export function KeepItOverlay({ onClose }: KeepItOverlayProps): ReactElement {
  const onDelete = useCallback(() => del(INSTALLATION_STORAGE_KEY), []);
  const onClick = async () => {
    await onDelete();
    onClose();
  };

  // when this overlay is opened, there is nothing the user can do, clicking anywhere should close it.
  useEventListener(globalThis?.document, 'click', onClick);

  useEffect(() => {
    onDelete();
  }, [onDelete]);

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
        <StraightArrowIcon
          size={IconSize.XXXLarge}
          className="z-3 rotate-180 text-brand-subtler"
        />
        <span className="absolute right-0 top-[80%] flex min-w-[20rem] flex-row items-center gap-2 rounded-12 bg-surface-primary p-3">
          <span className="rounded-full bg-surface-invert p-1">
            <DailyIcon />
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
