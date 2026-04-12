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
import { downloadBrowserExtension } from '../../lib/constants';
import styles from './EmbeddedBrowsingWebPrompt.module.css';

export type EmbeddedBrowsingWebPromptProps = {
  onDismiss?: () => void;
  onEnablePreview?: () => void;
  isPreviewUnavailable?: boolean;
  unavailablePreviewUrl?: string;
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
}: EmbeddedBrowsingWebPromptProps): ReactElement {
  const externalPreviewUrl =
    unavailablePreviewUrl && unavailablePreviewUrl.length > 0
      ? unavailablePreviewUrl
      : null;
  const showUnavailableActions = isPreviewUnavailable && !!externalPreviewUrl;

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
    primaryAction = (
      <Button
        tag="a"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="min-w-[8.5rem]"
        href={downloadBrowserExtension}
        target="_blank"
        rel="noopener noreferrer"
      >
        Enable
      </Button>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.ambient} aria-hidden />
      <div className={styles.stickyShell}>
        <div className="z-10 relative flex h-fit w-full max-w-[40rem] shrink-0 flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 text-center shadow-2">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            color={TypographyColor.Primary}
            bold
          >
            {isPreviewUnavailable
              ? 'Preview not available'
              : 'Enable embedded browsing'}
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="!mt-0"
          >
            {isPreviewUnavailable
              ? 'This site blocks embedded previews.'
              : 'To load websites inside daily.dev, allow this extension to modify response headers on embedded pages.'}
          </Typography>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            {primaryAction}
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
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="!mt-0"
          >
            {isPreviewUnavailable
              ? 'Open the full page in a new tab to keep reading.'
              : 'This is optional and only applies to pages embedded by daily.dev.'}
          </Typography>
        </div>
      </div>
    </div>
  );
}
