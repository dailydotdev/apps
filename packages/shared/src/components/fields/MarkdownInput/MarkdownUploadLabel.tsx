import React, { ReactElement } from 'react';
import { ImageIcon } from '../../icons';
import { Loader } from '../../Loader';

interface MarkdownInputFooterProps {
  uploadingCount: number;
  uploadedCount: number;
}

export function MarkdownUploadLabel({
  uploadingCount,
  uploadedCount,
}: MarkdownInputFooterProps): ReactElement {
  if (uploadingCount === 0) {
    return (
      <>
        <ImageIcon />
        <span className="hidden laptop:flex">
          Attach images by dragging & dropping
        </span>
      </>
    );
  }

  return (
    <>
      <Loader
        className="btn-loader"
        innerClassName="before:border-t-theme-color-cabbage after:border-theme-color-cabbage"
      />
      Uploading in progress
      {uploadingCount > 1 ? ` (${uploadedCount}/${uploadingCount})` : ''}
    </>
  );
}
