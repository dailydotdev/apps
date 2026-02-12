import type { FormEventHandler, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { TextField } from '../../fields/TextField';
import { LinkIcon, TwitterIcon, OpenLinkIcon } from '../../icons';
import { Image } from '../../image/Image';
import {
  previewImageClass,
  WritePreviewContainer,
  WritePreviewContent,
} from './common';
import type { ExternalLinkPreview } from '../../../graphql/posts';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ProfilePicture, ProfileImageSize } from '../../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';

interface WriteTweetPreviewProps {
  link: string;
  preview: ExternalLinkPreview;
  onLinkChange?: FormEventHandler<HTMLInputElement>;
  className?: string;
  showPreviewLink?: boolean;
  isMinimized?: boolean;
  tweetId?: string;
  tweetUsername?: string;
}

/**
 * Twitter/X-specific link preview component.
 * Shows a Twitter-styled preview when a Twitter URL is detected.
 */
export function WriteTweetPreview({
  link,
  preview,
  onLinkChange,
  className,
  isMinimized,
  showPreviewLink = true,
  tweetId,
  tweetUsername,
}: WriteTweetPreviewProps): ReactElement {
  const tweetUrl =
    tweetId && tweetUsername
      ? `https://x.com/${tweetUsername}/status/${tweetId}`
      : link;

  return (
    <WritePreviewContainer className={className}>
      {showPreviewLink && (
        <TextField
          leftIcon={<LinkIcon />}
          label="URL"
          type="url"
          name="url"
          inputId="preview_url"
          fieldType="tertiary"
          className={{ container: 'w-full' }}
          value={link}
          onInput={onLinkChange}
        />
      )}

      {/* Twitter-styled preview */}
      <WritePreviewContent
        className={classNames(
          'relative',
          isMinimized && '!px-3 !py-2',
        )}
      >
        {/* X logo badge */}
        <div className="absolute right-3 top-3">
          <TwitterIcon className="size-5 text-text-tertiary" />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {/* Author info */}
          {preview.source?.id !== 'unknown' && (
            <div className="flex items-center gap-2">
              {preview.source?.image ? (
                <ProfilePicture
                  user={{ image: preview.source.image, id: preview.source.id }}
                  size={ProfileImageSize.Medium}
                  nativeLazyLoading
                />
              ) : (
                <div className="size-8 rounded-full bg-surface-secondary" />
              )}
              <div className="flex flex-col">
                <Typography bold type={TypographyType.Footnote}>
                  {preview.source?.name || 'Twitter User'}
                </Typography>
                {tweetUsername && (
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    @{tweetUsername}
                  </Typography>
                )}
              </div>
            </div>
          )}

          {/* Tweet content preview */}
          <Typography
            type={TypographyType.Body}
            className={classNames('line-clamp-3', isMinimized && 'line-clamp-2')}
          >
            {preview.title}
          </Typography>

          {/* Processing notice */}
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
            className="mt-1"
          >
            Tweet content will be fetched after submission
          </Typography>
        </div>

        {/* Tweet image preview if available */}
        {preview.image && !isMinimized && (
          <Image
            className={previewImageClass}
            src={preview.image}
            alt="Tweet media"
          />
        )}

        {/* View on X button */}
        {!isMinimized && (
          <Button
            icon={<OpenLinkIcon />}
            variant={ButtonVariant.Tertiary}
            type="button"
            tag="a"
            target="_blank"
            rel="noopener noreferrer"
            href={tweetUrl}
            aria-label="View on X"
          />
        )}
      </WritePreviewContent>
    </WritePreviewContainer>
  );
}

/**
 * Checks if a URL is a Twitter/X URL
 */
export function isTwitterUrl(url: string): boolean {
  if (!url) return false;
  const twitterPattern =
    /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i;
  return twitterPattern.test(url);
}

/**
 * Extracts tweet ID and username from a Twitter/X URL
 */
export function extractTweetInfo(url: string): {
  tweetId: string | null;
  username: string | null;
} {
  if (!url) return { tweetId: null, username: null };

  const match = url.match(
    /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/i,
  );

  if (match) {
    return {
      username: match[1],
      tweetId: match[2],
    };
  }

  return { tweetId: null, username: null };
}

export default WriteTweetPreview;
