import type { ReactElement } from 'react';
import React from 'react';
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
import { downloadBrowserExtension, isChrome } from '../../lib/constants';
import { ChromeIcon, EdgeIcon } from '../../components/icons';
import styles from './EmbeddedBrowsingWebPrompt.module.css';

/**
 * Webapp prompt shown when the daily.dev extension isn't installed in this
 * browser. The "extension installed but permission not granted" case is
 * handled inside the iframe itself (`packages/extension/src/frame/render.ts`)
 * so the Enable click carries the user gesture Chrome requires.
 */
export function EmbeddedBrowsingWebPrompt(): ReactElement {
  const isChromeBrowser = isChrome();
  const BrowserIcon = isChromeBrowser ? ChromeIcon : EdgeIcon;
  const installButtonLabel = isChromeBrowser
    ? 'Install Chrome extension'
    : 'Install Edge extension';

  return (
    <div className={styles.root}>
      <div className={styles.ambient} aria-hidden />
      <div className={styles.stickyShell}>
        <div className="z-10 relative flex h-fit w-full max-w-[40rem] shrink-0 flex-col items-center gap-3 rounded-16 p-6 text-center">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            color={TypographyColor.Primary}
            bold
          >
            Enable embedded browsing
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="!mt-0"
          >
            Preview and open sites directly inside daily.dev. To use this
            feature, install the daily.dev browser extension.
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
            >
              {installButtonLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
