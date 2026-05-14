import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { downloadBrowserExtension } from '../../lib/constants';
import {
  BrowserName,
  getCurrentBrowserName,
  isExtensionCapableBrowser,
} from '../../lib/func';
import { ChromeIcon, EdgeIcon } from '../../components/icons';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import styles from './EmbeddedBrowsingWebPrompt.module.css';

type EmbeddedBrowsingWebPromptProps = {
  onOptOut?: () => void;
};

/**
 * Webapp prompt shown when the daily.dev extension isn't installed in this
 * browser. The "extension installed but permission not granted" case is
 * handled inside the iframe itself (`packages/extension/src/frame/render.ts`)
 * so the Enable click carries the user gesture Chrome requires.
 */
export function EmbeddedBrowsingWebPrompt({
  onOptOut,
}: EmbeddedBrowsingWebPromptProps = {}): ReactElement | null {
  const { logEvent } = useLogContext();
  // Defensive: callers already gate on `isExtensionCapableBrowser` so this
  // shouldn't render on unsupported browsers, but bail just in case.
  const isSupportedBrowser = isExtensionCapableBrowser();
  const isEdgeBrowser = getCurrentBrowserName() === BrowserName.Edge;
  const BrowserIcon = isEdgeBrowser ? EdgeIcon : ChromeIcon;
  const installButtonLabel = isEdgeBrowser
    ? 'Install Edge extension'
    : 'Install Chrome extension';
  const browser = isEdgeBrowser ? 'edge' : 'chrome';

  useEffect(() => {
    if (!isSupportedBrowser) {
      return;
    }
    logEvent({
      event_name: LogEvent.ImpressionReaderInstallPrompt,
      extra: JSON.stringify({ browser }),
    });
    // Fire once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSupportedBrowser) {
    return null;
  }

  const onInstallClick = () => {
    logEvent({
      event_name: LogEvent.ClickReaderInstallExtension,
      extra: JSON.stringify({ browser }),
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.ambient} aria-hidden />
      <div className={styles.stickyShell}>
        <div className="z-10 relative flex h-fit w-full max-w-[24rem] shrink-0 flex-col items-center gap-3 rounded-16 p-6 text-center">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            color={TypographyColor.Primary}
            bold
          >
            Read it right here.
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="!mt-0 max-w-[21rem]"
          >
            Install the extension to open articles inside daily.dev with the
            discussion next to them.
          </Typography>
          <div className="mt-1 flex w-full flex-col items-center gap-2">
            <Button
              tag="a"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className="min-w-[8.5rem]"
              href={downloadBrowserExtension}
              target="_blank"
              rel="noopener noreferrer"
              icon={<BrowserIcon />}
              onClick={onInstallClick}
            >
              {installButtonLabel}
            </Button>
            {onOptOut ? (
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Medium}
                className="min-w-[8.5rem]"
                onClick={onOptOut}
              >
                Don&apos;t ask again, open new tab
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
