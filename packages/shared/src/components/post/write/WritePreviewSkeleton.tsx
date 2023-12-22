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
        <span className="absolute left-2 top-2 text-theme-label-quaternary typo-caption1">
          Fetching preview, please hold...
        </span>
        <div className="flex flex-1 flex-col typo-footnote">
          <div className="flex-flex-col relative">
            <ElementPlaceholder className="h-2 w-5/6 rounded-12" />
            <ElementPlaceholder className="mt-3 h-2 w-1/2 rounded-12" />
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
