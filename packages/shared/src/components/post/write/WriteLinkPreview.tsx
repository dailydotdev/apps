import type { FormEventHandler, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { TextField } from '../../fields/TextField';
import { LinkIcon, OpenLinkIcon } from '../../icons';
import { SourceAvatar } from '../../profile/source';
import { Image } from '../../image/Image';
import {
  previewImageClass,
  WritePreviewContainer,
  WritePreviewContent,
} from './common';
import type { ExternalLinkPreview } from '../../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { isSourceUserSource } from '../../../graphql/sources';
import Link from '../../utilities/Link';
import { webappUrl } from '../../../lib/constants';
import { TimeFormatType } from '../../../lib/dateFormat';
import { DateFormat } from '../../utilities';
import { Separator } from '../../cards/common/common';

interface WriteLinkPreviewProps {
  link: string;
  preview: ExternalLinkPreview;
  onLinkChange?: FormEventHandler<HTMLInputElement>;
  className?: string;
  showPreviewLink?: boolean;
  isMinimized?: boolean;
  variant?: 'default' | 'modal';
}

export function WriteLinkPreview({
  link,
  preview,
  onLinkChange,
  className,
  isMinimized,
  showPreviewLink = true,
  variant = 'default',
}: WriteLinkPreviewProps): ReactElement {
  return (
    <>
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
        {preview.title && (
          <WritePreviewContent className={isMinimized && '!px-3 !py-2'}>
            <div className="flex flex-1 flex-col typo-footnote">
              <span className="line-clamp-2 font-bold">{preview.title}</span>
              {preview.source?.id !== 'unknown' &&
                (isMinimized ? (
                  <SourceAvatar
                    size={ProfileImageSize.Small}
                    source={preview.source}
                    className="absolute right-24 mr-4 mt-1"
                  />
                ) : (
                  <span className="mt-1 flex flex-row items-center">
                    <SourceAvatar
                      size={ProfileImageSize.Small}
                      source={preview.source}
                    />
                    <span className="text-text-tertiary">
                      {preview.source?.name}
                    </span>
                  </span>
                ))}
            </div>
            {preview.image && (
              <Image
                className={previewImageClass}
                src={preview.image}
                alt={`${preview.title}`}
              />
            )}
            {!isMinimized && (
              <Button
                icon={<OpenLinkIcon />}
                variant={ButtonVariant.Tertiary}
                type="button"
                tag="a"
                target="_blank"
                rel="noopener noreferrer"
                href={link}
              />
            )}
          </WritePreviewContent>
        )}
      </WritePreviewContainer>

      {preview.relatedPublicPosts?.length > 0 && (
        <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float py-4">
          <Typography bold type={TypographyType.Body} className="px-4">
            This link has already been shared here:
          </Typography>

          <div
            className={classNames(
              'flex flex-col gap-2 overflow-x-hidden overflow-y-scroll px-4',
              variant === 'modal' ? 'max-h-52 tablet:max-h-28' : 'max-h-52',
            )}
          >
            {preview.relatedPublicPosts.map((post) => {
              const isUserSource = isSourceUserSource(post.source);

              return (
                <div key={post.id} className="flex items-center gap-4">
                  {isUserSource ? (
                    <ProfilePicture
                      user={post.author}
                      size={ProfileImageSize.Large}
                      nativeLazyLoading
                    />
                  ) : (
                    <SourceAvatar source={post.source} className="!mr-0" />
                  )}

                  <div className="flex flex-1 flex-col truncate">
                    <Typography bold truncate type={TypographyType.Footnote}>
                      {post.title ?? preview.title}
                    </Typography>
                    <Typography
                      truncate
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      <DateFormat
                        date={new Date(post.createdAt)}
                        type={TimeFormatType.Post}
                      />
                      <Separator />
                      {isUserSource
                        ? `@${post.author.username}`
                        : post.source.name}
                    </Typography>
                  </div>

                  <Link href={`${webappUrl}posts/${post.id}`} passHref>
                    <Button
                      tag="a"
                      target="_blank"
                      className="ml-auto"
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Small}
                    >
                      View post
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
