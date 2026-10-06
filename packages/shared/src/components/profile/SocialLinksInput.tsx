import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import type { ForwardedRef, ReactElement } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { TextField } from '../fields/TextField';
import { Typography, TypographyType } from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlusIcon, MiniCloseIcon, VIcon } from '../icons';
import { IconSize } from '../Icon';
import type { UserSocialLink } from '../../lib/user';
import type { SocialLinkDisplay } from '../../lib/socialLink';
import {
  detectUserPlatform,
  getPlatformIcon,
  getPlatformLabel,
  isSameSocialLinkUrl,
  normalizeSocialLinkUrl,
  PLATFORM_LABELS,
} from '../../lib/socialLink';
import { useToastNotification } from '../../hooks/useToastNotification';
import { ElementPlaceholder } from '../ElementPlaceholder';

export interface SocialLinksInputProps {
  name: string;
  label?: string;
  hint?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export interface SocialLinksInputHandle {
  flushPendingUrl: () => boolean;
}

/**
 * Get display info for a social link
 */
const getSocialLinkDisplay = (link: UserSocialLink): SocialLinkDisplay => {
  return {
    id: link.platform,
    url: link.url,
    platform: link.platform,
    icon: getPlatformIcon(link.platform, IconSize.Small),
    label: getPlatformLabel(link.platform),
  };
};

function SocialLinksInputComponent(
  {
    name,
    label = 'Links',
    hint = "Paste any URL and we'll auto-detect the platform",
    isLoading = false,
    isError = false,
  }: SocialLinksInputProps,
  ref: ForwardedRef<SocialLinksInputHandle>,
): ReactElement {
  const { clearErrors, control, setError } = useFormContext();
  const {
    field: { value = [], onBlur, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  const [url, setUrl] = useState('');
  const { displayToast } = useToastNotification();

  const links: UserSocialLink[] = useMemo(() => value || [], [value]);

  // Detect platform as user types
  const detectedPlatform = detectUserPlatform(url);
  const detectedLabel = detectedPlatform
    ? PLATFORM_LABELS[detectedPlatform]
    : null;

  const updateUrl = useCallback(
    (nextUrl: string) => {
      setUrl(nextUrl);
      clearErrors(name);
    },
    [clearErrors, name],
  );

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUrl(e.target.value);
  };

  const commitPendingUrl = useCallback(
    ({ allowDuplicate = false } = {}) => {
      const trimmedUrl = url.trim();

      if (!trimmedUrl) {
        clearErrors(name);
        return true;
      }

      const normalizedUrl = normalizeSocialLinkUrl(trimmedUrl);
      if (!normalizedUrl) {
        setError(name, {
          type: 'manual',
          message: 'Please enter a valid URL',
        });
        return false;
      }

      const isDuplicate = links.some((link) =>
        isSameSocialLinkUrl(link.url, normalizedUrl),
      );

      if (isDuplicate) {
        displayToast('This link has already been added');

        if (allowDuplicate) {
          updateUrl('');
        }

        return allowDuplicate;
      }

      const platform = detectUserPlatform(trimmedUrl);

      onChange([
        ...links,
        {
          url: normalizedUrl,
          platform: platform || 'other',
        },
      ]);
      updateUrl('');
      clearErrors(name);

      return true;
    },
    [
      clearErrors,
      displayToast,
      links,
      name,
      onChange,
      setError,
      updateUrl,
      url,
    ],
  );

  useImperativeHandle(
    ref,
    () => ({
      flushPendingUrl: () => commitPendingUrl({ allowDuplicate: true }),
    }),
    [commitPendingUrl],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newLinks = [...links];
      newLinks.splice(index, 1);
      onChange(newLinks);
      clearErrors(name);
    },
    [clearErrors, links, name, onChange],
  );

  const displayLinks = useMemo(() => links.map(getSocialLinkDisplay), [links]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <Typography type={TypographyType.Body} bold>
          {label}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          className="text-text-secondary"
        >
          {hint}
        </Typography>
      </div>

      {/* URL input */}
      <TextField
        type="text"
        inputMode="url"
        inputId="socialLinkUrl"
        label="Add link"
        placeholder="Paste a URL (e.g., github.com/username)"
        value={url}
        onChange={handleUrlChange}
        onBlur={onBlur}
        disabled={isLoading || isError}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitPendingUrl();
          }
        }}
        valid={!error}
        fieldType="secondary"
        actionButton={
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.XSmall}
            icon={<PlusIcon />}
            onClick={() => commitPendingUrl()}
            disabled={isLoading || isError || !url.trim()}
          >
            Add
          </Button>
        }
      />

      {/* Detection feedback */}
      {detectedLabel && (
        <div className="bg-status-success/10 flex items-center gap-2 rounded-10 px-3 py-2">
          <VIcon className="text-status-success" size={IconSize.Small} />
          <Typography type={TypographyType.Footnote}>
            {detectedLabel} detected
          </Typography>
        </div>
      )}

      {/* Loading / failed to load */}
      {isLoading && (
        <div className="flex flex-col gap-2">
          <ElementPlaceholder className="h-14 rounded-12" />
          <ElementPlaceholder className="h-14 rounded-12" />
        </div>
      )}

      {isError && (
        <Typography
          type={TypographyType.Footnote}
          className="text-status-error"
        >
          We could not load your links. Refresh the page to try again.
        </Typography>
      )}

      {/* Link list */}
      {!isLoading && !isError && displayLinks.length > 0 && (
        <div className="flex flex-col gap-2">
          {displayLinks.map((link, index) => (
            <div
              key={link.url}
              data-testid="social-link-row"
              className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-3"
            >
              {/* Platform icon */}
              <div className="flex-shrink-0 text-text-secondary">
                {link.icon}
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Typography type={TypographyType.Callout} bold>
                  {link.label}
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  className="truncate text-text-tertiary"
                >
                  {link.url}
                </Typography>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="flex-shrink-0 rounded-8 p-1 text-text-quaternary transition-colors hover:bg-surface-float hover:text-text-primary"
                aria-label="Remove link"
              >
                <MiniCloseIcon size={IconSize.Medium} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error?.message && (
        <Typography
          type={TypographyType.Footnote}
          className="text-status-error"
        >
          {error.message}
        </Typography>
      )}
    </div>
  );
}

export const SocialLinksInput = forwardRef(SocialLinksInputComponent);
SocialLinksInput.displayName = 'SocialLinksInput';
