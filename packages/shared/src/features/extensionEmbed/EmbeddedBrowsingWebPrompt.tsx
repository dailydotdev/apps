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
import styles from './EmbeddedBrowsingWebPrompt.module.css';
import { ChromeIcon, EdgeIcon, MagicIcon } from '../../components/icons';

export type EmbeddedBrowsingWebPromptProps = {
  onEnablePreview?: () => void;
  isPreviewUnavailable?: boolean;
  unavailablePreviewUrl?: string;
  onUseClassicView?: () => void;
};

/**
 * Webapp fallback when the extension install id is unknown. Copy and structure
 * should stay aligned with `packages/extension/src/frame/render.ts`
 * (`renderPermissionPrompt`).
 */
export function EmbeddedBrowsingWebPrompt({
  onEnablePreview,
  isPreviewUnavailable = false,
  unavailablePreviewUrl,
  onUseClassicView,
}: EmbeddedBrowsingWebPromptProps): ReactElement {
  const externalPreviewUrl =
    unavailablePreviewUrl && unavailablePreviewUrl.length > 0
      ? unavailablePreviewUrl
      : null;
  const showUnavailableActions = isPreviewUnavailable && !!externalPreviewUrl;
  const title = isPreviewUnavailable
    ? 'Preview not available'
    : 'Enable embedded browsing';
  let description =
    'Preview and open sites directly inside daily.dev. To use this feature, install the daily.dev browser extension.';

  if (isPreviewUnavailable) {
    description = 'This site blocks embedded previews.';
  } else if (onEnablePreview) {
    description =
      'Let daily.dev load and preview sites inside the app. (Only affects embedded pages.)';
  }

  let primaryAction: ReactElement;
  if (showUnavailableActions) {
    primaryAction = (
      <Button
        tag="a"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="min-w-[8.5rem]"
        href={externalPreviewUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open externally
      </Button>
    );
  } else if (onEnablePreview) {
    primaryAction = (
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="min-w-[8.5rem]"
        onClick={onEnablePreview}
      >
        Enable
      </Button>
    );
  } else {
    const isChromeBrowser = isChrome();
    const BrowserIcon = isChromeBrowser ? ChromeIcon : EdgeIcon;
    const installButtonLabel = isChromeBrowser
      ? 'Install Chrome extension'
      : 'Install Edge extension';
    primaryAction = (
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
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.ambient} aria-hidden />
      <div className={styles.stickyShell}>
        <div className="z-10 pointer-events-auto relative flex h-fit w-full max-w-[40rem] shrink-0 flex-col items-center gap-3 rounded-16 p-6 text-center">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            color={TypographyColor.Primary}
            bold
          >
            {title}
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="!mt-0"
          >
            {description}
          </Typography>
          <div className="mt-1 flex w-full flex-col items-center gap-2">
            {primaryAction}
            {onUseClassicView ? (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Medium}
                className="min-w-[8.5rem]"
                icon={<MagicIcon />}
                onClick={onUseClassicView}
              >
                Summarize
              </Button>
            ) : null}
          </div>
          {isPreviewUnavailable && externalPreviewUrl ? (
            <Typography
              tag={TypographyTag.Link}
              type={TypographyType.Footnote}
              className="max-w-full break-all"
              href={externalPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {externalPreviewUrl}
            </Typography>
          ) : null}
          {isPreviewUnavailable ? (
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
              className="!mt-0"
            >
              Open the full page in a new tab to keep reading.
            </Typography>
          ) : null}
        </div>
      </div>
    </div>
  );
}
