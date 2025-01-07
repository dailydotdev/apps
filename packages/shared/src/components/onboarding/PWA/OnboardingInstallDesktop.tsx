import type { FC, ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { useInstallPWA } from './useInstallPWA';
import {
  cloudinaryPWADesktopChrome,
  cloudinaryPWADesktopEdge,
  cloudinaryPWADesktopSafari,
} from '../../../lib/image';
import { BrowserName } from '../../../lib/func';
import { PWAChromeIcon, PWAEdgeIcon, PWASafariIcon } from '../../icons';
import type { IconProps } from '../../Icon';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

const icons: Partial<Record<BrowserName, FC<IconProps>>> = {
  [BrowserName.Chrome]: PWAChromeIcon,
  [BrowserName.Edge]: PWAEdgeIcon,
  [BrowserName.Safari]: PWASafariIcon,
};
const images: Partial<Record<BrowserName, string>> = {
  [BrowserName.Chrome]: cloudinaryPWADesktopChrome,
  [BrowserName.Edge]: cloudinaryPWADesktopEdge,
  [BrowserName.Safari]: cloudinaryPWADesktopSafari,
};

export const OnboardingInstallDesktop = ({
  onClickNext,
}: {
  onClickNext: () => void;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const { promptToInstall, browserName } = useInstallPWA();
  const isSafari = browserName === BrowserName.Safari;
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
          {isSafari ? 'Add to Dock' : 'Install on desktop'}
        </Button>
        <Typography
          bold
          color={TypographyColor.Tertiary}
          tag={TypographyTag.P}
          type={TypographyType.Subhead}
        >
          Manual: Press the
          <span className="mx-2 inline-grid size-7 place-content-center rounded-1/2 bg-accent-salt-bolder align-middle text-text-primary">
            <PWAIcon
              className={classNames('inline-block', isSafari && '-mt-0.5')}
              aria-hidden
            />
          </span>
          icon next to the browser search bar and choose{' '}
          {isSafari ? `"Add to Dock"` : `"Install"`} to level up!
        </Typography>
      </div>
      <figure className="pointer-events-none mx-auto">
        <img
          alt="Install daily.dev on desktop"
          className="w-full"
          loading="lazy"
          role="presentation"
          src={imageSrc}
        />
      </figure>
    </div>
  );
};
