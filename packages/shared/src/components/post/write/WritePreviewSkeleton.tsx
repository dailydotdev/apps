import React, { ReactElement } from 'react';
import { TextField } from '../../fields/TextField';
import { Loader } from '../../Loader';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { Button } from '../../buttons/Button';
import OpenLinkIcon from '../../icons/OpenLink';
import {
  previewImageClass,
  WritePreviewContainer,
  WritePreviewContent,
} from './common';

interface WritePreviewSkeletonProps {
  link: string;
  className?: string;
}

export function WritePreviewSkeleton({
  link,
  className,
}: WritePreviewSkeletonProps): ReactElement {
  return (
    <WritePreviewContainer className={className}>
      <TextField
        leftIcon={<Loader className="mr-2" />}
        label="URL"
        type="url"
        inputId="preview_url"
        fieldType="tertiary"
        className={{ container: 'w-full' }}
        value={link}
      />
      <WritePreviewContent>
        <span className="absolute top-2 left-2 typo-caption1 text-theme-label-quaternary">
          Fetching preview, please hold...
        </span>
        <div className="flex flex-col flex-1 typo-footnote">
          <div className="relative flex-flex-col">
            <ElementPlaceholder className="w-5/6 h-2 rounded-12" />
            <ElementPlaceholder className="mt-3 w-1/2 h-2 rounded-12" />
          </div>
        </div>
        <div className={previewImageClass} />
        <Button
          icon={<OpenLinkIcon />}
          className="btn-tertiary"
          disabled
          type="button"
          tag="a"
          target="_blank"
          rel="noopener noreferrer"
          href={link}
        />
      </WritePreviewContent>
    </WritePreviewContainer>
  );
}
