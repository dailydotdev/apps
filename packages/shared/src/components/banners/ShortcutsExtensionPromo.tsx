import classNames from 'classnames';
import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { ChromeIcon, EdgeIcon, PlusIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  cloudinaryShortcutsIconsGmail,
  cloudinaryShortcutsIconsOpenai,
  cloudinaryShortcutsIconsReddit,
  cloudinaryShortcutsIconsStackoverflow,
} from '../../lib/image';
import { useThemedAsset } from '../../hooks/utils/useThemedAsset';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { BrowserName, getCurrentBrowserName } from '../../lib/func';
import { downloadBrowserExtension } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

interface ShortcutsExtensionPromoProps {
  className?: string;
  onDismiss: () => void;
  onInstall?: () => void;
}

const ShortcutPlaceholder = ({ children }: PropsWithChildren) => (
  <div className="flex flex-col items-center" aria-hidden>
    <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary">
      {children}
    </div>
    <span className="h-2 w-10 rounded-10 bg-surface-float" />
  </div>
);

const ShortcutsExtensionPromo = ({
  className,
  onDismiss,
  onInstall,
}: ShortcutsExtensionPromoProps): ReactElement => {
  const { githubShortcut } = useThemedAsset();
  const { logEvent } = useLogContext();
  const browserName = getCurrentBrowserName();
  const isEdge = browserName === BrowserName.Edge;

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.ExtensionPromo,
  }));

  const icons = [
    cloudinaryShortcutsIconsGmail,
    githubShortcut,
    cloudinaryShortcutsIconsReddit,
    cloudinaryShortcutsIconsOpenai,
    cloudinaryShortcutsIconsStackoverflow,
  ];

  const handleInstallClick = () => {
    logEvent({
      event_name: LogEvent.DownloadExtension,
      origin: Origin.Feed,
    });
    onInstall?.();
  };

  return (
    <div
      className={classNames(
        'mx-auto mb-6 hidden w-fit flex-col items-center gap-6 px-4 tablet:flex',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <Typography type={TypographyType.Title3} bold>
          Want these shortcuts on every new tab?
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Install the daily.dev extension to pin your most visited sites.
        </Typography>
      </div>
      <div className="flex gap-4">
        {icons.map((url) => (
          <ShortcutPlaceholder key={url}>
            <img
              src={url}
              alt=""
              loading="lazy"
              className="size-6 object-contain"
            />
          </ShortcutPlaceholder>
        ))}
        <ShortcutPlaceholder>
          <PlusIcon />
        </ShortcutPlaceholder>
      </div>
      <div className="flex gap-4">
        <Button type="button" variant={ButtonVariant.Float} onClick={onDismiss}>
          Skip for now
        </Button>
        <Button
          tag="a"
          href={downloadBrowserExtension}
          target="_blank"
          rel={anchorDefaultRel}
          variant={ButtonVariant.Primary}
          icon={isEdge ? <EdgeIcon aria-hidden /> : <ChromeIcon aria-hidden />}
          onClick={handleInstallClick}
        >
          Install for {isEdge ? 'Edge' : 'Chrome'}
        </Button>
      </div>
    </div>
  );
};

export default ShortcutsExtensionPromo;
