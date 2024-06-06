import React, { FormEventHandler, ReactElement } from 'react';
import { TextField } from '../../fields/TextField';
import { LinkIcon, OpenLinkIcon } from '../../icons';
import { SourceAvatar } from '../../profile/source';
import { Image } from '../../image/Image';
import {
  previewImageClass,
  WritePreviewContainer,
  WritePreviewContent,
} from './common';
import { ExternalLinkPreview } from '../../../graphql/posts';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ProfileImageSize } from '../../ProfilePicture';

interface WriteLinkPreviewProps {
  link: string;
  preview: ExternalLinkPreview;
  onLinkChange?: FormEventHandler<HTMLInputElement>;
  className?: string;
  showPreviewLink?: boolean;
  isMinimized?: boolean;
}

export function WriteLinkPreview({
  link,
  preview,
  onLinkChange,
  className,
  isMinimized,
  showPreviewLink = true,
}: WriteLinkPreviewProps): ReactElement {
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
      {preview.title && preview.image && (
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
          <Image
            className={previewImageClass}
            src={preview.image}
            alt={`${preview.title}`}
          />
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
  );
}
