import React, { useCallback, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { TextField } from '../fields/TextField';
import { Typography, TypographyType } from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlusIcon, MiniCloseIcon, VIcon } from '../icons';
import { IconSize } from '../Icon';
import type { UserSocialLink } from '../../lib/user';
import { detectPlatform } from '../../features/organizations/utils/platformDetection';
import type { SocialPlatform } from '../../lib/socialLink';
import {
  getPlatformIcon,
  getPlatformLabel,
  PLATFORM_LABELS,
} from '../../lib/socialLink';

export interface SocialLinksInputProps {
  name: string;
  label?: string;
  hint?: string;
}

interface SocialLinkDisplay {
  url: string;
  platform: string;
  icon: ReactElement;
  label: string;
}

/**
 * Map SocialMediaType enum value to our platform identifier
 */
const SOCIAL_TYPE_TO_PLATFORM: Record<string, SocialPlatform> = {
  github: 'github',
  linkedin: 'linkedin',
  x: 'twitter',
  youtube: 'youtube',
  stackoverflow: 'stackoverflow',
  reddit: 'reddit',
  roadmap: 'roadmap',
  codepen: 'codepen',
  mastodon: 'mastodon',
  bluesky: 'bluesky',
  threads: 'threads',
  hashnode: 'hashnode',
};

/**
 * Map platform detection result to our platform identifier
 */
const mapDetectedPlatform = (
  detected: ReturnType<typeof detectPlatform>,
): SocialPlatform | null => {
  if (!detected) {
    return null;
  }
  const socialType = detected.socialType?.toLowerCase();
  return socialType ? SOCIAL_TYPE_TO_PLATFORM[socialType] || null : null;
};

/**
 * Get display info for a social link
 */
const getSocialLinkDisplay = (link: UserSocialLink): SocialLinkDisplay => {
  return {
    url: link.url,
    platform: link.platform,
    icon: getPlatformIcon(link.platform, IconSize.Small),
    label: getPlatformLabel(link.platform),
  };
};

export function SocialLinksInput({
  name,
  label = 'Links',
  hint = 'Connect your profiles across the web',
}: SocialLinksInputProps): ReactElement {
  const { control } = useFormContext();
  const {
    field: { value = [], onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  const [url, setUrl] = useState('');

  const links: UserSocialLink[] = useMemo(() => value || [], [value]);

  // Detect platform as user types
  const detected = useMemo(() => detectPlatform(url), [url]);
  const detectedPlatform = useMemo(
    () => mapDetectedPlatform(detected),
    [detected],
  );
  const detectedLabel = detectedPlatform
    ? PLATFORM_LABELS[detectedPlatform]
    : null;

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
    },
    [],
  );

  const handleAdd = useCallback(() => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return;
    }

    // Basic URL validation
    try {
      const parsedUrl = new URL(
        trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`,
      );
      const normalizedUrl = parsedUrl.href;

      // Check if URL already exists
      if (
        links.some(
          (link) => link.url.toLowerCase() === normalizedUrl.toLowerCase(),
        )
      ) {
        return;
      }

      const newLink: UserSocialLink = {
        url: normalizedUrl,
        platform: detectedPlatform || 'other',
      };

      onChange([...links, newLink]);
      setUrl('');
    } catch {
      // Invalid URL, don't add
    }
  }, [url, detectedPlatform, links, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      const newLinks = [...links];
      newLinks.splice(index, 1);
      onChange(newLinks);
    },
    [links, onChange],
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
        type="url"
        inputId="socialLinkUrl"
        label="Add link"
        placeholder="Paste a URL (e.g., github.com/username)"
        value={url}
        onChange={handleUrlChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        }}
        fieldType="secondary"
        actionButton={
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.XSmall}
            icon={<PlusIcon />}
            onClick={handleAdd}
            disabled={!url.trim()}
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

      {/* Link list */}
      {displayLinks.length > 0 && (
        <div className="flex flex-col gap-2">
          {displayLinks.map((link, index) => (
            <div
              key={link.url}
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
