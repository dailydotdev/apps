import type { ReactElement } from 'react';
import React from 'react';
import { TextField } from '../../fields/TextField';
import { Loader } from '../../Loader';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { OpenLinkIcon } from '../../icons';
import {
  previewImageClass,
  WritePreviewContainer,
  WritePreviewContent,
} from './common';
import { Button, ButtonVariant } from '../../buttons/Button';

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
        <span className="text-text-quaternary typo-caption1 absolute left-2 top-2">
          Fetching preview, please hold...
        </span>
        <div className="typo-footnote flex flex-1 flex-col">
          <div className="flex-flex-col relative">
            <ElementPlaceholder className="rounded-12 h-2 w-5/6" />
            <ElementPlaceholder className="rounded-12 mt-3 h-2 w-1/2" />
          </div>
        </div>
        <div className={previewImageClass} />
        <Button
          variant={ButtonVariant.Tertiary}
          icon={<OpenLinkIcon />}
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
