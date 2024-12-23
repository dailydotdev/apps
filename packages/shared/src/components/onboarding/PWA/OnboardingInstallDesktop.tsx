import React, { FC, ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { useInstallPWA } from './useInstallPWA';
import {
  cloudinaryPWAChrome,
  cloudinaryPWAEdge,
  cloudinaryPWASafari,
} from '../../../lib/image';
import { BrowserName } from '../../../lib/func';
import { PWAChrome } from '../../icons/PWA/Chrome';
import { PWAEdge } from '../../icons/PWA/Edge';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { IconProps } from '../../Icon';

const icons: Partial<Record<BrowserName, FC<IconProps>>> = {
  [BrowserName.Chrome]: PWAChrome,
  [BrowserName.Edge]: PWAEdge,
  [BrowserName.Safari]: PWAChrome,
};
const images: Partial<Record<BrowserName, string>> = {
  [BrowserName.Chrome]: cloudinaryPWAChrome,
  [BrowserName.Edge]: cloudinaryPWAEdge,
  [BrowserName.Safari]: cloudinaryPWASafari,
};

export const OnboardingInstallDesktop = ({
  onClickNext,
}: {
  onClickNext: () => void;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const { promptToInstall, browserName } = useInstallPWA();
  const PWAIcon = icons[browserName] ?? icons[BrowserName.Chrome];
  const imageSrc = images[browserName] ?? images[BrowserName.Chrome];

  return (
    <div className="flex flex-1 flex-col laptop:justify-between">
      <div className="mb-14 flex flex-col items-center gap-6 justify-self-start text-center">
        <Typography
          bold
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
        >
          More daily.dev on your desktop?
          <br />
          Yes, please! 👀
        </Typography>
        <Button
          icon={<PWAIcon aria-hidden />}
          onClick={async () => {
            logEvent({
              event_name: LogEvent.InstallPWA,
            });
            await promptToInstall?.();
            onClickNext?.();
          }}
          variant={ButtonVariant.Primary}
        >
          Install on desktop
        </Button>
        <Typography
          bold
          color={TypographyColor.Tertiary}
          tag={TypographyTag.P}
          type={TypographyType.Subhead}
        >
          Manual: Press the
          <span className="mx-2 inline-grid size-7 place-content-center rounded-1/2 bg-accent-salt-bolder align-middle text-text-primary">
            <PWAIcon className="inline-block" aria-hidden />
          </span>
          icon next to the browser search bar and choose {`"`}Install{`"`} to
          level up
        </Typography>
      </div>
      <figure className="pointer-events-none mx-auto">
        <img
          alt="Amazing daily.dev extension screenshot"
          className="w-full"
          loading="lazy"
          role="presentation"
          src={imageSrc}
        />
      </figure>
    </div>
  );
};
