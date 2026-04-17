import type { CSSProperties, ReactElement, ReactNode } from 'react';
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

interface PromptContent {
  title: string;
  body: string;
  action: ReactElement;
  footer?: ReactNode;
}

const actionClassName = 'min-w-[8.5rem]';

const getUnavailableContent = (externalUrl: string | null): PromptContent => ({
  title: 'Preview not available',
  body: 'This site blocks embedded previews.',
  action: externalUrl ? (
    <Button
      tag="a"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className={actionClassName}
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Open externally
    </Button>
  ) : (
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className={actionClassName}
      disabled
    >
      Open externally
    </Button>
  ),
  footer: (
    <>
      {externalUrl ? (
        <Typography
          tag={TypographyTag.Link}
          type={TypographyType.Footnote}
          className="max-w-full break-all"
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {externalUrl}
        </Typography>
      ) : null}
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
        className="!mt-0"
      >
        Open the full page in a new tab to keep reading.
      </Typography>
    </>
  ),
});

const getEnableContent = (onEnable: () => void): PromptContent => ({
  title: 'Enable embedded browsing',
  body: 'Let daily.dev load and preview sites inside the app. (Only affects embedded pages.)',
  action: (
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className={actionClassName}
      onClick={onEnable}
    >
      Enable
    </Button>
  ),
});

const getInstallContent = (): PromptContent => {
  const isChromeBrowser = isChrome();
  const BrowserIcon = isChromeBrowser ? ChromeIcon : EdgeIcon;
  const label = isChromeBrowser
    ? 'Install Chrome extension'
    : 'Install Edge extension';

  return {
    title: 'Enable embedded browsing',
    body: 'Preview and open sites directly inside daily.dev. To use this feature, install the daily.dev browser extension.',
    action: (
      <Button
        tag="a"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className={actionClassName}
        href={downloadBrowserExtension}
        target="_blank"
        rel="noopener noreferrer"
        icon={<BrowserIcon />}
      >
        {label}
      </Button>
    ),
  };
};

const resolveContent = ({
  isPreviewUnavailable,
  externalUrl,
  onEnablePreview,
}: {
  isPreviewUnavailable: boolean;
  externalUrl: string | null;
  onEnablePreview?: () => void;
}): PromptContent => {
  if (isPreviewUnavailable) {
    return getUnavailableContent(externalUrl);
  }
  if (onEnablePreview) {
    return getEnableContent(onEnablePreview);
  }
  return getInstallContent();
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
  const externalUrl = unavailablePreviewUrl?.trim() || null;
  const { title, body, action, footer } = resolveContent({
    isPreviewUnavailable,
    externalUrl,
    onEnablePreview,
  });

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
            {title}
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="!mt-0"
          >
            {body}
          </Typography>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            {action}
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}
