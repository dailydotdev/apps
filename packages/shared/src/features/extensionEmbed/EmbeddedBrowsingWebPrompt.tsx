import type { CSSProperties, ReactElement } from 'react';
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

export type EmbeddedBrowsingWebPromptProps = {
  onEnablePreview?: () => void;
  isPreviewUnavailable?: boolean;
  unavailablePreviewUrl?: string;
};

const ambientBaseStyle: CSSProperties = {
  background:
    'repeating-linear-gradient(120deg, color-mix(in srgb, var(--theme-border-subtlest-tertiary) 12%, transparent) 0, color-mix(in srgb, var(--theme-border-subtlest-tertiary) 12%, transparent) 0.75rem, transparent 0.75rem, transparent 1.5rem), linear-gradient(180deg, color-mix(in srgb, var(--theme-text-tertiary) 5%, transparent), color-mix(in srgb, var(--theme-border-subtlest-tertiary) 6%, transparent))',
  backgroundSize: '190% 190%, 100% 100%',
  willChange: 'background-position',
};

const ambientOverlayStyle: CSSProperties = {
  background:
    'repeating-linear-gradient(120deg, transparent 0, transparent 1.75rem, color-mix(in srgb, var(--theme-text-tertiary) 4%, transparent) 1.75rem, color-mix(in srgb, var(--theme-text-tertiary) 4%, transparent) 2.5rem)',
  backgroundSize: '220% 220%',
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

  let bodyCopy: string;
  if (isPreviewUnavailable) {
    bodyCopy = 'This site blocks embedded previews.';
  } else if (onEnablePreview) {
    bodyCopy =
      'Let daily.dev load and preview sites inside the app. (Only affects embedded pages.)';
  } else {
    bodyCopy =
      'Preview and open sites directly inside daily.dev. To use this feature, install the daily.dev browser extension.';
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
        {isChromeBrowser
          ? 'Install Chrome extension'
          : 'Install Edge extension'}
      </Button>
    );
  }

  return (
    <div className="relative flex h-full min-h-[28rem] w-full flex-1 flex-col items-center justify-center self-stretch overflow-visible tablet:items-stretch tablet:justify-start">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-embed-stripe-shift overflow-hidden opacity-[0.44] motion-reduce:animate-none"
        style={ambientBaseStyle}
      >
        <div
          aria-hidden
          className="absolute inset-0 animate-embed-stripe-shift-reverse opacity-24 motion-reduce:animate-none motion-reduce:opacity-[0.18]"
          style={ambientOverlayStyle}
        />
      </div>
      <div className="static z-2 flex w-full shrink-0 items-center justify-center p-6 tablet:sticky tablet:top-[50vh] tablet:-translate-y-1/2">
        <div className="z-10 relative flex h-fit w-full max-w-[40rem] shrink-0 flex-col items-center gap-3 rounded-16 p-6 text-center">
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
            {bodyCopy}
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
