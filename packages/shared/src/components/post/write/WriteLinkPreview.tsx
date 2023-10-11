import React, { FormEventHandler, ReactElement } from 'react';
import { TextField } from '../../fields/TextField';
import LinkIcon from '../../icons/Link';
import { SourceAvatar } from '../../profile/source';
import { Image } from '../../image/Image';
import { Button } from '../../buttons/Button';
import OpenLinkIcon from '../../icons/OpenLink';
import {
  previewImageClass,
  WritePreviewContainer,
  WritePreviewContent,
} from './common';
import { ExternalLinkPreview } from '../../../graphql/posts';

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
        <WritePreviewContent className={isMinimized && '!py-2 !px-3'}>
          <div className="flex flex-col flex-1 typo-footnote">
            <span className="font-bold line-clamp-2">{preview.title}</span>
            {preview.source?.id !== 'unknown' &&
              (isMinimized ? (
                <SourceAvatar
                  size="small"
                  source={preview.source}
                  className="absolute right-24 mt-1 mr-4"
                />
              ) : (
                <span className="flex flex-row items-center mt-1">
                  <SourceAvatar size="small" source={preview.source} />
                  <span className="text-theme-label-tertiary">
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
              className="btn-tertiary"
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
